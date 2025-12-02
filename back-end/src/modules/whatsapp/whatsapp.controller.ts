// src/whatsapp/whatsapp.controller.ts
import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { WhatsappService } from './whatsapp.service';
import { WhatsappPaymentsFlowService } from './WhatsappPaymentsFlowService';

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'my_verify_token_123';

@Controller('webhook')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly paymentsFlow: WhatsappPaymentsFlowService,
  ) {}

  // אימות webhook מול Meta
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }

  // קבלת הודעות
  @Post()
  async handleMessage(@Req() req: Request, @Res() res: Response) {
    try {
      const body = req.body;

      if (
        body.object === 'whatsapp_business_account' &&
        body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
      ) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from; // מספר הוואטסאפ
        const text: string =
          message.text && message.text.body ? message.text.body.trim() : '';

        const replyText = await this.paymentsFlow.handleIncoming(from, text);

        if (replyText) {
          await this.whatsappService.sendText(from, replyText);
        }
      }

      return res.sendStatus(200);
    } catch (err: any) {
      console.error('Error in webhook:', err.message);
      return res.sendStatus(500);
    }
  }
}
