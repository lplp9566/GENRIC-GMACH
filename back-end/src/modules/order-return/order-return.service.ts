import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OrderReturnEntity } from './Entity/order-return.entity';
import { UsersService } from '../users/users.service';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { UserFinancialService } from '../users/user-financials/user-financials.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { getYearFromDate } from '../../services/services';
import { FundsOverviewByYearService } from '../funds-overview-by-year/funds-overview-by-year.service';

@Injectable()
export class OrderReturnService {
    constructor(
        @InjectRepository(OrderReturnEntity)
        private readonly orderReturnRepository: Repository<OrderReturnEntity>,
        private readonly usersService: UsersService,
        private readonly userFinancialsyYearService: UserFinancialByYearService,
        private readonly userFinancialsService: UserFinancialService,
        private readonly fundsOverviewService: FundsOverviewService,
        private readonly fundsOverviewByYearService: FundsOverviewByYearService,
  ) {}
  async getOrderReturns() {
    return await this.orderReturnRepository.find();
  }
  async createOrderReturn(orderReturn: Partial<OrderReturnEntity>): Promise<OrderReturnEntity> {
    const year = getYearFromDate(orderReturn.date!);
    orderReturn.paid = false;
    // await this.userFinancialsyYearService.recordStandingOrderReturn(user, year, orderReturn.amount);
    // await this.userFinancialsService.recordStandingOrderReturn(user, orderReturn.amount);
    // await this.fundsOverviewService.addToStandingOrderReturn(orderReturn.amount);
    // await this.fundsOverviewByYearService.recordStandingOrderReturn(year, orderReturn.amount);
    return await this.orderReturnRepository.save(orderReturn);
  }
  async payOrderReturn(id: number,paid_at: Date): Promise<OrderReturnEntity> {
    const orderReturn =  await this.orderReturnRepository.findOne({where: { id }, relations: ['user']});
    if (!orderReturn) throw new BadRequestException('Order return not found');    ;
    orderReturn.paid = true;
    // await this.userFinancialsyYearService.recordStandingOrderReturnPayment(user, year, orderReturn.amount);
    // await this.userFinancialsService.recordStandingOrderReturnPayment(user, orderReturn.amount);
    // await this.fundsOverviewService.recordStandingOrderReturnPayment(orderReturn.amount);
    // await this.fundsOverviewByYearService.recordStandingOrderReturnPayment(year, orderReturn.amount);
    return await this.orderReturnRepository.save(orderReturn);
  }
  
}
