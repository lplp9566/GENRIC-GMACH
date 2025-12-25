import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FundsOverviewEntity } from './entity/funds-overview.entity';
import { Repository } from 'typeorm';
import { CashHoldingsTypesRecordType } from '../cash-holdings/cash-holdings-dto';
import { FundsOverviewViewEntity } from './funds-overview.view.entity';

@Injectable()
export class FundsOverviewService {
  constructor(
    @InjectRepository(FundsOverviewViewEntity)
    private readonly fundsOverviewRepository: Repository<FundsOverviewViewEntity>,
    @InjectRepository(FundsOverviewViewEntity)
    private readonly fundsOverviewViewEntity: Repository<FundsOverviewViewEntity>,
  ) {}

  /**
   * מחזיר את רשומת ה-FundsOverview היחידה במערכת.
   * אם אין – יוצר אחת חדשה עם סכום התחלתי.
   */
  async getFundsOverviewRecord(): Promise<FundsOverviewEntity> {
    try {
      let fund = await this.fundsOverviewRepository.findOne({
        where: {},
        order: { id: 'ASC' },
      });

      if (!fund) {
        fund = await this.initializeFundsOverview(0);
      }

      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * יצירת רשומת FundsOverview ראשונית.
   */
  async initializeFundsOverview(initialAmount: number) {
    try {
      const existingRecord = await this.fundsOverviewRepository.findOne({
        where: {},
      });
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
      return newRecord;
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

  async adjustDonation(delta: number) {
    try {
      const fund = await this.getFundsOverviewRecord();

      fund.own_equity += delta;
      fund.fund_principal += delta;
      fund.available_funds += delta;
      fund.total_donations += delta;
      fund.total_equity_donations += delta;

      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async adjustSpecialFund(delta: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      fund.special_funds += delta;
      fund.own_equity += delta;
      fund.total_donations += delta;
      fund.available_funds += delta;

      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  /**
   * השקעה מהקרן.
   */
  async addInvestment(amount: number) {
    const fund = await this.getFundsOverviewRecord();
    if (amount > fund.available_funds) {
      throw new NotFoundException('not enough funds');
    }
    console.log(amount);
    
    fund.available_funds -= amount;
    fund.total_invested += amount;
    
    await this.fundsOverviewRepository.save(fund);
    return fund;
  }

  /**
   * רישום רווחי השקעה (החזרת קרן + רווח).
   */
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

  /**
   * הוצאת הלוואה מהקרן.
   */
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
async adjustLoan(diff: number) {
  const fund = await this.getFundsOverviewRecord();

  // diff > 0 → הלוואה גדלה → כסף יוצא
  // diff < 0 → הלוואה קטנה → כסף חוזר
  fund.total_loaned_out += diff;
  fund.available_funds -= diff;

  await this.fundsOverviewRepository.save(fund);
}

  /**
   * תרומת קרן מיוחדת (special fund).
   */
  async addSpecialFund(fundName: string, amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      if (!fund.fund_details) {
        fund.fund_details = {};
      }
      fund.fund_details[fundName] = (fund.fund_details[fundName] || 0) + amount;

      fund.special_funds += amount;
      fund.own_equity += amount;
      fund.total_donations += amount;
      fund.available_funds += amount;

      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * החזר הלוואה לקרן.
   */
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

  /**
   * משיכה מקרן מיוחדת קיימת.
   */
  async reduceFundAmount( amount: number) {
    try {
      const fund = await this.getFundsOverviewRecord();
      fund.special_funds -= amount;
      fund.own_equity -= amount;
      fund.available_funds -= amount;
      await this.fundsOverviewRepository.save(fund);
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * הוספת הוצאה כללית.
   */
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

  /**
   * הוספת הפקדה כוללת של משתמשים (סך הכל).
   */
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

  /**
   * הפחתת סך הפקדונות של משתמשים (לדוגמה בעת החזר).
   */
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

  /**
   * רישום שינוי ביתרות מזומן פיזי (קופה).
   */
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

  /**
   * החזרת פרטי הקרן (לשימוש בדוחות / API).
   */
  async getFundDetails(): Promise<FundsOverviewEntity> {
    try {
      const fund = await this.fundsOverviewViewEntity.findOne({ where: {} });
      if (!fund) {
        throw new NotFoundException('Fund details not found');
      }
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * רישום החזרי הוראות קבע.
   */
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

  /**
   * (נראה שכפול של addToDepositsTotal – השארתי כמו שהיה)
   */
  async increaseUserDepositsTotal(amount: number) {
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
}
