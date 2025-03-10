import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DonationsEntity } from './donations.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { get } from 'http';
import { getYearFromDate } from 'src/services/services';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { ApiResponse } from 'src/utils/response.utils';
import { UserFinancialsService } from '../users/user-financials/user-financials.service';

@Injectable()
export class DonationsService {
    constructor(
        @InjectRepository(DonationsEntity)
        private donationsRepository: Repository<DonationsEntity>,
        // @Inject(forwardRef(() => UsersService))

        private readonly usersService: UsersService,
        private readonly userFinancialsyYearService: UserFinancialByYearService,
        private readonly userFinancialsService: UserFinancialsService,
        private readonly fundsOverviewService :FundsOverviewService

    ) {}
    async getDonations() {
        return this.donationsRepository.find();
    }
 
    async createEquityDonation(donation: DonationsEntity) {
        try {    
            const year  = await getYearFromDate(donation.donation_date);
            const user =  await this.usersService.getUserById(Number(donation.user));
            if (!user) {
                throw new Error("NO USER");
            }
           await this.userFinancialsyYearService.recordEquityDonation(user, year, donation.amount);
           await this.userFinancialsService.recordEquityDonation(user, donation.amount);
           await this.fundsOverviewService.addDonation(donation.amount); 
            return donation;
    
        } catch (error) {
            console.error("Error in createEquityDonation:", error.message);
            return ApiResponse.error(error.message);
        }
    }
    
    async createFundDonation(donation: DonationsEntity) {
        try {
            const year  = getYearFromDate(donation.donation_date);
            const user =  await this.usersService.getUserById(Number(donation.user));
            if(!user){
                throw new Error("NO USER ")
            }
            await this.userFinancialsyYearService.recordSpecialFundDonation(user,year,donation.amount)
            await  this.userFinancialsService.recordSpecialFundDonation(user,donation.amount)
            const fund = await this.fundsOverviewService.addSpecialFund(donation.donation_reason,donation.amount)
            return ApiResponse.success(donation)
        } catch (error) {
            ApiResponse.error(error.message)
        }
    }
    async createDonation(donation: DonationsEntity) {
        try {           
            if (!donation.donation_reason) {
                throw new Error("Donation reason is required");
            }
           this.donationsRepository.save(donation);
            if (donation.donation_reason == "Equity") {
                const equity = await this.createEquityDonation(donation);
                return equity       
            } else {
                const special_funds = await this.createFundDonation(donation);
                return special_funds;
            }
        } catch (error) {
            console.error("Error in createDonation:", error.message);
            return error.message;
        }
    }
}
