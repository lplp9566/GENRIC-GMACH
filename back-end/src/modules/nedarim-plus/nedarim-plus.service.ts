import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';

interface RawItem {
  [key: string]: unknown;
}

interface GetActionsOptions {
  source?: 'credit' | 'standing-order';
  lastId?: string;
  maxId?: string;
  from?: string;
  to?: string;
}

interface MappedAction {
  id: string;
  date: string;
  user: string;
  amount: string;
  currency?: string;
  actionNumber: string;
}

@Injectable()
export class NedarimPlusService {
  private readonly creditApiUrl =
    'https://matara.pro/nedarimplus/Reports/Manage3.aspx';
  private readonly standingOrderApiUrl =
    'https://matara.pro/nedarimplus/Reports/Masav3.aspx';

  async getActions(options: GetActionsOptions) {
    const mosadId = process.env.NEDARIM_MOSAD_ID ?? process.env.MOSADID;
    const apiPassword =
      process.env.NEDARIM_API_PASSWORD ?? process.env.APP_PASSWORD;

    if (!mosadId || !apiPassword) {
      throw new BadRequestException(
        'Missing Nedarim+ credentials in server env (NEDARIM_MOSAD_ID / NEDARIM_API_PASSWORD)',
      );
    }

    const source = options.source ?? 'credit';
    const isStandingOrder = source === 'standing-order';

    const items = isStandingOrder
      ? await this.fetchStandingOrderItems(mosadId, apiPassword, options)
      : await this.fetchCreditItems(mosadId, apiPassword, options);
    const data = items.map((item, index) =>
      isStandingOrder
        ? this.mapStandingOrderRow(item, index)
        : this.mapCreditRow(item, index),
    );
    const maxItems = Number(options.maxId ?? '2000');
    const nextLastId =
      !isStandingOrder && data.length > 0
        ? this.resolveLastIdCursor(data[data.length - 1], items[items.length - 1])
        : '';
    const hasMore =
      !isStandingOrder &&
      Number.isFinite(maxItems) &&
      maxItems > 0 &&
      data.length >= maxItems &&
      nextLastId !== '';

    return {
      source,
      total: data.length,
      data,
      paging: {
        hasMore,
        currentLastId: options.lastId ?? '',
        nextLastId,
      },
    };
  }

  private async fetchCreditItems(
    mosadId: string,
    apiPassword: string,
    options: GetActionsOptions,
  ) {
    const response = await axios.get(this.creditApiUrl, {
      params: {
        Action: 'GetHistoryJson',
        MosadId: mosadId,
        ApiPassword: apiPassword,
        LastId: options.lastId ?? '',
        MaxId: options.maxId ?? '2000',
      },
    });
    return this.extractItems(response.data);
  }

