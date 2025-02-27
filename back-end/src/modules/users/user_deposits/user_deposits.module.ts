import { Module } from '@nestjs/common';
import { UserDepositsController } from './user_deposits.controller';
import { UserDepositsService } from './user_deposits.service';

@Module({
    

  controllers: [UserDepositsController],
    
  providers: [UserDepositsService]
})
export class UserDepositsModule {

}
