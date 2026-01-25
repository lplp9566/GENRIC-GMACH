import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLM_PROVIDER, LlmMessage, LlmProvider } from '../llm/llm.provider';
import { SchemaService } from './schema.service';
import { DbToolsService } from './db-tools.service';
import { schemaHints } from '../schema-hints';
import { schemaKnowledge } from '../schema-knowledge';
import { semanticCatalog } from '../semantic-catalog';
import { QueryResolverService } from './query-resolver.service';

type CacheEntry = {
  expiresAt: number;
  response: { value: unknown } | { rows: unknown[] };
};

type ToolAction =
  | { action: 'list_tables' }
  | { action: 'search_columns'; term: string }
  | { action: 'describe_table'; schema: string; table: string }
  | { action: 'sample_rows'; schema: string; table: string; n?: number }
  | { action: 'plan'; tables: string[]; columns: string[]; filters: string[]; metric: string }
  | { action: 'run_sql'; sql: string; tables_used: string[] }
  | { action: 'self_check'; status: 'ok' | 'retry'; reason: string }
  | { action: 'final'; answer_type: 'value' | 'rows'; value?: unknown; rows?: unknown[] };

type ConversationEntry = {
  role: 'user' | 'assistant';
  content: string;
};

@Injectable()
export class AiAgentService {
  private readonly logger = new Logger(AiAgentService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly memory = new Map<string, ConversationEntry[]>();
  private readonly maxSteps = 6;
  private readonly maxMemoryEntries = 10;
  private readonly maxRepairAttempts = 1;
  private readonly maxParseFixAttempts = 1;
  private readonly logEnabled = process.env.NODE_ENV !== 'production';
  private readonly agentMode = process.env.AI_AGENT_MODE || 'safe';

  constructor(
    private readonly schemaService: SchemaService,
    private readonly dbToolsService: DbToolsService,
    private readonly configService: ConfigService,
    private readonly queryResolverService: QueryResolverService,
    @Inject(LLM_PROVIDER) private readonly llmProvider: LlmProvider,
  ) {}

  async ask(
    question: string,
    conversationId?: string,
  ): Promise<{ value: unknown } | { rows: unknown[] }> {
    const cacheKey = this.getCacheKey(question, conversationId);
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    if (this.agentMode !== 'free') {
      const resolved = this.queryResolverService.resolve(question);
      if (resolved) {
        try {
          if (this.logEnabled) {
            this.logger.log(`Resolver matched: ${resolved.reason}`);
          }
          const maxRows = Number(this.configService.get<string>('AI_QUERY_MAX_ROWS')) || 200;
          const rows = await this.dbToolsService.runSql(
            resolved.sql,
            maxRows,
            /(password|pass|hash|salt|token|secret|api_key|refresh|access)/i,
          );
          const response = this.toResponse(rows);
          this.setCache(cacheKey, response);
          this.storeConversation(conversationId, question, response);
          return response;
        } catch (error) {
          if (this.logEnabled) {
            this.logger.error(`Resolver SQL error: ${(error as Error).message || 'Query failed'}`);
          }
        }
      }
    }

    const schemaInfo = await this.schemaService.getSchemaInfo();
    const conversationContext = this.getConversationContext(conversationId);
    const toolContext: string[] = [];
    const describedTables = new Set<string>();
    const tableHitCounts = new Map<string, number>();
    const describedColumns = new Map<string, string[]>();
    let currentPlan:
      | { tables: string[]; columns: string[]; filters: string[]; metric: string }
      | null = null;
    let hasRunSqlResult = false;
    let hasSelfCheck = false;
    let lastPlanKey = '';
    let repeatedPlanCount = 0;
    let repairAttempts = 0;
    let parseFixAttempts = 0;
    let searchColumnsCount = 0;

    try {
      const tables = await this.dbToolsService.listTables();
      toolContext.push(JSON.stringify({ tool: "list_tables", result: tables }, null, 2));
    } catch (error) {
      toolContext.push(
        JSON.stringify(
          { tool: "list_tables", error: (error as Error).message || "Failed" },
          null,
          2,
        ),
      );
    }

    const searchTerms = this.buildSearchTerms(question);
    for (const term of searchTerms) {
      try {
        const columns = await this.dbToolsService.searchColumns(term);
        toolContext.push(
          JSON.stringify({ tool: 'search_columns', term, result: columns }, null, 2),
        );
      } catch (error) {
        toolContext.push(
          JSON.stringify(
            { tool: 'search_columns', term, error: (error as Error).message || 'Failed' },
            null,
            2,
          ),
        );
      }
    }

    for (let step = 0; step < this.maxSteps; step += 1) {
      const messages = this.buildMessages(question, conversationContext, toolContext);
      let raw = await this.llmProvider.complete(messages);
      if (this.logEnabled) {
        this.logger.log(`LLM raw response (step ${step + 1}): ${raw}`);
      }
      let action: ToolAction | null = null;
      try {
        action = this.parseAction(raw);
      } catch (error) {
        if (parseFixAttempts < this.maxParseFixAttempts) {
          parseFixAttempts += 1;
          raw = await this.llmProvider.complete(
            this.buildFixJsonMessages(raw, question, conversationContext, toolContext),
          );
          try {
            action = this.parseAction(raw);
            if (this.logEnabled) {
              this.logger.log(`LLM fixed response (step ${step + 1}): ${raw}`);
            }
          } catch (parseError) {
            const response = { value: "לא הצלחתי להבין את הבקשה. אפשר לנסח אחרת?" };
            this.setCache(cacheKey, response);
            this.storeConversation(conversationId, question, response);
            return response;
          }
        } else {
          const response = { value: "לא הצלחתי להבין את הבקשה. אפשר לנסח אחרת?" };
          this.setCache(cacheKey, response);
          this.storeConversation(conversationId, question, response);
          return response;
        }
      }

      if (!action) {
        const response = { value: "לא הצלחתי להבין את הבקשה. אפשר לנסח אחרת?" };
        this.setCache(cacheKey, response);
        this.storeConversation(conversationId, question, response);
        return response;
      }

      if (action.action === 'list_tables') {
        if (this.logEnabled) {
          this.logger.log('Action: list_tables');
        }
        const tables = await this.dbToolsService.listTables();
        toolContext.push(JSON.stringify({ tool: 'list_tables', result: tables }, null, 2));
        continue;
      }

      if (action.action === 'search_columns') {
        if (this.logEnabled) {
          this.logger.log(`Action: search_columns term=${action.term}`);
        }
        const columns = await this.dbToolsService.searchColumns(action.term);
        searchColumnsCount += 1;
        for (const colRef of columns) {
          const parts = colRef.split('.');
          if (parts.length >= 2) {
            const tableKey = `${parts[0]}.${parts[1]}`.toLowerCase();
            tableHitCounts.set(tableKey, (tableHitCounts.get(tableKey) || 0) + 1);
          }
        }
        toolContext.push(
          JSON.stringify({ tool: 'search_columns', term: action.term, result: columns }, null, 2),
        );
        if (searchColumnsCount >= 2) {
          const topTable = Array.from(tableHitCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
          if (topTable && !describedTables.has(topTable)) {
            const [schema, table] = topTable.split('.');
            if (schema && table) {
              const tableColumns = await this.dbToolsService.describeTable(schema, table);
              describedTables.add(topTable);
              toolContext.push(
                JSON.stringify(
                  { tool: 'describe_table', schema, table, result: tableColumns },
                  null,
                  2,
                ),
              );
            }
          }
        }
        if (searchColumnsCount >= 3) {
          toolContext.push(
            JSON.stringify(
              {
                tool: 'search_columns',
                warning:
                  'Search repeated. Choose a table from results, call describe_table, then run_sql.',
              },
              null,
              2,
            ),
          );
        }
        continue;
      }

      if (action.action === 'describe_table') {
        if (this.logEnabled) {
          this.logger.log(`Action: describe_table ${action.schema}.${action.table}`);
        }
        const columns = await this.dbToolsService.describeTable(action.schema, action.table);
        describedTables.add(`${action.schema}.${action.table}`.toLowerCase());
        describedColumns.set(
          `${action.schema}.${action.table}`.toLowerCase(),
          columns.map((col) => col.name),
        );
        toolContext.push(
          JSON.stringify(
            { tool: 'describe_table', schema: action.schema, table: action.table, result: columns },
            null,
            2,
          ),
        );
        continue;
      }

      if (action.action === 'plan') {
        if (this.agentMode === 'free') {
          toolContext.push(
            JSON.stringify(
              { tool: 'plan', error: 'Plan not required in free mode. Run SQL directly.' },
              null,
              2,
            ),
          );
          continue;
        }
        const normalizedTables = (action.tables || []).map((t) => t.toLowerCase());
        const missingTables = normalizedTables.filter((t) => !t.includes('.'));
        if (missingTables.length > 0) {
          toolContext.push(
            JSON.stringify(
              { tool: 'plan', error: 'Tables must be schema-qualified (schema.table).' },
              null,
              2,
            ),
          );
          continue;
        }
        for (const tableRef of normalizedTables) {
          if (!describedTables.has(tableRef)) {
            const [schema, table] = tableRef.split('.');
            if (schema && table) {
              const columns = await this.dbToolsService.describeTable(schema, table);
              describedTables.add(tableRef);
              describedColumns.set(
                tableRef,
                columns.map((col) => col.name),
              );
              toolContext.push(
                JSON.stringify(
                  { tool: 'describe_table', schema, table, result: columns },
                  null,
                  2,
                ),
              );
            }
          }
        }
        if (this.isMoneyQuestion(question) && this.isCountMetric(action.metric || '')) {
          toolContext.push(
            JSON.stringify(
              { tool: 'plan', error: 'Money question requires SUM/amount metric, not COUNT.' },
              null,
              2,
            ),
          );
          continue;
        }
        if (this.isMoneyQuestion(question)) {
          const amountCols = this.findAmountColumns(
            describedColumns.get(normalizedTables[0]) || [],
          );
          if (amountCols.length === 0) {
            toolContext.push(
              JSON.stringify(
                { tool: 'plan', error: 'No amount-like columns found for monetary question.' },
                null,
                2,
              ),
            );
            continue;
          }
        }
        const year = this.extractYear(question);
        if (year && !this.planHasYearFilter(action.filters || [])) {
          toolContext.push(
            JSON.stringify(
              { tool: 'plan', error: `Year ${year} requires a date filter.` },
              null,
              2,
            ),
          );
          continue;
        }
        currentPlan = {
          tables: action.tables || [],
          columns: action.columns || [],
          filters: action.filters || [],
          metric: action.metric || '',
        };
        toolContext.push(JSON.stringify({ tool: 'plan', ok: true, plan: currentPlan }, null, 2));

        const planKey = JSON.stringify(currentPlan);
        if (planKey === lastPlanKey) {
          repeatedPlanCount += 1;
        } else {
          repeatedPlanCount = 0;
          lastPlanKey = planKey;
        }

        if (this.agentMode !== 'free' && repeatedPlanCount >= 1 && currentPlan.tables.length > 0) {
          const response = await this.autoRunPlan(
            currentPlan,
            schemaInfo.denyColumnsRe,
            describedColumns,
            question,
          );
          if (response) {
            this.setCache(cacheKey, response);
            this.storeConversation(conversationId, question, response);
            return response;
          }
        }

        continue;
      }

      if (action.action === 'sample_rows') {
        if (this.logEnabled) {
          this.logger.log(`Action: sample_rows ${action.schema}.${action.table} n=${action.n ?? 3}`);
        }
        const rows = await this.dbToolsService.sampleRows(action.schema, action.table, action.n ?? 3);
        toolContext.push(
          JSON.stringify(
            { tool: 'sample_rows', schema: action.schema, table: action.table, result: rows },
            null,
            2,
          ),
        );
        continue;
      }

      if (action.action === 'run_sql') {
        try {
          if (!currentPlan && this.agentMode !== 'free') {
            toolContext.push(
              JSON.stringify(
                { tool: 'run_sql', error: 'Missing plan. Create a plan before running SQL.' },
                null,
                2,
              ),
            );
            continue;
          }
          if (this.logEnabled) {
            this.logger.log(`Action: run_sql tables=${action.tables_used?.join(', ') || ''}`);
            this.logger.log(`SQL: ${action.sql}`);
          }
          const normalized = (action.tables_used || []).map((t) => t.toLowerCase());
          const missing = normalized.filter((t) => !describedTables.has(t));
          if (missing.length > 0) {
            if (this.logEnabled) {
              this.logger.log(`Auto-describe missing tables: ${missing.join(', ')}`);
            }
            for (const tableRef of missing) {
              const [schema, table] = tableRef.split('.');
              if (!schema || !table) {
                continue;
              }
              const columns = await this.dbToolsService.describeTable(schema, table);
              describedTables.add(`${schema}.${table}`.toLowerCase());
              toolContext.push(
                JSON.stringify(
                  { tool: 'describe_table', schema, table, result: columns },
                  null,
                  2,
                ),
              );
            }
          }
          const maxRows = Number(this.configService.get<string>('AI_QUERY_MAX_ROWS')) || 200;
          const rows = await this.dbToolsService.runSql(action.sql, maxRows, schemaInfo.denyColumnsRe);
          if (this.logEnabled) {
            this.logger.log(`SQL rows returned: ${rows.length}`);
          }
          hasRunSqlResult = true;
          hasSelfCheck = false;
          toolContext.push(JSON.stringify({ tool: 'run_sql', result: rows }, null, 2));
          const response = this.toResponse(rows);
          this.setCache(cacheKey, response);
          this.storeConversation(conversationId, question, response);
          return response;
        } catch (error) {
          if (this.logEnabled) {
            this.logger.error(`SQL error: ${(error as Error).message || 'Query failed'}`);
          }
          if (repairAttempts < this.maxRepairAttempts) {
            repairAttempts += 1;
            const message = (error as Error).message || 'Query failed';
            const columnMatch = message.match(/column \"([^\"]+)\" does not exist/i);
            if (columnMatch && action.tables_used?.length) {
              const missingColumn = columnMatch[1];
              for (const tableRef of action.tables_used) {
                const [schema, table] = tableRef.split('.');
                if (!schema || !table) {
                  continue;
                }
                const columns = await this.dbToolsService.describeTable(schema, table);
                describedTables.add(`${schema}.${table}`.toLowerCase());
                toolContext.push(
                  JSON.stringify(
                    {
                      tool: 'describe_table',
                      schema,
                      table,
                      result: columns,
                      note: `Column "${missingColumn}" not found in ${schema}.${table}. Use only listed columns.`,
                    },
                    null,
                    2,
                  ),
                );
              }
            }
            toolContext.push(
              JSON.stringify(
                { tool: 'run_sql', error: (error as Error).message || 'Query failed' },
                null,
                2,
              ),
            );
            continue;
          }
          const response = { value: "הייתה שגיאה בהרצת השאילתה. אפשר לנסח אחרת?" };
          this.setCache(cacheKey, response);
          this.storeConversation(conversationId, question, response);
          return response;
        }
      }

      if (action.action === 'final') {
        if (!hasSelfCheck && this.agentMode !== 'free') {
          toolContext.push(
            JSON.stringify(
              { tool: 'final', error: 'Final answer requires self_check after run_sql.' },
              null,
              2,
            ),
          );
          continue;
        }
        if (action.answer_type !== 'value' && action.answer_type !== 'rows') {
          toolContext.push(
            JSON.stringify(
              { tool: 'final', error: 'answer_type must be value or rows' },
              null,
              2,
            ),
          );
          continue;
        }
        if (!hasRunSqlResult) {
          toolContext.push(
            JSON.stringify(
              { tool: 'final', error: 'Final answer must be based on run_sql result' },
              null,
              2,
            ),
          );
          continue;
        }
        const response =
          action.answer_type === 'value'
            ? { value: action.value ?? null }
            : { rows: Array.isArray(action.rows) ? action.rows.slice(0, 50) : [] };
        this.setCache(cacheKey, response);
        this.storeConversation(conversationId, question, response);
        return response;
      }

      if (action.action === 'self_check') {
        if (this.agentMode === 'free') {
          toolContext.push(
            JSON.stringify(
              { tool: 'self_check', error: 'self_check not required in free mode.' },
              null,
              2,
            ),
          );
          continue;
        }
        if (!hasRunSqlResult) {
          toolContext.push(
            JSON.stringify(
              { tool: 'self_check', error: 'self_check requires run_sql result.' },
              null,
              2,
            ),
          );
          continue;
        }
        if (action.status === 'retry') {
          toolContext.push(
            JSON.stringify(
              { tool: 'self_check', status: 'retry', reason: action.reason },
              null,
              2,
            ),
          );
          continue;
        }
        hasSelfCheck = true;
        toolContext.push(
          JSON.stringify(
            { tool: 'self_check', status: 'ok', reason: action.reason },
            null,
            2,
          ),
        );
        continue;
      }
    }

    const response = { value: "לא הצלחתי להגיע לתשובה. אפשר לנסח אחרת?" };
    this.setCache(cacheKey, response);
    this.storeConversation(conversationId, question, response);
    return response;
  }

  private buildMessages(
    question: string,
    conversationContext: string,
    toolContext: string[],
  ): LlmMessage[] {
    const systemContent = [
      'You are a DB tools agent for PostgreSQL.',
      'You must output JSON only, matching one action schema.',
      'Output must be a single JSON object with double quotes.',
      'Do not include code fences, markdown, or extra text.',
      this.agentMode === 'free'
        ? 'You may run SQL directly after describe_table.'
        : 'First create a plan before running SQL.',
      this.agentMode === 'free'
        ? 'Use search_columns only if you are unsure.'
        : 'Start by using search_columns on key nouns from the question.',
      'If unsure about tables or columns, you must call list_tables and describe_table.',
      'Never invent tables or columns; use tools to discover.',
      'Before running SQL on a table, you must call describe_table at least once.',
      'Allowed actions: list_tables, search_columns, describe_table, sample_rows, plan, run_sql, self_check, final.',
      'For quantitative questions (how many/number/total), prefer COUNT(*) AS value.',
      'Do not add filters unless the user explicitly asks for them.',
      'Hebrew quantitative hints: כמה, מספר, סך הכל, סכום, סהכ.',
      'For "latest/newest" questions, order by a created/created_at/createdAt/date column if available.',
      'For monetary totals, prefer amount/total/sum/balance/equity columns discovered via search_columns.',
      this.agentMode === 'free'
        ? 'Return final only after run_sql.'
        : 'Never answer "final" unless you already ran run_sql successfully.',
      this.agentMode === 'free'
        ? 'Prefer run_sql for the answer; avoid speculation.'
        : 'Never return answer_type "error"; use tools to investigate and then run_sql.',
      this.agentMode === 'free'
        ? 'self_check is optional.'
        : 'Always do self_check after run_sql before final.',
      'Reply in Hebrew for final answers.',
      'Return JSON for exactly one action.',
      'Project hints (use as guidance, still verify with describe_table):',
      this.formatHints(),
      'Knowledge graph:',
      this.formatKnowledge(),
      'Semantic catalog (authoritative for metrics):',
      this.formatCatalog(),
      'Database purpose:',
      'Gemach management system: users, loans, deposits, donations, investments, payment returns, and financial summaries (overall + yearly).',
      'Primary entity: users. Related tables: loans, donations, deposits, monthly_deposits, requests, cash_holdings, order-return, user_role_history.',
      'Other relations: loans -> loan_actions, deposits -> deposits_actions, investments -> investment_transactions, membership_roles -> role_monthly_rates.',
      'Summary tables: funds_overview, funds_overview_by_year.',
      'If a question is year-specific and about aggregated totals, prefer yearly summary tables:',
      '- funds_overview_by_year (overall yearly totals)',
      '- user_financial_by_year (per-user yearly totals)',
      'Examples (yearly totals):',
      '- donations -> funds_overview_by_year.total_donations',
      '- equity donations -> funds_overview_by_year.total_equity_donations',
      '- monthly deposits -> funds_overview_by_year.total_monthly_deposits',
      '- loans count/amount -> funds_overview_by_year.total_loans_taken / total_loans_amount',
      '- loans repaid -> funds_overview_by_year.total_loans_repaid',
      '- fixed deposits added/withdrawn -> funds_overview_by_year.total_fixed_deposits_added / total_fixed_deposits_withdrawn',
      '- investments out/in -> funds_overview_by_year.total_investments_out / total_investments_in',
      '- expenses -> funds_overview_by_year.total_expenses',
      '- standing order return -> funds_overview_by_year.total_standing_order_return',
      '- special funds donated/withdrawn -> funds_overview_by_year.special_fund_donations / total_special_funds_withdrawn',
      'Action schemas:',
      '{"action":"list_tables"}',
      '{"action":"search_columns","term":"..."}',
      '{"action":"describe_table","schema":"...","table":"..."}',
      '{"action":"sample_rows","schema":"...","table":"...","n":3}',
      '{"action":"plan","tables":["schema.table"],"columns":["col"],"filters":["..."],"metric":"..."}',
      '{"action":"run_sql","sql":"SELECT ...","tables_used":["schema.table"]}',
      '{"action":"self_check","status":"ok","reason":"..."}',
      '{"action":"self_check","status":"retry","reason":"..."}',
      '{"action":"final","answer_type":"value","value":123}',
      '{"action":"final","answer_type":"rows","rows":[...]}',
    ].join('\n');

    const userContent = [
      conversationContext ? `Conversation context:\n${conversationContext}` : '',
      toolContext.length > 0 ? `Tool results:\n${toolContext.join('\n')}` : '',
      `User question (Hebrew): ${question}`,
    ]
      .filter(Boolean)
      .join('\n');

    return [
      { role: 'system', content: systemContent },
      { role: 'user', content: userContent },
    ];
  }

  private buildFixJsonMessages(
    raw: string,
    question: string,
    conversationContext: string,
    toolContext: string[],
  ): LlmMessage[] {
    const systemContent = [
      'You must return ONLY valid JSON for exactly one action.',
      'Do not include markdown, code fences, or any extra text.',
      'Use double quotes for keys and strings.',
    ].join('\n');

    const userContent = [
      'The previous response was invalid JSON.',
      `Previous response:\n${raw}`,
      conversationContext ? `Conversation context:\n${conversationContext}` : '',
      toolContext.length > 0 ? `Tool results:\n${toolContext.join('\n')}` : '',
      `User question (Hebrew): ${question}`,
      'Return a corrected JSON action only.',
    ]
      .filter(Boolean)
      .join('\n');

    return [
      { role: 'system', content: systemContent },
      { role: 'user', content: userContent },
    ];
  }

  private parseAction(text: string): ToolAction {
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const parsed = this.tryParseJson(cleaned);
    if (!parsed || typeof parsed !== 'object' || !('action' in parsed)) {
      throw new Error('LLM response missing action');
    }
    return parsed as ToolAction;
  }

  private tryParseJson(text: string): unknown | null {
    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        return null;
      }
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
  }

  private toResponse(rows: unknown[]): { value: unknown } | { rows: unknown[] } {
    if (rows.length === 1) {
      const row = rows[0] as Record<string, unknown>;
      const keys = Object.keys(row || {});
      if (keys.length === 1) {
        return { value: row[keys[0]] ?? null };
      }
    }

    return { rows: rows.slice(0, 50) };
  }

  private buildSearchTerms(question: string): string[] {
    const stopwords = new Set([
      'מה',
      'כמה',
      'יש',
      'של',
      'את',
      'זה',
      'זו',
      'הוא',
      'היא',
      'הם',
      'הן',
      'עם',
      'על',
      'אל',
      'ול',
      'וגם',
      'או',
      'אם',
      'מאיזה',
      'איזה',
      'איזו',
      'בכמה',
      'סך',
      'סהכ',
      'סה״כ',
      'סה"כ',
    ]);

    const synonyms: Record<string, string[]> = {
      הון: ['equity', 'fund'],
      עצמי: ['equity', 'own'],
      סכום: ['amount', 'total', 'sum'],
      סך: ['total', 'sum'],
      סהכ: ['total', 'sum'],
      יתרה: ['balance'],
      הלוואה: ['loan'],
      הלוואות: ['loan'],
      תרומה: ['donation'],
      תרומות: ['donation'],
      משתמש: ['user'],
      משתמשים: ['user'],
      הפקדה: ['deposit'],
      הפקדות: ['deposit'],
      תשלום: ['payment'],
      תשלומים: ['payment'],
    };

    const words = question
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length >= 2 && !stopwords.has(word));

    const terms: string[] = [];
    for (const word of words) {
      terms.push(word);
      const mapped = synonyms[word];
      if (mapped) {
        terms.push(...mapped);
      }
    }

    const unique = Array.from(new Set(terms));
    return unique.slice(0, 6);
  }

  private formatHints(): string {
    const termLines = Object.entries(schemaHints.termToTables)
      .map(([term, refs]) => `${term} -> ${refs.join(', ')}`)
      .slice(0, 25);
    const tableLines = Object.entries(schemaHints.tables)
      .map(([table, info]) => `${table}(${info.columns.slice(0, 12).join(', ')})`)
      .slice(0, 25);

    return [
      'Terms:',
      ...termLines,
      'Tables:',
      ...tableLines,
      'If a term maps to a column, prefer that table first.',
    ].join('\n');
  }

  private formatKnowledge(): string {
    return [
      ...schemaKnowledge.relationships.map((line) => `- ${line}`),
      ...schemaKnowledge.joinHints.map((line) => `- ${line}`),
    ].join('\n');
  }

  private formatCatalog(): string {
    const metricLines = semanticCatalog.metrics.map(
      (metric) =>
        `- ${metric.name}: ${metric.table}.${metric.column} (${metric.aggregation})` +
        (metric.dateColumn ? ` date=${metric.dateColumn}` : ''),
    );
    const dimensionLines = semanticCatalog.dimensions.map(
      (dim) => `- ${dim.name}: ${dim.table}.${dim.column}`,
    );
    return ['Metrics:', ...metricLines, 'Dimensions:', ...dimensionLines].join('\n');
  }

  private async autoRunPlan(
    plan: { tables: string[]; columns: string[]; filters: string[]; metric: string },
    denyColumnsRe: RegExp,
    describedColumns: Map<string, string[]>,
    question: string,
  ): Promise<{ value: unknown } | { rows: unknown[] } | null> {
    const table = plan.tables[0];
    if (!table) {
      return null;
    }
    const metric = (plan.metric || '').toLowerCase();
    const columns = plan.columns || [];
    const tableColumns = describedColumns.get(table.toLowerCase()) || [];
    const safeColumns = columns.filter((col) => !denyColumnsRe.test(col));
    const needsActive = this.needsActiveFilter(question);
    const activeColumn = this.findActiveColumn(tableColumns);
    const filters = [...(plan.filters || [])];
    if (needsActive && activeColumn && !filters.some((f) => f.includes(activeColumn))) {
      filters.push(`${this.quoteIdentifier(activeColumn)} = true`);
    }
    const whereClause = filters.length ? ` WHERE ${filters.join(' AND ')}` : '';

    let selectExpr = '*';
    if (metric.includes('count')) {
      selectExpr = 'COUNT(*) AS value';
    } else if (metric.includes('sum')) {
      const amountColumns = safeColumns.length
        ? safeColumns
        : this.findAmountColumns(tableColumns);
      if (amountColumns[0]) {
        selectExpr = `SUM(${this.quoteIdentifier(amountColumns[0])}) AS value`;
      }
    } else if (metric.includes('max') && safeColumns[0]) {
      selectExpr = `MAX(${this.quoteIdentifier(safeColumns[0])}) AS value`;
    } else if (metric.includes('min') && safeColumns[0]) {
      selectExpr = `MIN(${this.quoteIdentifier(safeColumns[0])}) AS value`;
    } else if (safeColumns.length > 0) {
      selectExpr = safeColumns.map((col) => this.quoteIdentifier(col)).join(', ');
    }

    const sql = `SELECT ${selectExpr} FROM ${table}${whereClause}`;
    const maxRows = Number(this.configService.get<string>('AI_QUERY_MAX_ROWS')) || 200;
    const rows = await this.dbToolsService.runSql(sql, maxRows, denyColumnsRe);
    const response = this.toResponse(rows);
    return response;
  }

  private getCached(cacheKey: string): { value: unknown } | { rows: unknown[] } | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.response;
  }

