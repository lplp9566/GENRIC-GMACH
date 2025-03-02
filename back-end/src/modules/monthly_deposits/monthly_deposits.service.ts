import { Injectable } from '@nestjs/common';
import { UserEntity } from '../users/user.entity';
import { Repository } from 'typeorm';
import { UserDebtsEntity } from '../users/user_debts/user_debts.entity';

@Injectable()
export class MonthlyDepositsService {
    
    constructor(
     
        // private readonly userDebtsRepository: Repository<UserDebtsEntity>,
    ) {}
  
      
}
