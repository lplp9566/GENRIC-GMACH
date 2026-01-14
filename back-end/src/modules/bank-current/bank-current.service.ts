import { Injectable } from '@nestjs/common';
import { CreateBankCurrentDto } from './dto/create-bank-current.dto';
import { UpdateBankCurrentDto } from './dto/update-bank-current.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankCurrentEntity } from './entities/bank-current.entity';

@Injectable()
export class BankCurrentService {
  constructor(
    @InjectRepository(BankCurrentEntity)
    private readonly bankCurrentRepository: Repository<BankCurrentEntity>,
  ) {}

  create(createBankCurrentDto: CreateBankCurrentDto) {
    return this.bankCurrentRepository.save({
      ...createBankCurrentDto,
      date: new Date(createBankCurrentDto.date),
    });
  }

  findAll() {
    return this.bankCurrentRepository.find({ order: { date: "DESC" } });
  }

  findOne(id: number) {
    return this.bankCurrentRepository.findOne({ where: { id } });
  }

  update(id: number, updateBankCurrentDto: UpdateBankCurrentDto) {
    return this.bankCurrentRepository.update(id, {
      ...updateBankCurrentDto,
      date: updateBankCurrentDto.date
        ? new Date(updateBankCurrentDto.date)
        : undefined,
    });
  }

  remove(id: number) {
    return this.bankCurrentRepository.delete(id);
  }
}
