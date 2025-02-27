import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FundsOverviewEntity } from './funds-overview.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FundsOverviewService {
  constructor(
    @InjectRepository(FundsOverviewEntity)
    private readonly fundsOverviewRepository: Repository<FundsOverviewEntity>,
  ) {}
  async getFundsOverviewRecord(): Promise<FundsOverviewEntity> {
    const fund = await this.fundsOverviewRepository.findOne({ where: {} });
    if (!fund) {
        throw new Error('Funds overview not initialized');
    }
    return fund;
}

async initializeFundsOverview(initialAmount: number) {
    try {
        const existingRecord = await this.fundsOverviewRepository.findOne({ where: {} });
        
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
            special_funds: 0,
            fund_details: {},
        });

        await this.fundsOverviewRepository.save(newRecord);
        return newRecord; // מחזירים את הנתונים שנשמרו
    } catch (error) {
        return error.message;
    }
}


  async addMonthlyDeposit(amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord()
      fund.total_funds += amount;
      fund.available_funds += amount;
      fund.monthly_deposits += amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      return error.message;
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
      return error.message;
    }
  }
  async addInvestment(amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      fund.available_funds -= amount;
      fund.investments += amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      return error.message;
    }
  }
  async addLoan(amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      fund.available_funds -= amount;
      fund.loaned_amount += amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      return error.message;
    }
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
      return fund;
    } catch (error) {
      return error.message;
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
      return error.message;
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
      return fund;
    } catch (error) {
      return error.message;
    }
  }
  async addExpense(amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      fund.expenses_total += amount;
      fund.available_funds -= amount;
      fund.total_funds -= amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      return error.message;
    }
  }
  async addToDepositsTotal (amount: number) {   
    try {
      const fund = await this.getFundsOverviewRecord();
      fund.total_funds += amount;
      fund.available_funds += amount;
      fund.user_deposits_total += amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      return error.message;
    }
  }
  async editUserDepositsTotal (amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      fund.total_funds -= amount;
      fund.available_funds -= amount;
      fund.user_deposits_total -= amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      return error.message;
    }
  }
}
