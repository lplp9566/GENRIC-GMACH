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
import { UpdateDonationDto } from './donations.controller';
import { CreateDonationDto } from '../funds/fundsDto';
import { FundsService } from '../funds/funds.service';
import { FundYearStatsEntity } from '../funds/Entity/fund-year-stats.entity';
import { FundEntity } from '../funds/Entity/funds.entity';
import { addWeeks } from 'date-fns';
import { abort } from 'process';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(DonationsEntity)
    private donationsRepository: Repository<DonationsEntity>,
    @InjectRepository(FundYearStatsEntity)
    private fundYearRepo: Repository<FundYearStatsEntity>,

    private readonly usersService: UsersService,
    private readonly userFinancialsyYearService: UserFinancialByYearService,
    private readonly userFinancialsService: UserFinancialService,
    // private readonly fundsOverviewService: FundsOverviewService,
    private readonly fundsOvirewviewServiceByYear: FundsOverviewByYearService,
    private readonly fundsService: FundsService,
  ) {}

  async getDonations() {
    return await this.donationsRepository.find({ relations: ['user'] });
  }

  async createEquityDonation(donation: DonationsEntity) {
    const year = getYearFromDate(donation.date);
    const user = donation.user;
    if (!user) throw new BadRequestException('User not found');

    // await this.userFinancialsyYearService.adjustEquityDonation(
    //   user,
    //   year,
    //   donation.amount,
    // );
    // await this.userFinancialsService.adjustEquityDonation(
    //   user,
    //   donation.amount,
    // );
    // await this.fundsOverviewService.adjustDonation(donation.amount);
    // await this.fundsOvirewviewServiceByYear.adjustEquityDonation(
    //   year,
    //   donation.amount,
    // );
    const saved = await this.donationsRepository.save(donation);
    const withUser = await this.donationsRepository.findOne({
      where: { id: saved.id },
      relations: { user: true },
    });

    return withUser;
  }

  async createFundDonation(donation: DonationsEntity) {
    const fundName = String(donation.donation_reason ?? '').trim();
    const fund = await this.fundsService.findOrCreateByName(
      fundName,
      donation.user ?? undefined,
    );

    donation.fund = fund;
    donation.fundId = fund.id;

    const year = getYearFromDate(donation.date);

    return this.donationsRepository.manager.transaction(async (manager) => {
      await this.applyFundMovement(
        manager,
        fund,
        year,
        donation.amount,
        'deposit',
      );

      // שמירת donation
      const saved = await manager.save(DonationsEntity, donation);
      // await this.fundsOverviewService.adjustSpecialFund(donation.amount);
      // await this.fundsOvirewviewServiceByYear.adjustSpecialFundDonationByName(year, donation.amount);
      // await this.userFinancialsService.adjustSpecialFundDonation( donation.user, donation.amount);
      // await this.userFinancialsyYearService.adjustSpecialFundDonation(donation.user, year, donation.amount);
      return manager.findOne(DonationsEntity, {
        where: { id: saved.id },
        relations: { user: true },
      });
    });
  }

  async createDonation(dto: CreateDonationDto) {
    const donation = new DonationsEntity();
    donation.amount = dto.amount;
    donation.date = new Date(dto.date);
    donation.action = dto.action;
    donation.donation_reason = dto.donation_reason;

    // אם נשלח userId – נטען משתמש
    if (dto.user != null) {
      donation.user = await this.usersService.getUserById(Number(dto.user));
      // אם תרצה פה בדיקה NotFound
    }

    if (donation.action === DonationActionType.donation) {
      if (String(donation.donation_reason).trim().toLowerCase() === 'equity') {
        return this.createEquityDonation(donation);
      } else {
        return this.createFundDonation(donation);
      }
    }

    if (donation.action === DonationActionType.withdraw) {
      return this.withdrawSpecialFund(donation);
    }

    throw new BadRequestException('Invalid action');
  }

  async withdrawSpecialFund(donation: DonationsEntity) {
    const fundName = String(donation.donation_reason ?? '').trim();
    const fund = await this.fundsService.findOrCreateByName(
      fundName,
      donation.user ?? undefined,
    );

    donation.fund = fund;
    donation.fundId = fund.id;

    const year = getYearFromDate(donation.date);

    return this.donationsRepository.manager.transaction(async (manager) => {
      await this.applyFundMovement(
        manager,
        fund,
        year,
        donation.amount,
        'withdraw',
      );

      const saved = await manager.save(DonationsEntity, donation);
      // await this.fundsOverviewService.reduceFundAmount( donation.amount);
      // await this.fundsOvirewviewServiceByYear.recordSpecialFundWithdrawalByName(year, donation.amount);
      return manager.findOne(DonationsEntity, {
        where: { id: saved.id },
        relations: { user: true },
      });
    });
  }

  private async applyFundMovement(
    manager: any,
    fund: FundEntity,
    year: number,
    amount: number,
    kind: 'deposit' | 'withdraw',
  ) {
    // 1) עדכון יתרה בקרן (atomic)
    const delta = kind === 'withdraw' ? -amount : amount;
    await manager.increment(FundEntity, { id: fund.id }, 'balance', delta);

    // 2) עדכון טבלת שנה-קרן
    let row = await manager.findOne(FundYearStatsEntity, {
      where: { fundId: fund.id, year },
    });
    if (!row) {
      row = manager.create(FundYearStatsEntity, {
        fundId: fund.id,
        year,
        donatedTotal: '0',
        withdrawnTotal: '0',
      });
    }

    if (kind === 'deposit') {
      // donatedTotal += amount
      row.donatedTotal = String(Number(row.donatedTotal) + amount);
    } else {
      // withdrawnTotal += amount
      row.withdrawnTotal = String(Number(row.withdrawnTotal) + amount);
    }

    await manager.save(row);
  }

