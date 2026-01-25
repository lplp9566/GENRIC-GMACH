import { Injectable } from '@nestjs/common';
import { semanticCatalog } from '../semantic-catalog';

export type ResolvedQuery = {
  sql: string;
  reason: string;
  metricName: string;
};

@Injectable()
export class QueryResolverService {
  resolve(question: string): ResolvedQuery | null {
    const metric = this.matchMetric(question);
    if (!metric) {
      return null;
    }

    const year = this.extractYear(question);
    const dateFilter = year && metric.dateColumn
      ? ` WHERE EXTRACT(YEAR FROM ${this.q(metric.dateColumn)}) = ${year}`
      : '';

    const sql = `SELECT ${metric.aggregation.toUpperCase()}(${this.q(metric.column)}) AS value FROM ${metric.table}${dateFilter}`;
    return { sql, reason: `metric=${metric.name}`, metricName: metric.name };
  }

  private matchMetric(question: string): (typeof semanticCatalog.metrics)[number] | null {
    const normalized = question.toLowerCase();
    for (const metric of semanticCatalog.metrics) {
      for (const term of metric.synonyms) {
        if (normalized.includes(term.toLowerCase())) {
          return metric;
        }
      }
    }
    return null;
  }

  private extractYear(question: string): number | null {
    const match = question.match(/\b(20\d{2})\b/);
    if (!match) {
      return null;
    }
    return Number(match[1]);
  }

  private q(identifier: string): string {
    if (/^[a-z0-9_]+$/.test(identifier)) {
      return identifier;
    }
    return `"${identifier.replace(/\"/g, '""')}"`;
  }
}
