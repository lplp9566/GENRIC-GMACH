import { forwardRef, Inject, Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DonationsEntity } from './donations.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { getYearFromDate } from '../../services/services';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { UserFinancialsService } from '../users/user-financials/user-financials.service';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(DonationsEntity)
    private donationsRepository: Repository<DonationsEntity>,
    private readonly usersService: UsersService,
    private readonly userFinancialsyYearService: UserFinancialByYearService,
    private readonly userFinancialsService: UserFinancialsService,
    private readonly fundsOverviewService: FundsOverviewService,
  ) {}

  async getDonations() {
    return this.donationsRepository.find();
  }

  async createEquityDonation(donation: DonationsEntity) {
    const year = getYearFromDate(donation.donation_date);
    const user = await this.usersService.getUserById(Number(donation.user));
    if (!user) throw new BadRequestException('User not found');
    
    await this.userFinancialsyYearService.recordEquityDonation(user, year, donation.amount);
    await this.userFinancialsService.recordEquityDonation(user, donation.amount);
    await this.fundsOverviewService.addDonation(donation.amount);
    this.donationsRepository.save(donation);
    return donation;
  }

  async createFundDonation(donation: DonationsEntity) {
    const year = getYearFromDate(donation.donation_date);
    const user = await this.usersService.getUserById(Number(donation.user));
    if (!user) throw new BadRequestException('User not found');
    await this.userFinancialsyYearService.recordSpecialFundDonation(user, year, donation.amount);
    await this.userFinancialsService.recordSpecialFundDonation(user, donation.amount);
    await this.fundsOverviewService.addSpecialFund(donation.donation_reason, donation.amount);
    this.donationsRepository.save(donation);
    return donation;
  }

  async createDonation(donation: DonationsEntity) {
    if (!donation.donation_reason) {
      throw new BadRequestException('Donation reason is required');
    }
    if (donation.donation_reason === 'Equity') {
      return await this.createEquityDonation(donation);
    } else {
      return await this.createFundDonation(donation);
    }
  }
}