  private isMoneyQuestion(question: string): boolean {
    return /(כמה כסף|סכום|סהכ|סך|יתרה|balance|total|sum|amount)/i.test(question);
  }

  private needsActiveFilter(question: string): boolean {
    return /(כרגע|פעיל|פעילות|active|current)/i.test(question);
  }

  private isCountMetric(metric: string): boolean {
    return /count/i.test(metric || '');
  }

  private findAmountColumns(columns: string[]): string[] {
    const re = /(amount|balance|total|sum|equity|current|value|principal)/i;
    return columns.filter((col) => re.test(col));
  }

  private findActiveColumn(columns: string[]): string | null {
    const found = columns.find((col) => col === 'isActive' || col === 'is_active');
    return found || null;
  }

  private extractYear(question: string): number | null {
    const match = question.match(/\b(20\d{2})\b/);
    if (!match) {
      return null;
    }
    return Number(match[1]);
  }

  private planHasYearFilter(filters: string[]): boolean {
    return filters.some((filter) => /year|date/i.test(filter));
  }

  private quoteIdentifier(identifier: string): string {
    if (/^[a-z0-9_]+$/.test(identifier)) {
      return identifier;
    }
    return `"${identifier.replace(/\"/g, '""')}"`;
  }

  private setCache(cacheKey: string, response: { value: unknown } | { rows: unknown[] }): void {
    const ttlMs = Number(this.configService.get<string>('AI_CACHE_TTL_MS')) || 120000;
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(cacheKey, { expiresAt, response });
  }

  private getCacheKey(question: string, conversationId?: string): string {
    return `${conversationId ?? 'stateless'}::${question}`;
  }

  private getConversationContext(conversationId?: string): string {
    if (!conversationId) {
      return '';
    }

    const entries = this.memory.get(conversationId) || [];
    return entries.map((entry) => `${entry.role}: ${entry.content}`).join('\n');
  }

  private storeConversation(
    conversationId: string | undefined,
    question: string,
    response: { value: unknown } | { rows: unknown[] },
  ): void {
    if (!conversationId) {
      return;
    }

    const entries = this.memory.get(conversationId) || [];
    entries.push({ role: 'user', content: question });

    if ('value' in response) {
      entries.push({ role: 'assistant', content: `value: ${String(response.value)}` });
    } else {
      entries.push({ role: 'assistant', content: `rows: ${response.rows.length}` });
    }

    while (entries.length > this.maxMemoryEntries) {
      entries.shift();
    }

    this.memory.set(conversationId, entries);
  }
}
