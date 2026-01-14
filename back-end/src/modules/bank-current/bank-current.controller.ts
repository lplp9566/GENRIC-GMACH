import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BankCurrentService } from './bank-current.service';
import { CreateBankCurrentDto } from './dto/create-bank-current.dto';
import { UpdateBankCurrentDto } from './dto/update-bank-current.dto';

@Controller('bank-current')
export class BankCurrentController {
  constructor(private readonly bankCurrentService: BankCurrentService) {}

  @Post()
  create(@Body() createBankCurrentDto: CreateBankCurrentDto) {
    return this.bankCurrentService.create(createBankCurrentDto);
  }

  @Get()
  findAll() {
    return this.bankCurrentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankCurrentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBankCurrentDto: UpdateBankCurrentDto) {
    return this.bankCurrentService.update(+id, updateBankCurrentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bankCurrentService.remove(+id);
  }
}
