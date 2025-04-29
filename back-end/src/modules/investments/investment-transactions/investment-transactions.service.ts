import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvestmentTransactionEntity } from '../investment-transactions/entity/investment-transaction.entity';
import { InvestmentEntity } from '../entity/investments.entity';
import { TransactionType } from 'src/modules/investments/investmentsTypes';

@Injectable()
export class InvestmentTransactionService {
  constructor(
    @InjectRepository(InvestmentTransactionEntity)
    private readonly transactionRepo: Repository<InvestmentTransactionEntity>,
    @InjectRepository(InvestmentEntity)
    private readonly investmentRepo: Repository<InvestmentEntity>,
  ) {}

  async createTransaction(dto: {
    investmentId: number,
    transaction_type: TransactionType,
    amount: number,
    transaction_date: Date,
    note?: string,

  }) {
    const investment = await this.investmentRepo.findOne({ where: { id: dto.investmentId } });
    if (!investment) {
      throw new NotFoundException('השקעה לא קיימת');
    }

    const transaction = this.transactionRepo.create({
      investment,
      transaction_type: dto.transaction_type,
      amount: dto.amount,
      transaction_date: dto.transaction_date,
      note: dto.note,
    });

    return this.transactionRepo.save(transaction);
  }

  async getTransactionsByInvestmentId(investmentId: number) {
    const investment = await this.investmentRepo.findOne({ where: { id: investmentId } });
    if (!investment) {
      throw new NotFoundException('השקעה לא קיימת');
    }

    return this.transactionRepo.find({
      where: { investment: { id: investmentId } },
      order: { transaction_date: 'DESC' },
    });
  }

  async getAllTransactions() {
    return this.transactionRepo.find({
      relations: ['investment'],
      order: { transaction_date: 'DESC' },
    });
  }

  async filterTransactions(filterDto: {
    investmentId?: number,
    transaction_type?: string,
    startDate?: Date,
    endDate?: Date
  }) {
    const query = this.transactionRepo.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.investment', 'investment');

    if (filterDto.investmentId) query.andWhere('investment.id = :id', { id: filterDto.investmentId });
    if (filterDto.transaction_type) query.andWhere('transaction.transaction_type = :type', { type: filterDto.transaction_type });
    if (filterDto.startDate) query.andWhere('transaction.transaction_date >= :start', { start: filterDto.startDate });
    if (filterDto.endDate) query.andWhere('transaction.transaction_date <= :end', { end: filterDto.endDate });

    return query.orderBy('transaction.transaction_date', 'DESC').getMany();
  }
}
