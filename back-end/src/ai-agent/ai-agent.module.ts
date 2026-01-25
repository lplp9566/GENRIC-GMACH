import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiAgentController } from './ai-agent.controller';
import { AiAgentService } from './services/ai-agent.service';
import { SchemaService } from './services/schema.service';
import { SqlGuardService } from './services/sql-guard.service';
import { DbRunnerService } from './services/db-runner.service';
import { DbToolsService } from './services/db-tools.service';
import { QueryResolverService } from './services/query-resolver.service';
import { LLM_PROVIDER } from './llm/llm.provider';
import { GroqProvider } from './llm/groq.provider';

@Module({
  imports: [ConfigModule],
  controllers: [AiAgentController],
  providers: [
    AiAgentService,
    SchemaService,
    SqlGuardService,
    DbRunnerService,
    DbToolsService,
    QueryResolverService,
    { provide: LLM_PROVIDER, useClass: GroqProvider },
  ],
})
export class AiAgentModule {}