  private async fetchStandingOrderItems(
    mosadId: string,
    apiPassword: string,
    options: GetActionsOptions,
  ) {
    if (options.from || options.to) {
      const response = await axios.get(this.standingOrderApiUrl, {
        params: {
          Action: 'GetMasavHistoryNew',
          MosadId: mosadId,
          ApiPassword: apiPassword,
          From: options.from ?? '01/01/2000',
          To: options.to ?? this.todayDdMmYyyy(),
        },
      });
      return this.extractItems(response.data);
    }

    // "הכל" -> שליפה שנתית כדי להימנע מטווח גדול שמחזיר ריק.
    const currentYear = new Date().getFullYear();
    const fromYear = 2018;
    const all: RawItem[] = [];

    for (let year = currentYear; year >= fromYear; year -= 1) {
      const response = await axios.get(this.standingOrderApiUrl, {
        params: {
          Action: 'GetMasavHistoryNew',
          MosadId: mosadId,
          ApiPassword: apiPassword,
          From: `01/01/${year}`,
          To: `31/12/${year}`,
        },
      });
      all.push(...this.extractItems(response.data));
    }

    // הסרת כפילויות בסיסית.
    const seen = new Set<string>();
    const deduped: RawItem[] = [];
    for (const item of all) {
      const key = `${this.readStr(item, ['2', 'CallId', 'TransactionId', 'Id'])}|${this.readStr(item, ['4', 'TransactionTime', 'Date'])}|${this.readStr(item, ['5', 'Amount'])}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
    }
    return deduped;
  }

  private extractItems(raw: unknown): RawItem[] {
    if (Array.isArray(raw)) return raw as RawItem[];

    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return this.extractItems(parsed);
      } catch {
        return [];
      }
    }

    if (!raw || typeof raw !== 'object') return [];
    const obj = raw as Record<string, unknown>;

    const preferred = [obj.data, obj.items, obj.results, obj.response, obj.d]
      .filter(Array.isArray)
      .map((v) => v as RawItem[]);
    if (preferred.length > 0) {
      return preferred.sort((a, b) => this.scoreArray(b) - this.scoreArray(a))[0];
    }

    const arrays = this.collectArrays(obj);
    if (arrays.length === 0) return [];
    return arrays.sort((a, b) => this.scoreArray(b) - this.scoreArray(a))[0];
  }

  private collectArrays(node: unknown, depth = 0): RawItem[][] {
    if (!node || typeof node !== 'object' || depth > 6) return [];
    const out: RawItem[][] = [];
    const obj = node as Record<string, unknown>;
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) {
        out.push(value as RawItem[]);
        for (const item of value) {
          if (item && typeof item === 'object') {
            out.push(...this.collectArrays(item, depth + 1));
          }
        }
      } else if (value && typeof value === 'object') {
        out.push(...this.collectArrays(value, depth + 1));
      }
    }
    return out;
  }

  private scoreArray(arr: RawItem[]): number {
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    let score = arr.length;
    for (const item of arr.slice(0, 20)) {
      if (!item || typeof item !== 'object') continue;
      const obj = item as Record<string, unknown>;
      if (
        obj.ClientName !== undefined ||
        obj.clientName !== undefined ||
        obj.Amount !== undefined ||
        obj.amount !== undefined ||
        obj.TransactionTime !== undefined ||
        obj.CreationDate !== undefined ||
        obj.Currency !== undefined ||
        obj.LastNum !== undefined
      ) {
        score += 100;
      }
    }
    return score;
  }

  private readStr(item: RawItem, keys: string[]): string {
    for (const key of keys) {
      const value = item[key];
      if (value !== undefined && value !== null) {
        const str = String(value).trim();
        if (str !== '') return str;
      }
    }
    return '';
  }

  private mapCreditRow(item: RawItem, index: number) {
    const date = this.readStr(item, [
      'TransactionTime',
      'transactionTime',
      'CreationDate',
      'creationDate',
      'Date',
      'date',
    ]);
    const user = this.readStr(item, ['ClientName', 'clientName', 'Name', 'name']);
    const amount = this.readStr(item, ['Amount', 'amount', 'Sum', 'sum']);
    const currency = this.readStr(item, ['Currency', 'currency']);
    const actionNumber = this.readStr(item, [
      'ActionNumber',
      'actionNumber',
      'TransactionId',
      'transactionId',
      'OperationId',
      'operationId',
      'LastNum',
      'lastNum',
      'Id',
      'id',
      'Zeout',
      'zeout',
    ]);

    return {
      id: `${actionNumber || 'row'}-${index}`,
      date,
      user,
      amount,
      currency,
      actionNumber,
    };
  }

  private resolveLastIdCursor(lastRow: MappedAction, lastRawItem?: RawItem) {
    const rawCursor = lastRawItem
      ? this.readStr(lastRawItem, [
          'LastId',
          'LastNum',
          'Id',
          'TransactionId',
          'ActionNumber',
          'OperationId',
        ])
      : '';
    return rawCursor || lastRow.actionNumber || '';
  }

  private mapStandingOrderRow(item: RawItem, index: number) {
    const date =
      this.readStr(item, ['4', 'TransactionTime', 'Date', 'date']) ||
      this.readStr(item, ['CreationDate', 'creationDate']);
    const user = this.readStr(item, ['3', 'ClientName', 'clientName', 'Name', 'name']);
    const amount = this.readStr(item, ['5', 'Amount', 'amount', 'Sum', 'sum']);
    const actionNumber = this.readStr(item, [
      '2',
      'Masul',
      'masul',
      'CallId',
      'callId',
      'TransactionId',
      'transactionId',
      'Id',
      'id',
    ]);

    return {
      id: `${actionNumber || 'standing-order'}-${index}`,
      date,
      user,
      amount,
      currency: '1',
      actionNumber,
    };
  }

  private todayDdMmYyyy() {
    const now = new Date();
    const dd = `${now.getDate()}`.padStart(2, '0');
    const mm = `${now.getMonth() + 1}`.padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
}
