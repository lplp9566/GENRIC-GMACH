import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFinancialsEntity } from './user-financials.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user.entity';

@Injectable()
export class UserFinancialsService {
    constructor(
        @InjectRepository(UserFinancialsEntity)
        private userFinancialsRepository: Repository<UserFinancialsEntity>
    ) {}
    async getUserFinancials() {
        return this.userFinancialsRepository.find();
    }
    
    async getOrCreateFinancialRecord(user: UserEntity, year: number): Promise<UserFinancialsEntity> {
      let record = await this.userFinancialsRepository.findOne({
          where: { user,year }, 
      });
      if (!record) {

          record = this.userFinancialsRepository.create({
              user,
              year,
              total_monthly_deposits: 0,
              total_equity_donations: 0,
              total_loans_taken: 0,
              total_loans_repaid: 0,
              special_fund_donations: 0,
              total_fixed_deposits_added: 0,
              total_fixed_deposits_withdrawn: 0,
          });
  
          await this.userFinancialsRepository.save(record);
      } else {
      }
      return record;
  }
 
    
    async recordMonthlyDeposit(user: UserEntity, year: number, amount: number) {      
    const record = await this.getOrCreateFinancialRecord(user, year);
    record.total_monthly_deposits += amount;
    return this.userFinancialsRepository.save(record);  
    }
    async recordEquityDonation(user: UserEntity, year: number, amount: number) {
        const record = await this.getOrCreateFinancialRecord(user, year);
        record.total_equity_donations += amount;
        return this.userFinancialsRepository.save(record);
      }
      async recordSpecialFundDonation(user:UserEntity,year:number,amount:number){
        const record = await this.getOrCreateFinancialRecord(user,year)
        record.special_fund_donations += amount 
        return this.userFinancialsRepository.save(record)
      }
    async recordLoanTaken(user: UserEntity, year: number, amount: number) {
        const record = await this.getOrCreateFinancialRecord(user, year);
        record.total_loans_taken += amount;
        return this.userFinancialsRepository.save(record);
      }
    async recordLoanRepaid(user: UserEntity, year: number, amount: number) {
        const record = await this.getOrCreateFinancialRecord(user, year);
        record.total_loans_repaid += amount;
        return this.userFinancialsRepository.save(record);
      } 
      
    async recordFixedDepositAdded(user: UserEntity, year: number, amount: number) {
        const record = await this.getOrCreateFinancialRecord(user, year);
        record.total_fixed_deposits_added += amount;
        return this.userFinancialsRepository.save(record);
      }
    async recordFixedDepositWithdrawn(user: UserEntity, year: number, amount: number) {
        const record = await this.getOrCreateFinancialRecord(user, year);
        record.total_fixed_deposits_withdrawn += amount;
        return this.userFinancialsRepository.save(record);
      }
      
    
}
