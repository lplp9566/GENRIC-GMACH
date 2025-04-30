import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../users.service';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFinancialEntity } from './user-financials.entity';
import { use } from 'passport';
import { UserEntity } from '../user.entity';
// cSpell:ignore Financials

@Injectable()
export class UserFinancialsService {
constructor(
    @InjectRepository(UserFinancialEntity)
    private readonly userFinancialsRepository: Repository<UserFinancialEntity>,
        @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService
) {}

async getOrCreateUserFinancials(user: UserEntity) {
  let record = await this.userFinancialsRepository.findOne({
    where: { user: { id: user.id } },   // ← חיפוש רק לפי id
  });

  if (!record) {
    record = this.userFinancialsRepository.create({
      user,
      total_special_fund_donations: 0,
      total_donations: 0,
      total_monthly_deposits: 0,
      total_equity_donations: 0,
      total_loans_taken: 0,
      total_loans_repaid: 0,
      total_fixed_deposits_deposited: 0,
      total_fixed_deposits_withdrawn: 0,
    });
    await this.userFinancialsRepository.save(record);
  }
  return record;
}

async recordMonthlyDeposit(user: UserEntity, amount: number) {      
    const record = await this.getOrCreateUserFinancials(user);
    record.total_monthly_deposits += amount;
    record.total_donations += amount;
    return this.userFinancialsRepository.save(record);  
    }
    async recordEquityDonation(user: UserEntity, amount: number) {
        const record = await this.getOrCreateUserFinancials(user);
        record.total_equity_donations += amount;
        record.total_donations += amount;
        return this.userFinancialsRepository.save(record);
      }
      async recordSpecialFundDonation(user:UserEntity,amount:number){
        const record = await this.getOrCreateUserFinancials(user)
        record.total_special_fund_donations += amount ;
        record.total_donations += amount
        return this.userFinancialsRepository.save(record)
      }
    async recordLoanTaken(user: UserEntity, amount: number) {
        const record = await this.getOrCreateUserFinancials(user);
        record.total_loans_taken += amount;
        return this.userFinancialsRepository.save(record);
      }
    async recordLoanRepaid(user: UserEntity, amount: number) {
        const record = await this.getOrCreateUserFinancials(user);
        record.total_loans_repaid += amount;
        return this.userFinancialsRepository.save(record);
      } 
      
    async recordFixedDepositAdded(user: UserEntity, amount: number) {
        const record = await this.getOrCreateUserFinancials(user);
        record.total_fixed_deposits_deposited += amount;
        return this.userFinancialsRepository.save(record);
      }
    async recordFixedDepositWithdrawn(user: UserEntity, amount: number) {
        const record = await this.getOrCreateUserFinancials(user);
        record.total_fixed_deposits_withdrawn += amount;
        return this.userFinancialsRepository.save(record);
      }
}

