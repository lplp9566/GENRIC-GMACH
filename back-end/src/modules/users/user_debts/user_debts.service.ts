import { Injectable } from '@nestjs/common';
import { UserEntity } from '../user.entity';
import { Repository } from 'typeorm';
import { UserDebtsEntity } from './user_debts.entity';

@Injectable()
export class UserDebtsService {
    
    constructor(
     
         private readonly userDebtsRepository: Repository<UserDebtsEntity>,
    ) {}
    // async createDebtRecord(user: UserEntity, year: number, month: number,): Promise<UserDebtsEntity> {
    // async getOrCreateDebtRecord(user: UserEntity, year: number, month: number): Promise<UserDebtsEntity> {
    //     let debt = await this.userDebtsRepository.findOne({ where: { user, year, month } });
      
    //     if (!debt) {
    //       debt = this.userDebtsRepository.create({
    //         user,
    //         year,
    //         month,
    //         total_due: user.payment_details.amount,
    //         amount_paid: 0,
    //         remaining_debt: 120
    //       });
      
    //       await this.userDebtsRepository.save(debt);
    //     }
    //     return debt;
    //   }
    }


