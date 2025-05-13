import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // ניתן להשתמש גם ב-SMTP אחר
      auth: {
        user: process.env.EMAIL_ADDRESS, // כתובת האימייל שלך
        pass: process.env.EMAIL_PASSWORD, // סיסמה או App Password
      },
    });
  }

  // async sendMail(to: string, subject: string, text: string, html?: string) {
  //   try {
  //     const mailOptions = {
  //       from: process.env.EMAIL_USER,
  //       to,
  //       subject,
  //       text,
  //       html, 
  //     };

  //     const info = await this.transporter.sendMail(mailOptions);
  //     console.log('📧 Email sent:', info.response);
  //     return info;
  //   } catch (error) {
  //     console.error('❌ Error sending email:', error);
  //     throw new Error('Failed to send email');
  //   }
  // }
    async sendMail(to: string, subject: string, text: string, html?: string) {
      const resend = new Resend('re_c2gs6w7P_JsMpMakenCDtPFeHrNTfbEWb');
   return await resend.emails.send({
        from: 'Eli Test <onboarding@resend.dev>',
        to: to,
        subject: subject,
        text: text,
        html: html
      })

  }
}
