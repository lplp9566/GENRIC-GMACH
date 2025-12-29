import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrderReturnService } from './order-return.service';
import { OrderReturnEntity } from './Entity/order-return.entity';

@Controller('order-return')
export class OrderReturnController {
  constructor(private readonly orderReturnService: OrderReturnService) {}
  @Get()
  async getOrderReturns() {
    return await this.orderReturnService.getOrderReturns();
  }
  @Post()
  async createOrderReturn(@Body() orderReturn: Partial<OrderReturnEntity>) {
    return await this.orderReturnService.createOrderReturn(orderReturn);
  }
  @Post(':id/pay')
  async payOrderReturn(
    @Body() payData: { paid_at: Date},
    @Param('id') id: number,
  ) {
    return await this.orderReturnService.payOrderReturn(id, payData.paid_at);
  }
}
