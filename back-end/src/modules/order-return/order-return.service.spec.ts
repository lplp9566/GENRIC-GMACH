import { Test, TestingModule } from '@nestjs/testing';
import { OrderReturnService } from './order-return.service';

describe('OrderReturnService', () => {
  let service: OrderReturnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderReturnService],
    }).compile();

    service = module.get<OrderReturnService>(OrderReturnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
