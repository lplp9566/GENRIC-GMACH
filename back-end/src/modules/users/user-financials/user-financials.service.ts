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
        let record = await this.userFinancialsRepository.findOne({ where: { user, year } });
      
        if (!record) {
          record = this.userFinancialsRepository.create({
            user,
            year,
            total_deposits: 0,
            total_donations: 0,
            total_loans_taken: 0,
            total_loans_repaid: 0,
          });
      
          await this.userFinancialsRepository.save(record);
        }
      
        return record;
      }
    async recordMonthlyDeposit(user: UserEntity, year: number, amount: number) {      
    const record = await this.getOrCreateFinancialRecord(user, year);
    record.total_deposits += amount;
    return this.userFinancialsRepository.save(record);  
    }
    async recordDonation(user: UserEntity, year: number, amount: number) {
        const record = await this.getOrCreateFinancialRecord(user, year);
        record.total_donations += amount;
        return this.userFinancialsRepository.save(record);
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
      

    
}
