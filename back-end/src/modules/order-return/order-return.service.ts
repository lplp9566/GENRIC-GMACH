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
import { log } from 'console';
import { CreateOrdersReturnDto } from './new-order-return-dto';

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
    return await this.orderReturnRepository.find({relations: ['user']});
  }
  async getOrderReturnByUserId(userId: number) {
    return await this.orderReturnRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
 async createOrderReturn(orderReturn: CreateOrdersReturnDto): Promise<OrderReturnEntity> {
  const year = getYearFromDate( new Date(orderReturn.date) ?? orderReturn.date);

  const userId = orderReturn.userId;
  const user = await this.usersService.getUserById(Number(userId));
  if (!user) throw new BadRequestException("User not found");
  
  const newOrderReturn = this.orderReturnRepository.create({
    amount: orderReturn.amount,
    date: orderReturn.date,
    user ,
    note: orderReturn.note?? orderReturn.note ?? '',
    paid: false,
    paid_at: null,
  });


  return this.orderReturnRepository.save(newOrderReturn);
}

  async payOrderReturn(id: number,paid_at: Date): Promise<OrderReturnEntity> {
    const orderReturn =  await this.orderReturnRepository.findOne({where: { id }, relations: ['user']});
    if (!orderReturn) throw new BadRequestException('Order return not found');    ;
    orderReturn.paid = true;
    orderReturn.paid_at = paid_at;
    return await this.orderReturnRepository.save(orderReturn);
  }
  async deleteOrderReturn(id: number): Promise<void> {
    await this.orderReturnRepository.delete(id);
  }
  async editorderReturn(id: number, updateData: Partial<OrderReturnEntity>): Promise<OrderReturnEntity> { 
    const orderReturn = await this.orderReturnRepository.findOne({ where: { id } });
    if (!orderReturn) throw new BadRequestException('Order return not found');
    Object.assign(orderReturn, updateData);
    return await this.orderReturnRepository.save(orderReturn);
  }
}
