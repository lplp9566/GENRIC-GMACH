import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';

interface CreditRawItem {
  Shovar?: string;
  Zeout?: string;
  ClientName?: string;
  Adresse?: string;
  Phone?: string;
  Mail?: string;
  Amount?: string | number;
  Currency?: string;
  TransactionTime?: string;
  Confirmation?: string;
  LastNum?: string;
  TransactionType?: string;
  Groupe?: string;
  Comments?: string;
  Tashloumim?: string;
  FirstTashloum?: string | number;
  NextTashloum?: string | number;
  CallId?: string;
  AsRecord?: string;
  MasofId?: string;
  MasofName?: string;
  TransactionId?: string;
  CompagnyCard?: string;
  Solek?: string;
  Tayar?: string;
  Kabalald?: string;
  Kevald?: string;
  ActionNumber?: string;
  Id?: string;
  LastId?: string;
}

interface StandingOrderRawItem {
  '2'?: string;
  '3'?: string;
  '4'?: string;
  '5'?: string | number;
  '6'?: string;
  '7'?: string;
  '8'?: string;
  TransactionTime?: string;
  Date?: string;
  CreationDate?: string;
  ClientName?: string;
  Amount?: string | number;
  Masul?: string;
  CallId?: string;
  TransactionId?: string;
  Id?: string;
}

interface StandingOrderApiResponse {
  Result?: string;
  Message?: string;
  Maslul?: string;
  data?: StandingOrderRawItem[];
}

interface GetActionsOptions {
  source?: 'credit' | 'standing-order';
  lastId?: string;
  maxId?: string;
  from?: string;
  to?: string;
}

export interface MappedAction {
  id: string;
  date: string;
  user: string;
  amount: string;
  currency?: string;
  actionNumber: string;
  transactionType?: string;
  category?: string;
  comments?: string;
  solek?: string;
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

    if (source === 'standing-order') {
      const items = await this.fetchStandingOrderItems(mosadId, apiPassword, options);
      const data = items.map((item, index) => this.mapStandingOrderRow(item, index));

      return {
        source,
        total: data.length,
        data,
        paging: {
          hasMore: false,
          currentLastId: '',
          nextLastId: '',
        },
      };
    }

    const items = await this.fetchCreditItems(mosadId, apiPassword, options);
    const data = items.map((item, index) => this.mapCreditRow(item, index));
    const maxItems = Number(options.maxId ?? '2000');
    const hasMore = Number.isFinite(maxItems) && maxItems > 0 && data.length >= maxItems;
    const nextLastId = hasMore
      ? this.resolveLastIdCursor(data[data.length - 1], items[items.length - 1])
      : '';

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
  ): Promise<CreditRawItem[]> {
    const response = await axios.get(this.creditApiUrl, {
      params: {
        Action: 'GetHistoryJson',
        MosadId: mosadId,
        ApiPassword: apiPassword,
        LastId: options.lastId ?? '',
        MaxId: options.maxId ?? '2000',
      },
    });

    const payload = this.parseApiPayload(response.data);
    if (Array.isArray(payload)) return this.toCreditItems(payload);

    if (this.isRecord(payload) && Array.isArray(payload.data)) {
      return this.toCreditItems(payload.data as unknown[]);
    }

    return [];
  }

  private async fetchStandingOrderItems(
    mosadId: string,
    apiPassword: string,
    options: GetActionsOptions,
  ): Promise<StandingOrderRawItem[]> {
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
      return this.extractStandingOrderItems(response.data);
    }

    const currentYear = new Date().getFullYear();
    const fromYear = 2018;
    const all: StandingOrderRawItem[] = [];

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
      all.push(...this.extractStandingOrderItems(response.data));
    }

    const seen = new Set<string>();
    const deduped: StandingOrderRawItem[] = [];
    for (const item of all) {
      const key = `${this.readStr(item, ['2', 'CallId', 'TransactionId', 'Id'])}|${this.readStr(item, ['4', 'TransactionTime', 'Date'])}|${this.readStr(item, ['5', 'Amount'])}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
    }
    return deduped;
  }

  private extractStandingOrderItems(raw: unknown): StandingOrderRawItem[] {
    const payload = this.parseApiPayload(raw);
    if (Array.isArray(payload)) return this.toStandingOrderItems(payload);

    if (this.isRecord(payload)) {
      const response = payload as StandingOrderApiResponse;
      if (Array.isArray(response.data)) {
        return this.toStandingOrderItems(response.data);
      }
    }

    return [];
  }

  private parseApiPayload(raw: unknown): unknown {
    if (typeof raw !== 'string') return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  private toCreditItems(input: unknown[]): CreditRawItem[] {
    return input.filter(
      (item): item is CreditRawItem =>
        !!item && typeof item === 'object' && !Array.isArray(item),
    );
  }

  private toStandingOrderItems(input: unknown[]): StandingOrderRawItem[] {
    return input.filter(
      (item): item is StandingOrderRawItem =>
        !!item && typeof item === 'object' && !Array.isArray(item),
    );
  }

  private readStr<T extends object>(item: T, keys: string[]): string {
    const row = item as Record<string, unknown>;
    for (const key of keys) {
      const value = row[key];
      if (value !== undefined && value !== null) {
        const str = String(value).trim();
        if (str !== '') return str;
      }
    }
    return '';
  }

  private mapCreditRow(item: CreditRawItem, index: number): MappedAction {
    const date = this.readStr(item, ['TransactionTime']);
    const user = this.readStr(item, ['ClientName']);
    const amount = this.readStr(item, ['Amount']);
    const currency = this.readStr(item, ['Currency']);
    const actionNumber = this.readStr(item, [
      'Shovar',
      'Confirmation',
      'ActionNumber',
      'LastNum',
      'TransactionId',
      'Id',
      'Zeout',
    ]);

    return {
      id: `${actionNumber || 'row'}-${index}`,
      date,
      user,
      amount,
      currency,
      actionNumber,
      transactionType: this.readStr(item, ['TransactionType']),
      category: this.readStr(item, ['Groupe']),
      comments: this.readStr(item, ['Comments']),
      solek: this.readStr(item, ['Solek']),
    };
  }

  private resolveLastIdCursor(lastRow: MappedAction, lastRawItem?: CreditRawItem) {
    // כלל פשוט: הלאסט איי.די לעמוד הבא הוא המזהה של הרשומה האחרונה שהוחזרה.
    const fromRow = (lastRow.actionNumber ?? '').trim();
    if (fromRow) return fromRow;

    return lastRawItem
      ? this.readStr(lastRawItem, [
          'LastNum',
          'Confirmation',
          'Shovar',
          'TransactionId',
          'Zeout',
          'LastId',
          'Id',
        ])
      : '';
  }

  private mapStandingOrderRow(
    item: StandingOrderRawItem,
    index: number,
  ): MappedAction {
    const date =
      this.readStr(item, ['4', 'TransactionTime', 'Date']) ||
      this.readStr(item, ['CreationDate']);
    const user = this.readStr(item, ['3', 'ClientName']);
    const amount = this.readStr(item, ['5', 'Amount']);
    const actionNumber = this.readStr(item, [
      '2',
      'Masul',
      'CallId',
      'TransactionId',
      'Id',
    ]);

    return {
      id: `${actionNumber || 'standing-order'}-${index}`,
      date,
      user,
      amount,
      currency: '1',
      actionNumber,
      transactionType: this.readStr(item, ['6']),
      category: this.readStr(item, ['8']),
      comments: this.readStr(item, ['7']),
      solek: '',
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
