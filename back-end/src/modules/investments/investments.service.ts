import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvestmentEntity } from './entity/investments.entity';
import { InvestmentTransactionService } from './investment-transactions/investment-transactions.service';
import { TransactionType } from 'src/types/investementsTypes';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(InvestmentEntity)
    private readonly investmentRepo: Repository<InvestmentEntity>,
    private readonly transactionService: InvestmentTransactionService,
    private readonly fundsOverviewService: FundsOverviewService
  ) {}

  async createInitialInvestment(dto: { investment_name: string, amount: number, start_date: Date }) {
    const { investment_name, amount, start_date } = dto;

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
    await this.fundsOverviewService.addInvestment(amount);
    await this.transactionService.createTransaction({
      investmentId: investment.id,
      transaction_type: TransactionType.INITIAL_INVESTMENT,
      amount,
      transaction_date: start_date,
      note: 'השקעה ראשונית',
    });

    return investment;
  }

  async addInvestment(dto: { id: number, amount: number, date: Date }) {
    const { id, amount, date } = dto;
    const investment = await this.findActiveInvestment(id);

    investment.total_principal_invested = +investment.total_principal_invested + amount;
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
  }

  async updateCurrentValue(dto: { id: number, new_value: number, date: Date }) {
    const { id, new_value, date } = dto;
    const investment = await this.findActiveInvestment(id);

    const previousValue = investment.current_value;
    const profitOrLoss = new_value - previousValue;
    investment.current_value = new_value;
    investment.profit_realized = new_value - investment.principal_remaining;
    investment.last_update = date;

    await this.investmentRepo.save(investment);

    await this.transactionService.createTransaction({
      investmentId: investment.id,
      transaction_type:TransactionType.VALUE_UPDATE,
      amount: profitOrLoss,
      transaction_date: date,
      note: 'עדכון ערך',
    });

    return investment;
  }

  async withdraw(dto: { id: number, amount: number, date: Date }) {
    const { id, amount, date } = dto;
    const investment = await this.findActiveInvestment(id);
  
    const currentValue = Number(investment.current_value);
    const principalRemaining = Number(investment.principal_remaining);
    const withdrawnTotal = Number(investment.withdrawn_total);
  
    if (amount > currentValue) {
      throw new BadRequestException('אין מספיק כסף למשיכה');
    }
  
    investment.current_value = currentValue - amount;
    investment.withdrawn_total = withdrawnTotal + amount;
  
    if (investment.current_value === 0) {
      investment.is_active = false;
    }
  
    investment.profit_realized = investment.current_value - principalRemaining;
    investment.last_update = date;
  
    await this.investmentRepo.save(investment);
  
    await this.transactionService.createTransaction({
      investmentId: investment.id,
      transaction_type: TransactionType.WITHDRAWAL,
      amount,
      transaction_date: date,
      note: investment.is_active ? 'משיכה חלקית' : 'משיכה וסגירה',
    });
  
    return investment;
  }
  
  async applyManagementFee(dto: { id: number, feeAmount: number, date: Date }) {
    const { id, feeAmount, date } = dto;
    const investment = await this.findActiveInvestment(id);
  
    const currentValue = Number(investment.current_value);
    const principalRemaining = Number(investment.principal_remaining);
    const managementFeesTotal = Number(investment.management_fees_total);
  
    if (feeAmount > currentValue) {
      throw new BadRequestException('אין מספיק יתרה לדמי ניהול');
    }
  
    investment.current_value = currentValue - feeAmount;
    investment.management_fees_total = managementFeesTotal + feeAmount;
    investment.profit_realized = investment.current_value - principalRemaining;
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
    const investment = await this.investmentRepo.findOne({ where: { id, is_active: true } });
    if (!investment) {
      throw new NotFoundException('השקעה פעילה לא נמצאה');
    }
    return investment;
  }
}
