import { Injectable } from '@nestjs/common';
import { DbRunnerService } from './db-runner.service';

export type SchemaInfo = {
  schemaText: string;
  allowTables: Set<string>;
  denyColumnsRe: RegExp;
};

@Injectable()
export class SchemaService {
  private readonly denyColumnsRe = /(password|pass|hash|salt|token|secret|api_key|refresh|access)/i;

  constructor(private readonly dbRunnerService: DbRunnerService) {}

  async getSchemaInfo(): Promise<SchemaInfo> {
    const rows = await this.dbRunnerService.query(
      `SELECT table_schema, table_name, column_name, data_type
       FROM information_schema.columns
       WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
       ORDER BY table_schema, table_name, ordinal_position`,
    );

    const tables = new Map<string, Array<{ name: string; type: string }>>();
    const allowTables = new Set<string>();

    for (const row of rows as Array<Record<string, string>>) {
      const schema = row.table_schema;
      const table = row.table_name;
      const column = row.column_name;
      const type = row.data_type;
      if (this.denyColumnsRe.test(column)) {
        continue;
      }

      const key = `${schema}.${table}`;
      allowTables.add(key.toLowerCase());
      if (!tables.has(key)) {
        tables.set(key, []);
      }
      tables.get(key)?.push({ name: column, type });
    }

    const schemaText = Array.from(tables.entries())
      .map(([tableName, cols]) => {
        const colsText = cols.map((col) => `${col.name}:${col.type}`).join(', ');
        return `${tableName}(${colsText})`;
      })
      .join('\n');

    return { schemaText, allowTables, denyColumnsRe: this.denyColumnsRe };
  }
}
