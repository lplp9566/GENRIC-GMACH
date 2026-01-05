import { Controller, Post, Body, Get } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // @Post('donation-thank-you')
  // async sendDonationThankYou(
    
  //   @Body('to') to: string,
  //   @Body('name') name: string,
  //   @Body('amount') amount: number,
  // ) {
  //   console.log("kkk"
  //   );
    
  //   return this.mailService.(to, name, amount);
  // }

  // @Post('reminder')
  // async sendReminder(
  //   @Body('to') to: string,
  //   @Body('title') title: string,
  //   @Body('message') message: string,
  // ) {
  //   return this.mailService.sendReminder(to, title, message);
  // }
  
}