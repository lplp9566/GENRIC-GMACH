import { Injectable } from '@nestjs/common';

@Injectable()
export class SqlGuardService {
  private readonly forbiddenKeywords = [
    'insert',
    'update',
    'delete',
    'drop',
    'alter',
    'truncate',
    'grant',
    'revoke',
    'create',
    'call',
    'execute',
    'do',
    'copy',
  ];
  private readonly forbiddenFunctions = ['pg_sleep', 'dblink'];
  private readonly forbiddenSchemas = ['pg_catalog', 'information_schema'];

  assertSafe(sql: string, denyColumnsRe: RegExp): string {
    const trimmed = sql.trim();
    const normalized = trimmed.replace(/;\s*$/, '').trim();
    if (/[;]/.test(normalized)) {
      throw new Error('Multi-statement SQL is not allowed');
    }

    if (!/^(select|with)\b/i.test(normalized)) {
      throw new Error('Only SELECT queries are allowed');
    }

    const lowered = normalized.toLowerCase();
    for (const keyword of this.forbiddenKeywords) {
      if (new RegExp(`\\b${keyword}\\b`, 'i').test(lowered)) {
        throw new Error('Forbidden SQL keyword detected');
      }
    }

    for (const func of this.forbiddenFunctions) {
      if (new RegExp(`\\b${func}\\b`, 'i').test(lowered)) {
        throw new Error('Forbidden SQL function detected');
      }
    }

    for (const schema of this.forbiddenSchemas) {
      if (new RegExp(`\\b${schema}\\b`, 'i').test(lowered)) {
        throw new Error('Forbidden schema detected');
      }
    }

    if (denyColumnsRe.test(lowered)) {
      throw new Error('Sensitive column access is not allowed');
    }

    return normalized;
  }

  ensureLimit(sql: string, maxRows: number): string {
    if (/\blimit\b/i.test(sql)) {
      return sql;
    }

    return `${sql.trim()} LIMIT ${maxRows}`;
  }
}
