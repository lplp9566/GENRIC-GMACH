import { Body, Controller, Post } from '@nestjs/common';
import { AskDto } from './dto/ask.dto';
import { AiAgentService } from './services/ai-agent.service';

@Controller('ai')
export class AiAgentController {
  constructor(private readonly aiAgentService: AiAgentService) {}

  @Post('ask')
  async ask(@Body() body: AskDto): Promise<{ value: unknown } | { rows: unknown[] }> {
    return this.aiAgentService.ask(body.question, body.conversationId);
  }
}
