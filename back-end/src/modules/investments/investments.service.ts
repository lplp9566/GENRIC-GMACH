import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvestmentEntity } from './entity/investments.entity';
import { InvestmentTransactionService } from './investment-transactions/investment-transactions.service';
import { TransactionType } from '../investments/investmentsTypes';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(InvestmentEntity)
    private readonly investmentRepo: Repository<InvestmentEntity>,
    private readonly transactionService: InvestmentTransactionService,
    private readonly fundsOverviewService: FundsOverviewService,
  ) {}

  async createInitialInvestment(dto: {
    investment_name: string;
    amount: number;
    start_date: Date;
  }) {
    try {
      const { investment_name, amount, start_date } = dto;
      await this.fundsOverviewService.addInvestment(amount);
      const investment = this.investmentRepo.create({
        investment_name,
        total_principal_invested: amount,
        principal_remaining: amount,
        current_value: amount,
        start_date,
        last_update: start_date,
        is_active: true,
      });
      await this.investmentRepo.save(investment);
      await this.transactionService.createTransaction({
        investmentId: investment.id,
        transaction_type: TransactionType.INITIAL_INVESTMENT,
        amount,
        transaction_date: start_date,
        note: 'השקעה ראשונית',
      });
      return investment;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async addInvestment(dto: { id: number; amount: number; date: Date }) {
    try {
      const { id, amount, date } = dto;
      const investment = await this.findActiveInvestment(id);
      await this.fundsOverviewService.addInvestment(amount);
      investment.total_principal_invested =
        +investment.total_principal_invested + amount;
      investment.principal_remaining = +investment.principal_remaining + amount;
      investment.current_value = +investment.current_value + amount;
      investment.last_update = date;
      await this.investmentRepo.save(investment);
      await this.transactionService.createTransaction({
        investmentId: investment.id,
        transaction_type: TransactionType.ADDITIONAL_INVESTMENT,
        amount,
        transaction_date: date,
        note: 'הוספת קרן',
      });

      return investment;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateCurrentValue(dto: { id: number; new_value: number; date: Date }) {
    try {
      const { id, new_value, date } = dto;
      const investment = await this.findActiveInvestment(id);
      if (!investment) {
        throw new Error('investment not found');
      }
      const previousValue = investment.current_value;
      const profitOrLoss = new_value - previousValue;
      const profit_realized = new_value - investment.principal_remaining;
      investment.current_value = new_value;
      investment.profit_realized = profit_realized;
      investment.last_update = date;

      await this.investmentRepo.save(investment);
      await this.transactionService.createTransaction({
        investmentId: investment.id,
        transaction_type: TransactionType.VALUE_UPDATE,
        amount: profitOrLoss,
        transaction_date: date,
        note: 'עדכון ערך',
      });

      return investment;
    } catch (error) {
      return error.message;
    }
  }

  async withdraw(dto: { id: number; amount: number; date: Date }) {
    try {
      const { id, amount, date } = dto;
      const investment = await this.findActiveInvestment(id);

      let currentValue = Number(investment.current_value);
      let principalRemaining = Number(investment.principal_remaining);
      let withdrawnTotal = Number(investment.withdrawn_total);

      if (amount > currentValue) {
        throw new Error('not enough funds');
      }
      let profitWithdrawal = Math.max(0, currentValue - principalRemaining);
      let principalWithdrawal = 0;
      let profitWithdrawn = Math.min(amount, profitWithdrawal);
      if (amount > profitWithdrawal) {
        principalWithdrawal = amount - profitWithdrawn;
        principalRemaining -= principalWithdrawal;
      }

      investment.current_value = currentValue - amount;
      investment.withdrawn_total = withdrawnTotal + amount;
      investment.principal_remaining = principalRemaining;

      if (investment.current_value === 0) {
        investment.is_active = false;
      }

      investment.profit_realized =
        investment.current_value - principalRemaining;
      investment.last_update = date;

      await this.investmentRepo.save(investment);

      await this.transactionService.createTransaction({
        investmentId: investment.id,
        transaction_type: TransactionType.WITHDRAWAL,
        amount,
        transaction_date: date,
        note: investment.is_active ? ' part of withdrawal' : 'full withdrawal',
      });
      await this.fundsOverviewService.recordInvestmentEarnings(
        principalWithdrawal,
        profitWithdrawn,
      );

      return {
        investment,
        profitWithdrawn,
        principalWithdrawal,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async applyManagementFee(dto: { id: number; feeAmount: number; date: Date }) {
    const { id, feeAmount, date } = dto;
    const investment = await this.findActiveInvestment(id);

    const currentValue = Number(investment.current_value);
    let profitRealized =
      Number(investment.current_value) - Number(investment.principal_remaining);
    let principalRemaining = Number(investment.principal_remaining);
    const managementFeesTotal = Number(investment.management_fees_total);

    // if (feeAmount > currentValue) {
    //     throw new BadRequestException('אין מספיק יתרה לדמי ניהול');
    // }

    if (feeAmount <= profitRealized) {
      profitRealized -= feeAmount;
    } else {
      const remainingFee = feeAmount - profitRealized;
      profitRealized = 0;
      principalRemaining -= remainingFee;
    }

    investment.current_value -= feeAmount;
    investment.management_fees_total = managementFeesTotal + feeAmount;
    investment.profit_realized = profitRealized;
    investment.principal_remaining = principalRemaining;
    investment.last_update = date;

    await this.investmentRepo.save(investment);

    await this.transactionService.createTransaction({
      investmentId: investment.id,
      transaction_type: TransactionType.MANAGEMENT_FEE,
      amount: feeAmount,
      transaction_date: date,
      note: 'דמי ניהול',
    });

    return investment;
  }
  async getInvestmentById(id: number) {
    const investment = await this.investmentRepo.findOne({ where: { id } });
    if (!investment) {
      throw new NotFoundException('השקעה לא נמצאה');
    }
    return investment;
  }

  async getAllInvestments() {
    return this.investmentRepo.find({ order: { last_update: 'DESC' } });
  }

  private async findActiveInvestment(id: number): Promise<InvestmentEntity> {
    try {
      const investment = await this.investmentRepo.findOne({
        where: { id, is_active: true },
      });
      if (!investment) {
        throw new Error('investment not fond');
      }
      return investment;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
