import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../users.service';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { use } from 'passport';
import { UserEntity } from '../user.entity';
import { UserFinancialEntity } from './user-financials.entity';
import { CashHoldingsTypesRecordType } from '../../cash-holdings/cash-holdings-dto';
import { UserFinancialViewEntity } from './user-financials.view.entity';
// cSpell:ignore Financials

@Injectable()
export class UserFinancialService {
constructor(
  @InjectRepository(UserFinancialEntity)
  private readonly userFinancialRepo: Repository<UserFinancialEntity>,

  // אם אתה משתמש גם ב-View:
  @InjectRepository(UserFinancialViewEntity)
  private readonly userFinancialsViewRepository: Repository<UserFinancialViewEntity>,

  // private readonly usersService: UsersService,
) {}

async getOrCreateUserFinancials(user: UserEntity) {
  console.log("lll");
  
let record = await this.userFinancialsViewRepository.findOne({
  where: { userId: user.id },
});


  // if (!record) {
  //   record = this.userFinancialsRepository.create({
  //     user,
  //     total_special_fund_donations: 0,
  //     total_donations: 0,
  //     total_monthly_deposits: 0,
  //     total_equity_donations: 0,
  //     total_loans_taken: 0,
  //     total_loans_repaid: 0,
  //     total_fixed_deposits_deposited: 0,
  //     total_fixed_deposits_withdrawn: 0,
  //     total_cash_holdings: 0,
  //     total_standing_order_return: 0
  //   });
  //   await this.userFinancialsRepository.save(record);
  // }
  return record;
}

// async recordMonthlyDeposit(user: UserEntity, amount: number) {      
//     const record = await this.getOrCreateUserFinancials(user);
//     record.total_monthly_deposits += amount;
//     record.total_donations += amount;
//     return this.userFinancialsRepository.save(record);  
//     }
    // async adjustEquityDonation(user: UserEntity, amount: number) {
    //     const record = await this.getOrCreateUserFinancials(user);
    //     record.total_equity_donations += amount;
    //     record.total_donations += amount;
    //     return this.userFinancialsRepository.save(record);
    //   }
  //     async adjustSpecialFundDonation(user: UserEntity, delta: number) {
        
  //   const rec = await this.getOrCreateUserFinancials(user);
  //   rec.total_special_fund_donations += delta;
  //   rec.total_donations += delta
  //   return this.userFinancialsRepository.save(rec);
  // }
//     async recordLoanTaken(user: UserEntity, amount: number) {
//         const record = await this.getOrCreateUserFinancials(user);
//         record.total_loans_taken += amount;
//         return this.userFinancialsRepository.save(record);
//       }
//       async adjustLoan(user: UserEntity,diff: number,) {
//   const fund = await this.getOrCreateUserFinancials(user);

//   // diff > 0 → הלוואה גדלה → כסף יוצא
//   // diff < 0 → הלוואה קטנה → כסף חוזר
//   fund.total_loans_taken += diff;

//   await this.userFinancialsRepository.save(fund);
// }

    // async recordLoanRepaid(user: UserEntity, amount: number) {
    //     const record = await this.getOrCreateUserFinancials(user);
    //     record.total_loans_repaid += amount;
    //     return this.userFinancialsRepository.save(record);
    //   } 
      
    // async recordFixedDepositAdded(user: UserEntity, amount: number) {
    //     const record = await this.getOrCreateUserFinancials(user);
    //     record.total_fixed_deposits_deposited += amount;
    //     return this.userFinancialsRepository.save(record);
    //   }
    // async recordFixedDepositWithdrawn(user: UserEntity, amount: number) {
    //     const record = await this.getOrCreateUserFinancials(user);
    //     record.total_fixed_deposits_withdrawn += amount;
    //     return this.userFinancialsRepository.save(record);
    //   }
      // async recordCashHoldings(user: UserEntity, amount: number,type:CashHoldingsTypesRecordType) {
      //   const record = await this.getOrCreateUserFinancials(user);
      //   if (type === CashHoldingsTypesRecordType.add) {
      //     record.total_cash_holdings += amount;
      //   } else if (type === CashHoldingsTypesRecordType.subtract) {
      //     record.total_cash_holdings -= amount;
      //   }
      //   else {
      //     throw new Error('Invalid type for cash holdings record');
      //   }
      //   return this.userFinancialsRepository.save(record);
      // }

      // async recordStandingOrderReturn(user: UserEntity, amount: number) {
      //   const record = await this.getOrCreateUserFinancials(user);
      //   record.total_standing_order_return += amount;
      //   return this.userFinancialsRepository.save(record);
      // } 
}

