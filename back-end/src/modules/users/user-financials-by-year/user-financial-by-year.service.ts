import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFinancialByYearEntity } from './user-financial-by-year.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user.entity';

@Injectable()
export class UserFinancialByYearService {
    constructor(
        @InjectRepository(UserFinancialByYearEntity)
        private userFinancialsByYearRepository: Repository<UserFinancialByYearEntity>
    ) {}
    async getUserFinancials() {
        return this.userFinancialsByYearRepository.find();
    }
    
    async getOrCreateFinancialRecord(
      user: UserEntity,
      year: number,
    ): Promise<UserFinancialByYearEntity> {
      let record = await this.userFinancialsByYearRepository.findOne({
        where: { user: { id: user.id }, year },     // ← id בלבד
      });
    
      if (!record) {
        record = this.userFinancialsByYearRepository.create({
          user,
          year,
          total_monthly_deposits: 0,
          total_equity_donations: 0,
          special_fund_donations: 0,
          total_loans_taken: 0,
          total_loans_repaid: 0,
          total_fixed_deposits_added: 0,
          total_fixed_deposits_withdrawn: 0,
        });
        await this.userFinancialsByYearRepository.save(record);
      }
      return record;
    }
 
    
    async recordMonthlyDeposit(user: UserEntity, year: number, amount: number) {      
    const record = await this.getOrCreateFinancialRecord(user, year);
    record.total_monthly_deposits += amount;
    return this.userFinancialsByYearRepository.save(record);  
    }
    async recordEquityDonation(user: UserEntity, year: number, amount: number) {
        const record = await this.getOrCreateFinancialRecord(user, year);
        record.total_equity_donations += amount;
        return this.userFinancialsByYearRepository.save(record);
      }
      async recordSpecialFundDonation(user:UserEntity,year:number,amount:number){
        const record = await this.getOrCreateFinancialRecord(user,year)
        record.special_fund_donations += amount 
        return this.userFinancialsByYearRepository.save(record)
      }
    async recordLoanTaken(user: UserEntity, year: number, amount: number) {
        const record = await this.getOrCreateFinancialRecord(user, year);
        record.total_loans_taken += amount;
        return this.userFinancialsByYearRepository.save(record);
      }
    async recordLoanRepaid(user: UserEntity, year: number, amount: number) {
        const record = await this.getOrCreateFinancialRecord(user, year);
        record.total_loans_repaid += amount;
        return this.userFinancialsByYearRepository.save(record);
      } 
      
    async recordFixedDepositAdded(user: UserEntity, year: number, amount: number) {
        const record = await this.getOrCreateFinancialRecord(user, year);
        record.total_fixed_deposits_added += amount;
        return this.userFinancialsByYearRepository.save(record);
      }
    async recordFixedDepositWithdrawn(user: UserEntity, year: number, amount: number) {
        const record = await this.getOrCreateFinancialRecord(user, year);
        record.total_fixed_deposits_withdrawn += amount;
        return this.userFinancialsByYearRepository.save(record);
      }
       
}
