// src/whatsapp/whatsapp.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  async sendText(to: string, text: string) {
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      this.logger.error('Missing WHATSAPP_TOKEN or PHONE_NUMBER_ID env vars');
      return;
    }

    const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;

    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    };

    await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    this.logger.log(`נשלחה הודעה ל-${to}: ${text}`);
  }
}
