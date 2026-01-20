import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FundsOverviewEntity } from './entity/funds-overview.entity';
import { Repository } from 'typeorm';
import { CashHoldingsTypesRecordType } from '../cash-holdings/cash-holdings-dto';
import { FundsOverviewViewEntity } from './entity/funds-overview.view.entity';

@Injectable()
export class FundsOverviewService {
  constructor(
    @InjectRepository(FundsOverviewViewEntity)
    private readonly fundsOverviewRepository: Repository<FundsOverviewViewEntity>,

  ) {}

  /**
   * מחזיר את רשומת ה-FundsOverview היחידה במערכת.
   * אם אין – יוצר אחת חדשה עם סכום התחלתי.
   */
  async getFundsOverviewRecord(): Promise<FundsOverviewViewEntity> {
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


  /**
   * החזרת פרטי הקרן (לשימוש בדוחות / API).
   */
  async getFundDetails(): Promise<FundsOverviewViewEntity> {
    try {
      const fund = await this.fundsOverviewRepository.findOne({ where: {} });
      if (!fund) {
        throw new NotFoundException('Fund details not found');
      }
      return fund;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

 
}
