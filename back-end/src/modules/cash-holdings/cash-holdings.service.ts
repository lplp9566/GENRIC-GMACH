import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashHoldingsEntity } from './Entity/cash-holdings.entity';
import { UsersService } from '../users/users.service';
import { UserFinancialsService } from '../users/user-financials/user-financials.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { CashHoldingsTypesRecordType } from './cash-holdingsTypes';

@Injectable()
export class CashHoldingsService {
    constructor(
        @InjectRepository(CashHoldingsEntity)
        private  cashHoldingsRepository: Repository<CashHoldingsEntity>,
        private readonly UserService: UsersService,
        private readonly userFinancialsService: UserFinancialsService,
        private readonly fundsOverviewService: FundsOverviewService,
    ) {}

    async getCashHoldings() {
        return this.cashHoldingsRepository.find();
    }
    async createCashHolding(cashHolding: CashHoldingsEntity) {
        try {
        if (!cashHolding.amount  || !cashHolding.user) {
            throw new Error('Missing required fields');
        }
        const user = await this.UserService.getUserById(Number(cashHolding.user));
        if (!user) throw new Error('User not found');
        const userFinancials = await this.userFinancialsService.recordCashHoldings(user, cashHolding.amount,CashHoldingsTypesRecordType.add);
        await this.fundsOverviewService.recordCashHoldings(cashHolding.amount, CashHoldingsTypesRecordType.add);
        return this.cashHoldingsRepository.save(cashHolding);
    } catch (error) {
        throw new BadRequestException(error.message);
    }
    }
    async updateCashHolding(id: number, cashHolding: CashHoldingsEntity) {
        try {
        const existingCashHolding = await this.cashHoldingsRepository.findOne({ where: { id } });
        if (!existingCashHolding) throw new Error('Cash holding not found');
        const user = await this.UserService.getUserById(Number(cashHolding.user));
        if (!user) throw new Error('User not found');
        existingCashHolding.amount += cashHolding.amount;
        await this.fundsOverviewService.recordCashHoldings(cashHolding.amount, CashHoldingsTypesRecordType.add);
        await this.userFinancialsService.recordCashHoldings(user, cashHolding.amount,CashHoldingsTypesRecordType.add);
          return this.cashHoldingsRepository.save(existingCashHolding);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
    async subtractCashHolding(id: number, cashHolding: CashHoldingsEntity) {
        try {
        const existingCashHolding = await this.cashHoldingsRepository.findOne({ where: { id } });
        if (!existingCashHolding) throw new Error('Cash holding not found');
        existingCashHolding.amount -= cashHolding.amount;
        const user = await this.UserService.getUserById(Number(cashHolding.user));
        if (!user) throw new Error('User not found');
        await this.fundsOverviewService.recordCashHoldings(cashHolding.amount, CashHoldingsTypesRecordType.subtract);
        await this.userFinancialsService.recordCashHoldings(user, cashHolding.amount,CashHoldingsTypesRecordType.subtract);
          return this.cashHoldingsRepository.save(existingCashHolding);         
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

}
