import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { LlmMessage, LlmProvider } from './llm.provider';

@Injectable()
export class GroqProvider implements LlmProvider {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GROQ_API_KEY') || '';
    this.model = this.configService.get<string>('GROQ_MODEL') || 'llama-3.1-8b-instant';
  }

  async complete(messages: LlmMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: this.model,
        temperature: 0,
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const content = response?.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Groq response missing content');
    }

    return content;
  }
}
