import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FundsOverviewByYearEntity } from './Entity/funds-overview-by-year.entity';

@Injectable()
export class FundsOverviewByYearService {
  constructor(
    @InjectRepository(FundsOverviewByYearEntity)
    private readonly fundsOverviewByYearRepo: Repository<FundsOverviewByYearEntity>,
  ) {}

  async getOrCreateOverview(year: number): Promise<FundsOverviewByYearEntity> {
    let record = await this.fundsOverviewByYearRepo.findOne({
      where: { year },
    });
    if (!record) {
      record = this.fundsOverviewByYearRepo.create({
        year,
        total_monthly_deposits: 0,
        total_equity_donations: 0,
        special_fund_donations: 0,
        total_loans_taken: 0,
        total_loans_amount: 0,
        total_loans_repaid: 0,
        total_fixed_deposits_added: 0,
        total_fixed_deposits_withdrawn: 0,
        total_standing_order_return: 0,
        total_special_funds_withdrawn: 0,
        total_expenses: 0,
      });
      await this.fundsOverviewByYearRepo.save(record);
    }
    return record;
  }
  async getAllFundsOverview(): Promise<FundsOverviewByYearEntity[]> {
    return this.fundsOverviewByYearRepo.find({ order: { year: 'ASC' } });
  }
  async recordMonthlyDeposit(year: number, amount: number) {
    const record = await this.getOrCreateOverview(year);
    record.total_monthly_deposits += amount;
    return this.fundsOverviewByYearRepo.save(record);
  }

  async adjustEquityDonation(year: number, amount: number) {
    const record = await this.getOrCreateOverview(year);
    record.total_equity_donations += amount;
    record.total_donations += amount;
    return this.fundsOverviewByYearRepo.save(record);
  }

  async adjustSpecialFundDonationByName(year: number, amount: number) {
    const record = await this.getOrCreateOverview(year);
    record.special_fund_donations += amount;
    return this.fundsOverviewByYearRepo.save(record);
  }

  async recordSpecialFundWithdrawalByName(year: number, amount: number) {
    const record = await this.getOrCreateOverview(year);
    record.total_special_funds_withdrawn += amount;
    return this.fundsOverviewByYearRepo.save(record);
  }

  async recordLoanTaken(year: number, loanAmount: number) {
    const record = await this.getOrCreateOverview(year);
    record.total_loans_taken += 1;
    record.total_loans_amount += loanAmount;
    return this.fundsOverviewByYearRepo.save(record);
  }
  async recordFixLoan(year: number, diff: number) {
    const fund = await this.getOrCreateOverview(year);
    fund.total_loans_amount += diff;
    await this.fundsOverviewByYearRepo.save(fund);
  }

  async recordAddToLoan(year: number, amount: number) {
    const record = await this.getOrCreateOverview(year);
    record.total_loans_amount += amount;
    return this.fundsOverviewByYearRepo.save(record);
  }

  async recordLoanRepaid(year: number, amount: number) {
    const record = await this.getOrCreateOverview(year);
    record.total_loans_repaid += amount;
    return this.fundsOverviewByYearRepo.save(record);
  }

  async recordFixedDepositAdded(year: number, amount: number) {
    const record = await this.getOrCreateOverview(year);
    record.total_fixed_deposits_added += amount;
    return this.fundsOverviewByYearRepo.save(record);
  }

  async recordFixedDepositWithdrawn(year: number, amount: number) {
    const record = await this.getOrCreateOverview(year);
    record.total_fixed_deposits_withdrawn += amount;
    return this.fundsOverviewByYearRepo.save(record);
  }

  async recordStandingOrderReturn(year: number, amount: number) {
    const record = await this.getOrCreateOverview(year);
    record.total_standing_order_return += amount;
    return this.fundsOverviewByYearRepo.save(record);
  }
  async recordExpense(year: number, amount: number) {
    const record = await this.getOrCreateOverview(year);
    record.total_expenses += amount;
    return this.fundsOverviewByYearRepo.save(record);
  }
  async recordInvestmentIn(year: number, amount: number) {
    const record = await this.getOrCreateOverview(year);
    record.total_investments_in += amount;
    return this.fundsOverviewByYearRepo.save(record);
  }
  async recordInvestmentOut(year: number, amount: number) {
    const record = await this.getOrCreateOverview(year);
    record.total_investments_out += amount;
    return this.fundsOverviewByYearRepo.save(record);
  }
}
