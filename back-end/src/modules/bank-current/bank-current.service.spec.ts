import { Test, TestingModule } from '@nestjs/testing';
import { BankCurrentService } from './bank-current.service';

describe('BankCurrentService', () => {
  let service: BankCurrentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: BankCurrentService, useValue: {} }],
    }).compile();

    service = module.get<BankCurrentService>(BankCurrentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
