import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FundsOverviewEntity } from './funds-overview.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FundsOverviewService {
    constructor(
        @InjectRepository(FundsOverviewEntity)
        private readonly fundsOverviewRepository: Repository<FundsOverviewEntity>,
    ){}
    async initializeFundsOverview(initialAmount: number){
        const existingRecord = await this.fundsOverviewRepository.findOne({ where: {} });
        if (existingRecord) {
            throw new Error('Funds overview already initialized');
        }
        const newRecord = this.fundsOverviewRepository.create({
            total_funds: initialAmount,
            available_funds: initialAmount,
            monthly_deposits:0,
            donations_received:0,
            loaned_amount:0,
            investments:0,
            special_funds:0,
            fund_details: {},
        })
        await this.fundsOverviewRepository.save(newRecord); }
    async getFundsOverview(){
        return this.fundsOverviewRepository.findOne({ where: {} }); }
        

        async addMonthlyDeposit(amount: number){
            const fundsOverview = await this.fundsOverviewRepository.findOne({ where: {} });
            if (!fundsOverview) {
                throw new Error('Funds overview not initialized');
            }
            console.log(typeof amount);
            console.log(typeof fundsOverview.total_funds);
            fundsOverview.total_funds += amount;
            fundsOverview.available_funds += amount;
            fundsOverview.monthly_deposits += amount;
            await this.fundsOverviewRepository.save(fundsOverview);
            return fundsOverview;
        }   
        async addDonation(amount: number){
            const fundsOverview = await this.fundsOverviewRepository.findOne({ where: {} });
            if (!fundsOverview) {
                throw new Error('Funds overview not initialized');
            }
            fundsOverview.total_funds += amount;
            fundsOverview.available_funds += amount;
            fundsOverview.donations_received += amount;
            await this.fundsOverviewRepository.save(fundsOverview);
            return fundsOverview;
        }
        async addInvestment(amount: number){
            const fundsOverview = await this.fundsOverviewRepository.findOne({ where: {} });
            if (!fundsOverview) {
                throw new Error('Funds overview not initialized');
            }
            fundsOverview.total_funds -= amount;
            fundsOverview.available_funds -= amount;
            fundsOverview.investments += amount;
            await this.fundsOverviewRepository.save(fundsOverview);
            return fundsOverview;

        }
        async addLoan(amount: number){
            const fundsOverview = await this.fundsOverviewRepository.findOne({ where: {} });
            if (!fundsOverview) {
                throw new Error('Funds overview not initialized');
            }
            fundsOverview.available_funds -= amount;
            fundsOverview.loaned_amount += amount;
            await this.fundsOverviewRepository.save(fundsOverview);
            return fundsOverview;

        }
        async addSpecialFund(fundName: string, amount: number) {
            const fund = await this.fundsOverviewRepository.findOne({ where: {} });
            if (!fund) throw new Error('General Fund not found');
        
            if (!fund.fund_details) {
              fund.fund_details = {};
            }
            fund.fund_details[fundName] = (fund.fund_details[fundName] || 0) + amount;
            fund.special_funds += amount;
            await this.fundsOverviewRepository.save(fund);
            return fund

           
          }
          async repayLoan(amount: number){
            const fund = await this.fundsOverviewRepository.findOne({ where: {} });
            if (!fund) throw new Error('General Fund not found');

            fund.loaned_amount -= amount;
            fund.available_funds += amount;
            await this.fundsOverviewRepository.save(fund);
            return fund
            }

          async updateFund(fundName: string, amount: number){
            const fund = await this.fundsOverviewRepository.findOne({ where: {} });
            if (!fund) throw new Error('General Fund not found');
        
            if (!fund.fund_details) {
              fund.fund_details = {};
            }
            if (!fund.fund_details[fundName]) {
              throw new Error('Fund not found');
            }
            fund.fund_details[fundName] -= amount;
            fund.special_funds -= amount;
            await this.fundsOverviewRepository.save(fund);
            return fund;
          }

}
