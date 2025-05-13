import { Controller, Get, Post } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-mail')
  async sendTestMail() {
    const to = 'lplp9566@gmail.com';
    const subject = 'Hello from NestJS!';
    const text = 'This is a test email from NestJS.';
    const html = '<h1style="color: blue;">Hello from NestJS!</h1><p>This is a test email.</p>/n <p style="color: red;">This is a test email.</p>';

    return await this.mailService.sendMail(to, subject, text, html);
  }
}