async updateDonation(id: number, dto: UpdateDonationDto) {
  const newAmount = Number(dto.amount);
  const newDate = new Date(dto.date);

  if (!Number.isFinite(newAmount) || newAmount <= 0) {
    throw new BadRequestException('Amount must be greater than zero');
  }
  if (isNaN(newDate.getTime())) {
    throw new BadRequestException('Invalid date');
  }

  return this.donationsRepository.manager.transaction(async (manager) => {
    // חשוב: טוענים גם fund כדי שנדע לעדכן balances
    const existing = await manager.findOne(DonationsEntity, {
      where: { id },
      relations: { user: true, fund: true },
    });

    if (!existing) throw new BadRequestException('Donation not found');

    const oldAmount = Number(existing.amount);
    const oldDate = new Date(existing.date);
    const oldYear = getYearFromDate(oldDate);
    const newYear = getYearFromDate(newDate);

    const deltaAmount = newAmount - oldAmount;

    // אם לא השתנה כלום – מחזירים
    if (deltaAmount === 0 && oldYear === newYear) {
      return manager.findOne(DonationsEntity, {
        where: { id: existing.id },
        relations: { user: true, fund: true },
      });
    }

    // 1) מעדכנים את רשומת התרומה עצמה
    existing.amount = newAmount;
    existing.date = newDate;
    await manager.save(existing);

    const user = existing.user ?? null;
    const isEquity = String(existing.donation_reason ?? '')
      .trim()
      .toLowerCase() === 'equity';

    const isFund = !isEquity; // אצלך: כל מה שלא Equity נחשב “קרן מיוחדת”
    const fundName = isFund ? String(existing.donation_reason ?? '').trim() : null;

    // Helpers: upsert + עדכון טבלת fund_year_stats (עם סכום יכול להיות גם שלילי)
    const bumpFundYear = async (
      fundId: number,
      year: number,
      kind: 'deposit' | 'withdraw',
      delta: number,
    ) => {
      let row = await manager.findOne(FundYearStatsEntity, {
        where: { fundId, year },
      });

      if (!row) {
        row = manager.create(FundYearStatsEntity, {
          fundId,
          year,
          donatedTotal: '0',
          withdrawnTotal: '0',
        });
      }

      if (kind === 'deposit') {
        row.donatedTotal = String(Number(row.donatedTotal) + delta);
      } else {
        row.withdrawnTotal = String(Number(row.withdrawnTotal) + delta);
      }

      await manager.save(row);
    };

    // 2) עדכוני Funds (balance + yearly) — רק אם זו קרן מיוחדת ויש fundId
    // (אם עדיין אין fundId לנתונים ישנים, אפשר ליצור פה fund ולשייך—אבל לא נכנסתי לזה כרגע)
    if (isFund && existing.fundId) {
      const fundId = existing.fundId;

      // action donation => "deposit" לקרן
      // action withdraw => "withdraw" מקרן
      const kind: 'deposit' | 'withdraw' =
        existing.action === DonationActionType.withdraw ? 'withdraw' : 'deposit';

      // שינוי שנה: צריך להזיז -oldAmount מהשנה הישנה ו +newAmount לשנה החדשה
      if (oldYear !== newYear) {
        // balance: קודם מבטלים את הישן ואז מוסיפים את החדש
        // deposit: balance += (-oldAmount) ואז balance += (+newAmount)
        // withdraw: balance -= (-oldAmount)? בפועל withdraw מוריד, לכן ביטול withdraw מחזיר כסף:
        // אם kind=withdraw אז balance += oldAmount כדי לבטל, ואז balance -= newAmount כדי להחיל
        if (kind === 'deposit') {
          await manager.increment(FundEntity, { id: fundId }, 'balance', -oldAmount);
          await manager.increment(FundEntity, { id: fundId }, 'balance', +newAmount);

          await bumpFundYear(fundId, oldYear, 'deposit', -oldAmount);
          await bumpFundYear(fundId, newYear, 'deposit', +newAmount);
        } else {
          await manager.increment(FundEntity, { id: fundId }, 'balance', +oldAmount);
          await manager.increment(FundEntity, { id: fundId }, 'balance', -newAmount);

          await bumpFundYear(fundId, oldYear, 'withdraw', -oldAmount);
          await bumpFundYear(fundId, newYear, 'withdraw', +newAmount);
        }
      } else {
        // אותה שנה: מספיק delta אחד
        if (kind === 'deposit') {
          await manager.increment(FundEntity, { id: fundId }, 'balance', deltaAmount);
          await bumpFundYear(fundId, oldYear, 'deposit', deltaAmount);
        } else {
          // withdraw: הגדלת סכום withdraw מורידה עוד כסף => balance -= delta
          await manager.increment(FundEntity, { id: fundId }, 'balance', -deltaAmount);
          await bumpFundYear(fundId, oldYear, 'withdraw', deltaAmount);
        }
      }
    }

    // 3) עדכונים דרך הסרוויסים הקיימים (כמו שביקשת – נשארים)
    // Equity donation
    if (existing.action === DonationActionType.donation && isEquity) {
      if (!user) throw new BadRequestException('User not found');

      // גלובלי
      // await this.userFinancialsService.adjustEquityDonation(user, deltaAmount);
      // await this.fundsOverviewService.adjustDonation(deltaAmount);

      // לפי שנה
      if (oldYear === newYear) {
        // await this.userFinancialsyYearService.adjustEquityDonation(user, oldYear, deltaAmount);
        // await this.fundsOvirewviewServiceByYear.adjustEquityDonation(oldYear, deltaAmount);
      } else {
        // await this.userFinancialsyYearService.adjustEquityDonation(user, oldYear, -oldAmount);
        // await this.userFinancialsyYearService.adjustEquityDonation(user, newYear, +newAmount);

        // await this.fundsOvirewviewServiceByYear.adjustEquityDonation(oldYear, -oldAmount);
        // await this.fundsOvirewviewServiceByYear.adjustEquityDonation(newYear, +newAmount);
      }
    }

    // Fund deposit (תרומה לקרן מיוחדת)
    if (existing.action === DonationActionType.donation && isFund) {
      if (!user) throw new BadRequestException('User not found');
      if (!fundName) throw new BadRequestException('Fund name is required');

      // גלובלי
      // await this.userFinancialsService.adjustSpecialFundDonation(user, deltaAmount);
      // await this.fundsOverviewService.adjustSpecialFund(deltaAmount);

      // לפי שנה
      if (oldYear === newYear) {
        // await this.userFinancialsyYearService.adjustSpecialFundDonation(user, oldYear, deltaAmount);
        // await this.fundsOvirewviewServiceByYear.adjustSpecialFundDonationByName(oldYear, deltaAmount);
      } else {
        // await this.userFinancialsyYearService.adjustSpecialFundDonation(user, oldYear, -oldAmount);
        // await this.userFinancialsyYearService.adjustSpecialFundDonation(user, newYear, +newAmount);

        // await this.fundsOvirewviewServiceByYear.adjustSpecialFundDonationByName(oldYear, -oldAmount);
        // await this.fundsOvirewviewServiceByYear.adjustSpecialFundDonationByName(newYear, +newAmount);
      }
    }

    // Fund withdraw (משיכה מקרן מיוחדת)
    if (existing.action === DonationActionType.withdraw && isFund) {
      if (!fundName) throw new BadRequestException('Fund name is required');

      // גלובלי: משתמשים ב-reduceFundAmount עם delta
      // אם deltaAmount חיובי => מושכים עוד
      // אם deltaAmount שלילי => מחזירים חלק (כלומר "משיכה פחותה")
      // await this.fundsOverviewService.reduceFundAmount( deltaAmount);

      // לפי שנה
      if (oldYear === newYear) {
        // await this.fundsOvirewviewServiceByYear.recordSpecialFundWithdrawalByName(oldYear, deltaAmount);
      } else {
        // await this.fundsOvirewviewServiceByYear.recordSpecialFundWithdrawalByName(oldYear, -oldAmount);
        // await this.fundsOvirewviewServiceByYear.recordSpecialFundWithdrawalByName(newYear, +newAmount);
      }
    }

    // 4) מחזירים מעודכן
    return manager.findOne(DonationsEntity, {
      where: { id: existing.id },
      relations: { user: true, fund: true },
    });
  });
}

}
