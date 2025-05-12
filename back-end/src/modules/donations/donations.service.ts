import { forwardRef, Inject, Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DonationsEntity } from './donations.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { getYearFromDate } from '../../services/services';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { UserFinancialService } from '../users/user-financials/user-financials.service';
import { FundsOverviewByYearService } from '../funds-overview-by-year/funds-overview-by-year.service';
import { DonationActionType, IWindowDonations } from './donationsTypes';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(DonationsEntity)
    private donationsRepository: Repository<DonationsEntity>,
    private readonly usersService: UsersService,
    private readonly userFinancialsyYearService: UserFinancialByYearService,
    private readonly userFinancialsService: UserFinancialService,
    private readonly fundsOverviewService: FundsOverviewService,
    private readonly fundsOvirewviewServiceByYear: FundsOverviewByYearService
  ) {}

  async getDonations() {
    return this.donationsRepository.find();
  }

  async createEquityDonation(donation: DonationsEntity) {
    const year = getYearFromDate(donation.date);
    const user = await this.usersService.getUserById(Number(donation.user));
    if (!user) throw new BadRequestException('User not found');
    
    await this.userFinancialsyYearService.recordEquityDonation(user, year, donation.amount);
    await this.userFinancialsService.recordEquityDonation(user, donation.amount);
    await this.fundsOverviewService.addDonation(donation.amount);
    await this.fundsOvirewviewServiceByYear.recordEquityDonation( year , donation.amount);
    this.donationsRepository.save(donation);
    return donation;
  }

  async createFundDonation(donation: DonationsEntity) {
    const year = getYearFromDate(donation.date);
    const user = await this.usersService.getUserById(Number(donation.user));
    if (!user) throw new BadRequestException('User not found');
    await this.userFinancialsyYearService.recordSpecialFundDonation(user, year, donation.amount);
    await this.userFinancialsService.recordSpecialFundDonation(user, donation.amount);
    await this.fundsOverviewService.addSpecialFund(donation.donation_reason, donation.amount);
    await this.fundsOvirewviewServiceByYear.recordSpecialFundDonationByName(year,donation.donation_reason, donation.amount);
    this.donationsRepository.save(donation);
    return donation;
  }

  async createDonation(donation: DonationsEntity) {
    if(!donation){
      throw new BadRequestException('Donation is required');
    }
    if(donation.action == DonationActionType.donation){
      if (donation.donation_reason === 'Equity') {
        return await this.createEquityDonation(donation);
      } else {
        return await this.createFundDonation(donation);
      }
    }
    else if (donation.action == DonationActionType.withdraw){
      return await this.withdrawSpecialFund(donation);
    }
  
  }
  async withdrawSpecialFund(donation: DonationsEntity) {
    try {
    const year = getYearFromDate(donation.date);
    const user = await this.usersService.getUserById(Number(donation.user));
    if (!user) throw new BadRequestException('User not found');
    await this.fundsOverviewService.reduceFundAmount(donation.donation_reason, donation.amount);
    await this.fundsOvirewviewServiceByYear.recordSpecialFundWithdrawalByName(year, donation.donation_reason, donation.amount);
return donation;
} catch (error) {
      throw new BadRequestException(error.message);
}

}


 }
