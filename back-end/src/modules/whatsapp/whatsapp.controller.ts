import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { WhatsappService } from './whatsapp.service';

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'my_verify_token_123';

@Controller('webhook')  // /webhook או /api/webhook – תכף אסביר
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified!');
        return res.status(200).send(challenge);
      } else {
        return res.sendStatus(403);
      }
    }
    return res.sendStatus(400);
  }

  @Post()
  async handleMessage(@Req() req: Request, @Res() res: Response) {
    try {
      const body = req.body;

      if (
        body.object === 'whatsapp_business_account' &&
        body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
      ) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from;
        const text: string =
          message.text && message.text.body ? message.text.body.trim() : '';

        console.log('הודעה חדשה מ:', from, 'תוכן:', text);

        const replyText = this.whatsappService.buildReply(text);
        await this.whatsappService.sendText(from, replyText);
      }

      return res.sendStatus(200);
    } catch (err: any) {
      console.error('Error in webhook:', err.message);
      return res.sendStatus(500);
    }
  }
}
