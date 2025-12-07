import {
  forwardRef,
  Inject,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { getYearFromDate } from '../../services/services';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { UserFinancialService } from '../users/user-financials/user-financials.service';
import { FundsOverviewByYearService } from '../funds-overview-by-year/funds-overview-by-year.service';
import { DonationActionType, IWindowDonations } from './donations_dto';
import { DonationsEntity } from './Entity/donations.entity';
import { log } from 'console';
import { UpdateDonationDto } from './donations.controller';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(DonationsEntity)
    private donationsRepository: Repository<DonationsEntity>,
    private readonly usersService: UsersService,
    private readonly userFinancialsyYearService: UserFinancialByYearService,
    private readonly userFinancialsService: UserFinancialService,
    private readonly fundsOverviewService: FundsOverviewService,
    private readonly fundsOvirewviewServiceByYear: FundsOverviewByYearService,
  ) {}

  async getDonations() {
    return await this.donationsRepository.find({ relations: ['user'] });
  }

  async createEquityDonation(donation: DonationsEntity) {
    const year = getYearFromDate(donation.date);
    const user = await this.usersService.getUserById(Number(donation.user));
    if (!user) throw new BadRequestException('User not found');

    await this.userFinancialsyYearService.adjustEquityDonation(
      user,
      year,
      donation.amount,
    );
    await this.userFinancialsService.adjustEquityDonation(
      user,
      donation.amount,
    );
    await this.fundsOverviewService.adjustDonation(donation.amount);
    await this.fundsOvirewviewServiceByYear.adjustEquityDonation(
      year,
      donation.amount,
    );
    const saved = await this.donationsRepository.save(donation);
  const withUser = await this.donationsRepository.findOne({
    where: { id: saved.id },
    relations: { user: true },
  });

    return withUser;
  }

  async createFundDonation(donation: DonationsEntity) {
    const year = getYearFromDate(donation.date);
    const user = await this.usersService.getUserById(Number(donation.user));
    if (!user) throw new BadRequestException('User not found');
    await this.userFinancialsyYearService.adjustSpecialFundDonation(
      user,
      year,
      donation.amount,
    );
    await this.userFinancialsService.adjustSpecialFundDonation(
      user,
      donation.amount,
    );
    await this.fundsOverviewService.addSpecialFund(
      donation.donation_reason,
      donation.amount,
    );
    await this.fundsOvirewviewServiceByYear.adjustSpecialFundDonationByName(
      year,
      donation.donation_reason,
      donation.amount,
    );
    await this.userFinancialsService.adjustSpecialFundDonation(
      user,
      donation.amount,
    );

    const saved = await this.donationsRepository.save(donation);
  const withUser = await this.donationsRepository.findOne({
    where: { id: saved.id },
    relations: { user: true },
  });

    return withUser;
  }

  async createDonation(donation: DonationsEntity) {  
    if (!donation) {
      throw new BadRequestException('Donation is required');
    }
    // if (!donation.user) {
    //   throw new BadRequestException('User is required');
    // }
    // if (donation.action) {
    //   throw new BadRequestException('Amount must be greater than zero');
    // }
    if (donation.action == DonationActionType.donation) {
      if (donation.donation_reason === 'Equity') {
        return await this.createEquityDonation(donation);
      } else {
        return await this.createFundDonation(donation);
      }
    } else if (donation.action == DonationActionType.withdraw) {
      return await this.withdrawSpecialFund(donation);
    }
  }
  async withdrawSpecialFund(donation: DonationsEntity) {
    try {
      const year = getYearFromDate(donation.date);
      // const user = await this.usersService.getUserById(Number(donation.user));
      // if (!user) throw new BadRequestException('User not found');
      await this.fundsOverviewService.reduceFundAmount(
        donation.donation_reason,
        donation.amount,
      );
      await this.fundsOvirewviewServiceByYear.recordSpecialFundWithdrawalByName(
        year,
        donation.donation_reason,
        donation.amount,
      );
      const donationRecord = await this.donationsRepository.save(donation);
      const withUser = await this.donationsRepository.findOne({
        where: { id: donationRecord.id },
        relations: { user: true },
      });
      return withUser;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
async updateDonation(id: number, dto: UpdateDonationDto) {
  const { amount: newAmount, date: newDateString } = dto;
  const newDate = new Date(newDateString);

  if (newAmount <= 0) {
    throw new BadRequestException('Amount must be greater than zero');
  }

  return await this.donationsRepository.manager.transaction(
    async (manager) => {
      // 1. מביאים את התרומה הקיימת
      const existing = await manager.findOne(DonationsEntity, {
        where: { id },
        relations: { user: true },
      });

      if (!existing) {
        throw new BadRequestException('Donation not found');
      }

      const oldAmount = existing.amount;
      const oldDate = existing.date;
      const oldYear = getYearFromDate(oldDate);
      const newYear = getYearFromDate(newDate);
      const deltaAmount = newAmount - oldAmount;
      const user = existing.user;

      // 2. מעדכנים את רשומת התרומה עצמה
      existing.amount = newAmount;
      existing.date = newDate;
      await manager.save(existing);

      // 🧩 3. טבלאות גלובליות (לא לפי שנה) – רק deltaAmount
      if (existing.action === DonationActionType.donation) {
        if (existing.donation_reason === 'Equity') {
          // Equity גלובלי
          await this.userFinancialsService.adjustEquityDonation(
            user,
            deltaAmount,
          );
          await this.fundsOverviewService.adjustDonation(deltaAmount);
        } else {
          // Special Fund גלובלי
          await this.userFinancialsService.adjustSpecialFundDonation(
            user,
            deltaAmount,
          );
          await this.fundsOverviewService.adjustSpecialFund(
            existing.donation_reason,
            deltaAmount,
          );
        }
      }

      // 🧩 4. טבלאות לפי שנה – כאן נכנס עניין ה"שינוי שנה"
      if (existing.action === DonationActionType.donation) {
        if (existing.donation_reason === 'Equity') {
          if (oldYear === newYear) {
            // אותה שנה → רק deltaAmount
            await this.userFinancialsyYearService.adjustEquityDonation(
              user,
              oldYear,
              deltaAmount,
            );
            await this.fundsOvirewviewServiceByYear.adjustEquityDonation(
              oldYear,
              deltaAmount,
            );
          } else {
            // שנה השתנתה → -oldAmount מהשנה הישנה +newAmount בשנה החדשה
            await this.userFinancialsyYearService.adjustEquityDonation(
              user,
              oldYear,
              -oldAmount,
            );
            await this.userFinancialsyYearService.adjustEquityDonation(
              user,
              newYear,
              newAmount,
            );

            await this.fundsOvirewviewServiceByYear.adjustEquityDonation(
              oldYear,
              -oldAmount,
            );
            await this.fundsOvirewviewServiceByYear.adjustEquityDonation(
              newYear,
              newAmount,
            );
          }
        } else {
          // Special Fund לפי שנה
          const fundName = existing.donation_reason;

          if (oldYear === newYear) {
            await this.userFinancialsyYearService.adjustSpecialFundDonation(
              user,
              oldYear,
              deltaAmount,
            );
            await this.fundsOvirewviewServiceByYear.adjustSpecialFundDonationByName(
              oldYear,
              fundName,
              deltaAmount,
            );
          } else {
            await this.userFinancialsyYearService.adjustSpecialFundDonation(
              user,
              oldYear,
              -oldAmount,
            );
            await this.userFinancialsyYearService.adjustSpecialFundDonation(
              user,
              newYear,
              newAmount,
            );

            await this.fundsOvirewviewServiceByYear.adjustSpecialFundDonationByName(
              oldYear,
              fundName,
              -oldAmount,
            );
            await this.fundsOvirewviewServiceByYear.adjustSpecialFundDonationByName(
              newYear,
              fundName,
              newAmount,
            );
          }
        }
      }

      // 5. מחזירים את התרומה המעודכנת עם המשתמש
      return await manager.findOne(DonationsEntity, {
        where: { id: existing.id },
        relations: { user: true },
      });
    },
  );
}

}
