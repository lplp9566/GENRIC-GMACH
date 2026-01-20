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

    return records;
  }
async getUserFinancialsByYear() {

    return this.userFinancialsByYearViewRepository.find({order: {year: 'ASC'}});
  }

  async getOrCreateFinancialRecord(
    user: UserEntity,
    year: number,
  ) {
    const record = await this.userFinancialsByYearViewRepository.findOne({
      where: { userId: user.id , year }, 
    });

    return record;
    

  }


}
