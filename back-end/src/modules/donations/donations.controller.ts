import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DonationsService } from './donations.service';
import { DonationsEntity } from './Entity/donations.entity';
import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { CreateDonationDto } from '../funds/fundsDto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
export class UpdateDonationDto {
  @IsNumber()
  @IsPositive()
  amount: number;
  date: Date;
  @IsOptional()
  @IsString()
  note?: string;
}

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}
  @Post()
  async createDonation(@Body() dto: CreateDonationDto) {
    return this.donationsService.createDonation(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  async getDonations() {
    return this.donationsService.getDonations();
  }
  @UseGuards(JwtAuthGuard)
  @Get('/user/:id')
  async getDonationByUserId(@Param('id', ParseIntPipe) id: number) {
    return this.donationsService.getDonationByUserId(id);
  }
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('/window')
  indowDonations(@Body() donations: DonationsEntity) {
    return this.donationsService.withdrawSpecialFund(donations);
  }
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  async updateDonation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDonationDto,
  ) {
    return this.donationsService.updateDonation(id, {
      amount: dto.amount,
      date: dto.date,
      note: dto.note,
    });
  }
}
