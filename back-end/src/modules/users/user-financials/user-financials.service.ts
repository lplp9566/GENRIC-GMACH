import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user.entity';
import { UserFinancialEntity } from './user-financials.entity';
import { UserFinancialViewEntity } from './user-financials.view.entity';
// cSpell:ignore Financials

@Injectable()
export class UserFinancialService {
constructor(

  @InjectRepository(UserFinancialViewEntity)
  private readonly userFinancialsViewRepository: Repository<UserFinancialViewEntity>,

) {}

async getOrCreateUserFinancials(user: UserEntity) {
let record = await this.userFinancialsViewRepository.findOne({
  where: { userId: user.id },
});


  return record;
}

async getAllUserFinancials() {
  return this.userFinancialsViewRepository.find();
}

async getUserFinancialsByUserId(userId: number) {
  if (!userId) return null;
  return this.userFinancialsViewRepository.findOne({
    where: { userId },
  });
}


}

