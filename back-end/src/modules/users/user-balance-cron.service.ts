import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UsersService } from './users.service';

@Injectable()
export class UserBalanceCronService {
  constructor(private readonly usersService: UsersService) {}

  @Cron('55 21 * * *',{
   timeZone: 'Asia/Jerusalem'
  }) 
  async updateAllUsersBalances() {
    console.log('🔄 Updating all users balances...');

    const users = await this.usersService.getAllUsers();
    for (const user of users!) {
      await this.usersService.updateUserMonthlyBalance(user);
    }

    console.log('✅ All user balances updated successfully.');
  }
}
