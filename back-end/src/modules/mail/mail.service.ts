import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // פונקציה כללית לשליחת מייל
  async sendMail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to ,
      subject,
      html,
      text,
    };

    const info = await this.transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    return info;
  }

  // 📩 מייל "תודה על תרומה"
  async sendDonationThankYou(to: string, name: string, amount: number) {
    const subject = 'תודה על התרומה שלך 🙏';

    const html = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background:#f7f7f7; padding:20px;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:20px; border-radius:8px;">
          <h2 style="color:#2d7ff9; margin-top:0;">${name} היקר/ה, תודה רבה!</h2>
          <p>ברצוננו להודות לך על תרומה בסך <strong>${amount} ₪</strong>.</p>
          <p>בזכות אנשים כמוך אנחנו יכולים להמשיך בפעילות שלנו.</p>
          <p>תודה רבה על האמון והתמיכה ❤️</p>
          <hr style="margin:24px 0;" />
          <p style="font-size:12px; color:#888;">
            אם קיבלת את המייל הזה בטעות, אפשר להתעלם ממנו.
          </p>
        </div>
      </div>
    `;

    return this.sendMail(to, subject, html);
  }

  // ⏰ מייל תזכורת
  async sendReminder(to: string, title: string, message: string) {
    const subject = `תזכורת: ${title}`;

    const html = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background:#f7f7f7; padding:20px;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:20px; border-radius:8px;">
          <h2 style="color:#f39c12; margin-top:0;">תזכורת</h2>
          <p style="margin-bottom:16px;">${message}</p>
          <p style="font-size:13px; color:#555;">אם כבר טיפלת בזה, אפשר להתעלם מההודעה 🙂</p>
        </div>
      </div>
    `;

    return this.sendMail(to, subject, html);
  }
}
