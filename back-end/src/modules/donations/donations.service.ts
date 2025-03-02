import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DonationsEntity } from './donations.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserFinancialsService } from '../users/user-financials/user-financials.service';
import { get } from 'http';
import { getYearFromDate } from 'src/services/services';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { ApiResponse } from 'src/utils/response.utils';

@Injectable()
export class DonationsService {
    constructor(
        @InjectRepository(DonationsEntity)
        private donationsRepository: Repository<DonationsEntity>,
        private readonly usersService: UsersService,
        private readonly userFinancialsService: UserFinancialsService,
        private readonly fundsOverviewService :FundsOverviewService

    ) {}
    async getDonations() {
        return this.donationsRepository.find();
    }
    async createDonation(donation: DonationsEntity) {
        try {           
            if(!donation.donation_reason){
                throw new Error("ertyuio")
            }
            this.donationsRepository.save(donation);
                if(donation.donation_reason =="Equity"){
                 const equity = this.createEquityDonation(donation);
                 return equity
                }
                else{
                    const special_funds = this.createFundDonation(donation)
                    return special_funds
                }
                
        } catch (error) {
            return error.message
        }
       
    }
    async createEquityDonation(donation: DonationsEntity) {
        try {
            const year  = getYearFromDate(donation.donation_date);
            const user =  await this.usersService.getUserById(Number(donation.user));
            if(!user){
                throw new Error("NO USER ")
            }
            this.userFinancialsService.recordEquityDonation(user,year,donation.amount);
            this.fundsOverviewService.addDonation(donation.amount)
            return ApiResponse.success(donation)
         
        } catch (error) {
            ApiResponse.error(error.message)
        }
       
    }
    async createFundDonation(donation: DonationsEntity) {
        try {
            const year  = getYearFromDate(donation.donation_date);
            const user =  await this.usersService.getUserById(Number(donation.user));
            if(!user){
                throw new Error("NO USER ")
            }
            await this.userFinancialsService.recordSpecialFundDonation(user,year,donation.amount)
            const fund = await this.fundsOverviewService.addSpecialFund(donation.donation_reason,donation.amount)
            return ApiResponse.success(donation)
        } catch (error) {
            ApiResponse.error(error.message)
        }
    }
}
