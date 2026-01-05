import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFinancialByYearEntity } from './user-financial-by-year.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user.entity';
import { UserFinancialByYearViewEntity } from './user-financial-by-year.view.entity';
// cSpell:ignore Financials

@Injectable()
export class UserFinancialByYearService {
  constructor(
    // @InjectRepository(UserFinancialByYearEntity)
    // private userFinancialsByYearRepository: Repository<UserFinancialByYearEntity>,
        @InjectRepository(UserFinancialByYearViewEntity)
    private userFinancialsByYearViewRepository: Repository<UserFinancialByYearViewEntity>,
  ) {}
  async getUserFinancialsByUser(user: number) {
    const  records = this.userFinancialsByYearViewRepository.find(
      { where: { user: { id: user } }, order: { year: 'ASC' } },
    );
    return (await records).map((record) => ({
      // user : record.user.id,
      id: record.id,
      year: record.year,
      total_monthly_deposits: record.total_monthly_deposits,
      total_equity_donations: record.total_equity_donations,
      special_fund_donations: record.special_fund_donations,
      total_loans_amount: record.total_loans_taken_amount,
      total_loan_repaid: record.total_loans_repaid,
      total_loans_count: record.total_loans_taken_count,
      total_fixed_deposits_added: record.total_fixed_deposits_added,
      total_fixed_deposits_withdrawn: record.total_fixed_deposits_withdrawn,
      total_standing_order_return: record.total_standing_order_return,
      total_donations: record.total_donations
    }));
  }
async getUserFinancialsByYear() {

    return this.userFinancialsByYearViewRepository.find({order: {year: 'ASC'}});
  }

  async getOrCreateFinancialRecord(
    user: UserEntity,
    year: number,
  ) {
    const record = await this.userFinancialsByYearViewRepository.findOne({
      where: { id: user.id , year }, 
    });

    return record;
    
    // if (!record) {
      // record = this.userFinancialsByYearRepository.create({
      //   user,
      //   year,
      //   total_monthly_deposits: 0,
      //   total_equity_donations: 0,
      //   special_fund_donations: 0,
      //   total_loans_taken: 0,
      //   total_loans_repaid: 0,
      //   total_fixed_deposits_added: 0,
      //   total_fixed_deposits_withdrawn: 0,
      //   total_standing_order_return: 0,
      //   total_donations: 0,
        
      // });
      // await this.userFinancialsByYearRepository.save(record);
    // }
  }

  // async recordMonthlyDeposit(user: UserEntity, year: number, amount: number) {
  //   const record = await this.getOrCreateFinancialRecord(user, year);
  //   record.total_monthly_deposits += amount;
  //   return this.userFinancialsByYearRepository.save(record);
  // }
  // async adjustEquityDonation(user: UserEntity, year: number, amount: number) {
  //   const record = await this.getOrCreateFinancialRecord(user, year);
  //   record.total_equity_donations += amount;
  //   return this.userFinancialsByYearRepository.save(record);
  // }
  // async adjustSpecialFundDonation(
  //   user: UserEntity,
  //   year: number,
  //   amount: number,
  // ) {
  //   const record = await this.getOrCreateFinancialRecord(user, year);
  //   record.special_fund_donations += amount;
  //   return this.userFinancialsByYearRepository.save(record);
  // }
  // async recordLoanTaken(user: UserEntity, year: number, amount: number) {
  //   const record = await this.getOrCreateFinancialRecord(user, year);
  //   record.total_loans_taken += amount;
  //   return this.userFinancialsByYearRepository.save(record);
  // }
//   async adjustLoan(user: UserEntity, year: number,diff: number) {
//   const fund = await this.getOrCreateFinancialRecord(user,year);
//   fund.total_loans_taken += diff;

//   await this.userFinancialsByYearRepository.save(fund);
// }

  // async recordLoanRepaid(user: UserEntity, year: number, amount: number) {
  //   const record = await this.getOrCreateFinancialRecord(user, year);
  //   record.total_loans_repaid += amount;
  //   return this.userFinancialsByYearRepository.save(record);
  // }

  // async recordFixedDepositAdded(
  //   user: UserEntity,
  //   year: number,
  //   amount: number,
  // ) {
  //   const record = await this.getOrCreateFinancialRecord(user, year);
  //   record.total_fixed_deposits_added += amount;
  //   return this.userFinancialsByYearRepository.save(record);
  // }
  // async recordFixedDepositWithdrawn(
  //   user: UserEntity,
  //   year: number,
  //   amount: number,
  // ) {
  //   const record = await this.getOrCreateFinancialRecord(user, year);
  //   record.total_fixed_deposits_withdrawn += amount;
  //   return this.userFinancialsByYearRepository.save(record);
  // }

  // async recordStandingOrderReturn(
  //   user: UserEntity,
  //   year: number,
  //   amount: number,
  // ) {
  //   const record = await this.getOrCreateFinancialRecord(user, year);
  //   record.total_standing_order_return += amount;
  //   return this.userFinancialsByYearRepository.save(record);
  // }
}
