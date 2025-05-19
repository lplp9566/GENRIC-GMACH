import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FundsOverviewEntity } from './entity/funds-overview.entity';
import { Repository } from 'typeorm';
import { log } from 'console';
import { ApiResponse } from '../../utils/response.utils';
import { first } from 'rxjs';
import { CashHoldingsTypesRecordType } from '../cash-holdings/cash-holdings-dto';

@Injectable()
export class FundsOverviewService {
  constructor(
    @InjectRepository(FundsOverviewEntity)
    private readonly fundsOverviewRepository: Repository<FundsOverviewEntity>,
  ) {}
  async getFundsOverviewRecord() {
    try {
      const fund = await this.fundsOverviewRepository
        .find({ take: 1 })
        .then((r) => r[0] ?? null);
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
        own_equity: initialAmount,
        fund_principal: initialAmount,
        available_funds: initialAmount,
        monthly_deposits: 0,
        total_loaned_out: 0,
        total_invested: 0,
        total_user_deposits: 0,
        standing_order_return: 0,
        total_expenses: 0,
        total_donations: 0,
        Investment_profits: 0,
        special_funds: 0,
        fund_details: {},
        cash_holdings: 0,
        total_equity_donations: 0,
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
      fund.own_equity += amount;
      fund.fund_principal += amount;
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
      fund.own_equity += amount;
      fund.fund_principal += amount;
      fund.available_funds += amount;
      fund.total_donations += amount;
      fund.total_equity_donations += amount;
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
    fund.total_invested += amount;
    await this.fundsOverviewRepository.save(fund);
    return fund;
  }

  async recordInvestmentEarnings(principal: number, profit: number) {
    const fund = await this.getFundsOverviewRecord();
    fund.available_funds += principal;
    fund.available_funds += profit;
    fund.Investment_profits += profit;
    fund.total_invested -= principal;
    fund.own_equity += profit;
    await this.fundsOverviewRepository.save(fund);
    return fund;
  }
  async addLoan(amount: number) {
    const fund = await this.getFundsOverviewRecord();
    if (amount > fund.available_funds) {
      throw new NotFoundException('not enough funds');
    }
    fund.available_funds -= amount;
    fund.total_loaned_out += amount;
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
      fund.own_equity += amount;
      fund.total_donations += amount
      fund.available_funds += amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async repayLoan(amount: number) {
    try {
      const fund = await this.fundsOverviewRepository.findOne({ where: {} });
      if (!fund) throw new Error('General Fund not found');
      fund.total_loaned_out -= amount;
      fund.available_funds += amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async reduceFundAmount(fundName: string, amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      if (!fund.fund_details) {
        fund.fund_details = {};
      }
      if (!fund.fund_details[fundName]) {
        throw new Error('no mony in this fund');
      }
      if (fund.fund_details[fundName] < amount) {
        throw new Error('not enough funds in this fund');
      }
      fund.fund_details[fundName] -= amount;
      fund.special_funds -= amount;
      fund.own_equity -= amount;
      fund.available_funds -= amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async addExpense(amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      fund.total_expenses += amount;
      fund.available_funds -= amount;
      fund.own_equity -= amount;
      fund.fund_principal -= amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async addToDepositsTotal(amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      fund.own_equity += amount;
      fund.available_funds += amount;
      fund.total_user_deposits += amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async decreaseUserDepositsTotal(amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      fund.own_equity -= amount;
      fund.available_funds -= amount;
      fund.total_user_deposits -= amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
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
  async getFundDetails(): Promise<FundsOverviewEntity> {
    try {
      const fund = await this.fundsOverviewRepository.findOne({ where: {} });
      if (!fund) {
        throw new NotFoundException('Fund details not found');
      }
      return fund
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async addToStandingOrderReturn(amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      if (!fund) {
        throw new NotFoundException('Fund details not found');
      }
      fund.standing_order_return += amount;
      fund.available_funds += amount;
      fund.own_equity += amount;
      fund.fund_principal += amount;
      return this.fundsOverviewRepository.save(fund);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
