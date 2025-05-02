import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FundsOverviewEntity } from './entity/funds-overview.entity';
import { Repository } from 'typeorm';
import { log } from 'console';
import { ApiResponse } from '../../utils/response.utils';
import { first } from 'rxjs';
import { CashHoldingsTypesRecordType } from '../cash-holdings/cash-holdingsTypes';

@Injectable()
export class FundsOverviewService {
  constructor(
    @InjectRepository(FundsOverviewEntity)
    private readonly fundsOverviewRepository: Repository<FundsOverviewEntity>,
  ) {}
  async getFundsOverviewRecord() {
    try {
      const fund = await this.fundsOverviewRepository.find({ take: 1 }).then(r => r[0] ?? null);
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);

    }
  }

  async initializeFundsOverview(initialAmount: number) {
    try {
      const existingRecord = await this.getFundsOverviewRecord();
      if (existingRecord) {
        throw new Error('Funds overview already initialized');
      }

      const newRecord = this.fundsOverviewRepository.create({
        total_funds: initialAmount,
        available_funds: initialAmount,
        monthly_deposits: 0,
        donations_received: 0,
        loaned_amount: 0,
        investments: 0,
        Investment_profits: 0,
        special_funds: 0,
        fund_details: {},
      });

      await this.fundsOverviewRepository.save(newRecord);
      return ApiResponse.success(newRecord);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async addMonthlyDeposit(amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      fund.total_funds += amount;
      fund.available_funds += amount;
      fund.monthly_deposits += amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async addDonation(amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      fund.total_funds += amount;
      fund.available_funds += amount;
      fund.donations_received += amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async addInvestment(amount: number) {
    const fund = await this.getFundsOverviewRecord();
    if (amount > fund.available_funds) {
      throw new NotFoundException('not enough funds');
    }
    fund.available_funds -= amount;
    fund.investments += amount;
    await this.fundsOverviewRepository.save(fund);
    return fund;
  }

  async addInvestmentProfits(principal: number, profit: number) {
          const fund = await this.getFundsOverviewRecord();
      fund.available_funds += principal;
      fund.available_funds += profit
      fund.Investment_profits += profit;
      fund.investments -= principal;
      fund.total_funds += profit;
      await this.fundsOverviewRepository.save(fund);
      return fund;

  }
  async addLoan(amount: number) {
    const fund = await this.getFundsOverviewRecord();
    if (amount > fund.available_funds) {
      throw new NotFoundException('not enough funds');
    }
    fund.available_funds -= amount;
    fund.loaned_amount += amount;
    await this.fundsOverviewRepository.save(fund);
    return fund;
  }
  async addSpecialFund(fundName: string, amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      if (!fund.fund_details) {
        fund.fund_details = {};
      }
      fund.fund_details[fundName] = (fund.fund_details[fundName] || 0) + amount;
      fund.special_funds += amount;
      await this.fundsOverviewRepository.save(fund);
      return fund
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async repayLoan(amount: number) {
    try {
      const fund = await this.fundsOverviewRepository.findOne({ where: {} });
      if (!fund) throw new Error('General Fund not found');

      fund.loaned_amount -= amount;
      fund.available_funds += amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateFundDetails(fundName: string, amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      if (!fund.fund_details) {
        fund.fund_details = {};
      }
      if (!fund.fund_details[fundName]) {
        throw new Error('no mony in this fund');
      }
      fund.fund_details[fundName] -= amount;
      fund.special_funds -= amount;
      await this.fundsOverviewRepository.save(fund);
      return fund
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async addExpense(amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      fund.expenses_total += amount;
      fund.available_funds -= amount;
      fund.total_funds -= amount;
      await this.fundsOverviewRepository.save(fund);
      return fund
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async addToDepositsTotal(amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      fund.total_funds += amount;
      fund.available_funds += amount;
      fund.user_deposits_total += amount;
      await this.fundsOverviewRepository.save(fund);
     return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async editUserDepositsTotal(amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      fund.total_funds -= amount;
      fund.available_funds -= amount;
      fund.user_deposits_total -= amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }
  async recordCashHoldings(amount: number, type: CashHoldingsTypesRecordType) {
    try {
      const fund = await this.getFundsOverviewRecord();
      if (type === CashHoldingsTypesRecordType.add) {
        fund.cash_holdings += amount;
      } else if (type === CashHoldingsTypesRecordType.subtract) {
        fund.cash_holdings -= amount;
      } else {
        throw new Error('Invalid type for cash holdings record');
      }
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async getFundDetails() {  
    try {
      const fund = await this.getFundsOverviewRecord();
      if (!fund) {
        throw new NotFoundException('Fund details not found');
      }
      return fund.fund_details;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
