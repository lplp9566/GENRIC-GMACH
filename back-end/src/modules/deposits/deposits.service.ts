import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { UserFinancialService } from '../users/user-financials/user-financials.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { FundsOverviewByYearService } from '../funds-overview-by-year/funds-overview-by-year.service';
import { getYearFromDate } from '../../services/services';
import { DepositsEntity } from './Entity/deposits.entity';
import { FindOpts, LoanStatus, PaginatedResult } from '../../common/index';


@Injectable()
export class DepositsService {
  constructor(
    @InjectRepository(DepositsEntity)
    private readonly depositsRepo: Repository<DepositsEntity>,
    private readonly usersService: UsersService,
    private readonly userFinancialByYearService: UserFinancialByYearService,
    private readonly userFinancialService: UserFinancialService,
    private readonly fundsOverviewService: FundsOverviewService,
    private readonly fundsOverviewServiceByYear: FundsOverviewByYearService,
  ) {}
  async getDeposits(opts:FindOpts):Promise<PaginatedResult<DepositsEntity>> {
    const page = opts.page > 0 ? opts.page : 1;
    const limit = opts.limit > 0 ? Math.min(opts.limit, 100) : 50;

    // בניית ה־where הדינמי
    const where: any = {};

    // סינון לפי סטטוס
    if (opts.status === LoanStatus.ACTIVE) {
      where.isActive = true;
    } else if (opts.status === LoanStatus.INACTIVE) {
      where.isActive = false;
    }

    if (opts.userId) {
      where.user = { id: opts.userId };
    }

    try {
      const [data, total] = await this.depositsRepo.findAndCount({
        where,
        relations: ['user'],
        skip: (page - 1) * limit,
        take: limit,
        order: { start_date: 'DESC' },
      });

      const pageCount = Math.ceil(total / limit);
      return { data, total, page, pageCount };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
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
      await this.fundsOverviewServiceByYear.recordFixedDepositAdded(year,deposit.initialDeposit);
      await this.userFinancialService.recordFixedDepositAdded(user, deposit.initialDeposit);
      await this.userFinancialByYearService.recordFixedDepositAdded(user, year, deposit.initialDeposit);
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
      const year = getYearFromDate(date);
      const user = deposit.user;
      await this.fundsOverviewService.decreaseUserDepositsTotal(amount);
      await this.fundsOverviewServiceByYear.recordFixedDepositWithdrawn(year,amount);
      await this.userFinancialByYearService.recordFixedDepositWithdrawn(user, year, amount);
      await this.userFinancialService.recordFixedDepositWithdrawn(user, amount);
       await this.depositsRepo.save(deposit);
       return this.getDepositsActive();
       ;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  } 
  async addToDeposit(deposit: DepositsEntity, amount: number, date: Date) {
    try {
      deposit.current_balance += amount;
      await this.fundsOverviewService.increaseUserDepositsTotal(amount);
      const year = getYearFromDate(date);
      const user = deposit.user;
      await this.fundsOverviewServiceByYear.recordFixedDepositAdded(year,amount);
      await this.userFinancialByYearService.recordFixedDepositAdded(user, year, amount);
      await this.userFinancialService.recordFixedDepositAdded(user, amount);
       await this.depositsRepo.save(deposit);
       return this.getDepositsActive();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
