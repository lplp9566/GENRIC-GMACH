import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepositsEntity } from './deposits.entity';
import { UsersService } from '../users/users.service';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { UserFinancialsService } from '../users/user-financials/user-financials.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { FundsOverviewByYearService } from '../funds-overview-by-year/funds-overview-by-year.service';
import { getYearFromDate } from 'src/services/services';
import { addWeeks } from 'date-fns';

@Injectable()
export class DepositsService {
  constructor(
    @InjectRepository(DepositsEntity)
    private readonly depositsRepo: Repository<DepositsEntity>,
    private readonly usersService: UsersService,
    private readonly userFinancialsyYearService: UserFinancialByYearService,
    private readonly userFinancialsService: UserFinancialsService,
    private readonly fundsOverviewService: FundsOverviewService,
    private readonly fundsOvirewviewServiceByYear: FundsOverviewByYearService,
  ) {}
  async getDeposits() {
    return await this.depositsRepo.find();
  }
  async getDepositsActive() {
    return await this.depositsRepo.find({ where: { isActive: true } });
  }
  async getDepositById(id: number) {
    return await this.depositsRepo.findOne({ where: { id } });
  }
  async createDeposit(deposit: DepositsEntity) {
    try {
      if (!deposit) {
        throw new Error('Deposit not found');
      }
      this.depositsRepo.create(deposit);
      deposit.current_balance = deposit.initialDeposit;
      deposit.isActive = true;
      const year = getYearFromDate(deposit.start_date);
      const user = await this.usersService.getUserById(Number(deposit.user));
      if(!user) throw new Error('User not found');
      await this.fundsOverviewService.addToDepositsTotal(deposit.initialDeposit);
      await this.fundsOvirewviewServiceByYear.recordFixedDepositAdded(year,deposit.initialDeposit);
      await this.userFinancialsService.recordFixedDepositAdded(user, deposit.initialDeposit);
      await this.userFinancialsyYearService.recordFixedDepositAdded(user, year, deposit.initialDeposit);
      return await this.depositsRepo.save(deposit);
    } catch (error) {
        throw new BadRequestException(error.message);
    }
  }
  async editEndDate(id: number, end_date: Date) {
    try {
      const deposit = await this.depositsRepo.findOne({ where: { id } });
      if (!deposit) {
        throw new Error('Deposit not found');
      }
      deposit.end_date = end_date;
      await this.depositsRepo.save(deposit);
      return deposit;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async withdrawDeposit(deposit: DepositsEntity,amount: number,date: Date) {
    try {

      if(deposit.current_balance < amount){
        throw new Error('Not enough balance');
      }
      deposit.current_balance -= amount;
      if(deposit.current_balance == 0){
        deposit.isActive = false;
      }
      await this.fundsOverviewService.decreaseUserDepositsTotal(amount);
      const year = getYearFromDate(date);
      console.log("lplplp")
      const user = deposit.user;
      await this.fundsOverviewService.decreaseUserDepositsTotal(amount);
      await this.fundsOvirewviewServiceByYear.recordFixedDepositWithdrawn(year,amount);
      await this.userFinancialsyYearService.recordFixedDepositWithdrawn(user, year, amount);
      await this.userFinancialsService.recordFixedDepositWithdrawn(user, amount);
       await this.depositsRepo.save(deposit);
       return this.getDepositsActive();
       ;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  } 
}
