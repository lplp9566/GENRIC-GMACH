import { Injectable } from '@nestjs/common';
import axios from 'axios';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

@Injectable()
export class WhatsappService {
  async sendText(to: string, text: string) {
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

    console.log('נשלחה הודעה ל:', to, 'טקסט:', text);
  }

  buildReply(incoming: string): string {
    if (!incoming) return 'שלום, זה הגמ"ח. איך אפשר לעזור?';

    const lower = incoming.toLowerCase();

    if (lower.includes('שלום') || lower.includes('היי')) {
      return 'שלום וברוך הבא לגמ"ח 🙌\n1 - לבדוק זמינות פריטים\n2 - לראות ההשאלות שלי\n3 - לדבר עם נציג';
    }

    if (lower === '1') {
      return 'כדי לבדוק זמינות, כתוב: "זמינות + שם הפריט".\nלדוגמה: זמינות עגלת תינוק';
    }

    if (lower === '2') {
      return 'בקרוב נחבר ל-DB ותוכל לראות את ההשאלות שלך 😊';
    }

    if (lower === '3') {
      return 'ההודעה שלך תועבר לנציג. כתוב מה אתה צריך.';
    }

    return 'לא כ"כ הבנתי 🤔\nנסה לבחור 1 / 2 / 3';
  }
}
