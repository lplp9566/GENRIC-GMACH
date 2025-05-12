import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashHoldingsEntity } from './Entity/cash-holdings.entity';
import { UsersService } from '../users/users.service';
import { UserFinancialService } from '../users/user-financials/user-financials.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import {
  CashHoldingRequest,
  CashHoldingsTypesRecordType,
} from './cash-holdings-dto';

@Injectable()
export class CashHoldingsService {
  constructor(
    @InjectRepository(CashHoldingsEntity)
    private cashHoldingsRepository: Repository<CashHoldingsEntity>,
    private readonly UserService: UsersService,
    private readonly userFinancialsService: UserFinancialService,
    private readonly fundsOverviewService: FundsOverviewService,
  ) {}

  async getCashHoldings() {
    return this.cashHoldingsRepository.find();
  }

  async getCashHoldingById(id: number) {
    return this.cashHoldingsRepository.findOne({ where: { id } });
  }

  async cashHolding(cashHolding: CashHoldingRequest) {
    try {
      if (!cashHolding.amount || !cashHolding.user) {
        throw new Error('Missing required fields');
      }

      const user = await this.UserService.getUserById(Number(cashHolding.user));
      if (!user) throw new Error('User not found');
      switch (cashHolding.type) {
        case CashHoldingsTypesRecordType.initialize:
          return this.createCashHolding(cashHolding, user);

        case CashHoldingsTypesRecordType.add:
          return this.updateCashHolding(cashHolding.id!, cashHolding, user);

        case CashHoldingsTypesRecordType.subtract:
          return this.subtractCashHolding(cashHolding.id!, cashHolding, user);

        default:
          throw new Error('Invalid cash holding type');
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async createCashHolding(cashHolding: CashHoldingRequest, user: any) {
    try {
      await this.userFinancialsService.recordCashHoldings(
        user,
        cashHolding.amount,
        CashHoldingsTypesRecordType.add,
      );
      await this.fundsOverviewService.recordCashHoldings(
        cashHolding.amount,
        CashHoldingsTypesRecordType.add,
      );
      const newCashHolding = this.cashHoldingsRepository.create({
        amount: cashHolding.amount,
        user,
        note: cashHolding.note,
        is_active: true,
      });
      const saved = await this.cashHoldingsRepository.save(newCashHolding);
      return {
        id: saved.id,
        amount: saved.amount,
        note: saved.note,
        is_active: saved.is_active,
      };
      
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateCashHolding(
    id: number,
    cashHolding: CashHoldingRequest,
    user: any,
  ) {
    try {
      const existingCashHolding = await this.cashHoldingsRepository.findOne({
        where: { id },
      });
      if (!existingCashHolding || existingCashHolding.is_active == false)
        throw new Error('Cash holding not found');

      existingCashHolding.amount += cashHolding.amount;
      await this.userFinancialsService.recordCashHoldings(
        user,
        cashHolding.amount,
        CashHoldingsTypesRecordType.add,
      );
      await this.fundsOverviewService.recordCashHoldings(
        cashHolding.amount,
        CashHoldingsTypesRecordType.add,
      );

     this.cashHoldingsRepository.save(existingCashHolding);
     return existingCashHolding;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async subtractCashHolding(
    id: number,
    cashHolding: CashHoldingRequest,
    user: any,
  ) {
    try {
      const existingCashHolding = await this.cashHoldingsRepository.findOne({
        where: { id },
      });

      if (!existingCashHolding || existingCashHolding.is_active === false) {
        throw new Error('Cash holding not found or already inactive');
      }

      if (existingCashHolding.amount < cashHolding.amount) {
        throw new Error(
          `Insufficient cash: available ${existingCashHolding.amount}, requested ${cashHolding.amount}`,
        );
      }

      existingCashHolding.amount -= cashHolding.amount;

      if (existingCashHolding.amount === 0) {
        existingCashHolding.is_active = false;
      }

      await this.userFinancialsService.recordCashHoldings(
        user,
        cashHolding.amount,
        CashHoldingsTypesRecordType.subtract,
      );

      await this.fundsOverviewService.recordCashHoldings(
        cashHolding.amount,
        CashHoldingsTypesRecordType.subtract,
      );

      this.cashHoldingsRepository.save(existingCashHolding);
      return existingCashHolding;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
