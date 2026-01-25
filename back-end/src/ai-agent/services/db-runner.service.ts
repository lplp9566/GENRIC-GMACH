import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class DbRunnerService implements OnModuleInit, OnModuleDestroy {
  private dataSource: DataSource | null = null;
  private readonly timeoutMs: number;
  private readonly databaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.databaseUrl = this.configService.get<string>('DATABASE_URL_AI_READONLY') || '';
    this.timeoutMs = Number(this.configService.get<string>('AI_QUERY_TIMEOUT_MS')) || 5000;
  }

  async onModuleInit(): Promise<void> {
    if (!this.databaseUrl) {
      throw new Error('DATABASE_URL_AI_READONLY is not configured');
    }

    this.dataSource = new DataSource({
      type: 'postgres',
      url: this.databaseUrl,
      synchronize: false,
      migrationsRun: false,
    });

    await this.dataSource.initialize();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  async query(sql: string, parameters?: unknown[]): Promise<unknown[]> {
    if (!this.dataSource?.isInitialized) {
      throw new Error('Read-only datasource is not initialized');
    }

    await this.dataSource.query(`SET statement_timeout TO ${this.timeoutMs}`);
    return this.dataSource.query(sql, parameters);
  }
}
