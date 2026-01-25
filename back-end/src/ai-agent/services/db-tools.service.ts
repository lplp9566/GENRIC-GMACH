import { Injectable } from '@nestjs/common';
import { DbRunnerService } from './db-runner.service';
import { SqlGuardService } from './sql-guard.service';

type TableRef = { schema: string; table: string };

@Injectable()
export class DbToolsService {
  private readonly denyColumnsRe = /(password|pass|hash|salt|token|secret|api_key|refresh|access)/i;

  constructor(
    private readonly dbRunnerService: DbRunnerService,
    private readonly sqlGuardService: SqlGuardService,
  ) {}

  async listTables(): Promise<string[]> {
    const rows = await this.dbRunnerService.query(
      `SELECT table_schema, table_name
       FROM information_schema.tables
       WHERE table_type = 'BASE TABLE'
         AND table_schema NOT IN ('pg_catalog', 'information_schema')
       ORDER BY table_schema, table_name`,
    );

    return (rows as Array<Record<string, string>>).map(
      (row) => `${row.table_schema}.${row.table_name}`,
    );
  }

  async searchColumns(term: string, limit = 50): Promise<string[]> {
    const rows = await this.dbRunnerService.query(
      `SELECT table_schema, table_name, column_name
       FROM information_schema.columns
       WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
         AND column_name ILIKE $1
       ORDER BY table_schema, table_name, ordinal_position
       LIMIT $2`,
      [`%${term}%`, limit],
    );

    return (rows as Array<Record<string, string>>)
      .filter((row) => !this.denyColumnsRe.test(row.column_name))
      .map((row) => `${row.table_schema}.${row.table_name}.${row.column_name}`);
  }

  async describeTable(schema: string, table: string): Promise<
    Array<{ name: string; type: string; isForeignKeyLike: boolean }>
  > {
    const rows = await this.dbRunnerService.query(
      `SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2
       ORDER BY ordinal_position`,
      [schema, table],
    );

    return (rows as Array<Record<string, string>>)
      .filter((row) => !this.denyColumnsRe.test(row.column_name))
      .map((row) => ({
        name: row.column_name,
        type: row.data_type,
        isForeignKeyLike: /(_id|id)$/i.test(row.column_name),
      }));
  }

  async sampleRows(schema: string, table: string, n = 3): Promise<unknown[]> {
    const columns = await this.describeTable(schema, table);
    if (columns.length === 0) {
      return [];
    }

    const columnList = columns.map((col) => `"${col.name}"`).join(', ');
    const sql = `SELECT ${columnList} FROM ${this.qualify(schema, table)} LIMIT ${n}`;
    return this.dbRunnerService.query(sql);
  }

  async runSql(sql: string, maxRows: number, denyColumnsRe: RegExp): Promise<unknown[]> {
    const safeSql = this.sqlGuardService.assertSafe(sql, denyColumnsRe);
    const limitedSql = this.sqlGuardService.ensureLimit(safeSql, maxRows);
    return this.dbRunnerService.query(limitedSql);
  }

  private qualify(schema: string, table: string): string {
    return `"${schema}"."${table}"`;
  }
}
