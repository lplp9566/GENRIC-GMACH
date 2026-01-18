import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';
import { PaymentDetailsEntity } from './payment-details/payment_details.entity';
import { MonthlyDepositsService } from '../monthly_deposits/monthly_deposits.service';
import { UserRoleHistoryEntity } from '../user_role_history/Entity/user_role_history.entity';
import { UserRoleHistoryService } from '../user_role_history/user_role_history.service';
import { MembershipRoleEntity } from '../membership_roles/Entity/membership_rols.entity';
import { RoleMonthlyRateEntity } from '../role_monthly_rates/Entity/role_monthly_rates.entity';
import { ConfigService } from '@nestjs/config';
import { MembershipType, payment_method } from './userTypes';
import { log } from 'console';
import { UserFinancialService } from './user-financials/user-financials.service';
import { UserFinancialByYearService } from './user-financials-by-year/user-financial-by-year.service';
import { MailService } from '../mail/mail.service';
import { YearSummaryPdfStyleData } from '../mail/dto';
import { OrderReturnEntity } from '../order-return/Entity/order-return.entity';
import { HDate } from 'hebcal';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(MembershipRoleEntity)
    private membershipRolesRepo: Repository<MembershipRoleEntity>,
    @InjectRepository(PaymentDetailsEntity)
    private paymentDetailsRepository: Repository<PaymentDetailsEntity>,
    @InjectRepository(UserRoleHistoryEntity)
    private readonly roleHistoryRepo: Repository<UserRoleHistoryEntity>,
    @InjectRepository(RoleMonthlyRateEntity)
    private readonly ratesRepo: Repository<RoleMonthlyRateEntity>,
    @InjectRepository(OrderReturnEntity)
    private readonly orderReturnRepo: Repository<OrderReturnEntity>,
    @Inject(forwardRef(() => MonthlyDepositsService))
    private readonly monthlyDepositsService: MonthlyDepositsService,
    @Inject(forwardRef(() => UserRoleHistoryService))
    private readonly userRoleHistoryService: UserRoleHistoryService,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
    private readonly userFinancialService: UserFinancialService,
    private readonly userFinancialByYear: UserFinancialByYearService,
    private readonly mailService: MailService,
  ) {}

  async getAllMemberUserPaymentDetails(
    userId: number,
  ): Promise<PaymentDetailsEntity | null> {
    return this.paymentDetailsRepository.findOne({
      where: {
        user: {
          id: userId,
          is_admin: false,
          membership_type: MembershipType.MEMBER,
        },
      },
    });
  }
  async getAllMembersAndFriends(): Promise<UserEntity[]> {
    return this.usersRepository.find({
      where: { is_admin: false },
    });
  }
  async findUsers(filters: {
    membershipType?: MembershipType;
    isAdmin?: boolean;
  }) {
    const qb = this.usersRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.payment_details', 'pd')
      .leftJoinAndSelect('u.current_role', 'cr');

    if (filters.isAdmin !== undefined)
      qb.andWhere('u.is_admin = :isAdmin', { isAdmin: filters.isAdmin });
    if (filters.membershipType)
      qb.andWhere('u.membership_type = :mt', { mt: filters.membershipType });

    const MEMBER = MembershipType.MEMBER; // תעדכן לערך האמיתי אצלך

    // 1) חברים לפני ידידים
    qb.addOrderBy(
      `CASE WHEN u.membership_type = :member THEN 0 ELSE 1 END`,
      'ASC',
    ).setParameter('member', MEMBER);

    // 2) קודם "מינוס חודשי" - אבל רק לחבר
    qb.addOrderBy(
      `CASE WHEN u.membership_type = :member AND COALESCE(pd.monthly_balance, 0) < 0 THEN 0 ELSE 1 END`,
      'ASC',
    );

    // בתוך קבוצת המינוס החודשי: הכי שלילי קודם (-1900 לפני -400 לפני -40)
    qb.addOrderBy(
      `CASE WHEN u.membership_type = :member AND COALESCE(pd.monthly_balance, 0) < 0 THEN COALESCE(pd.monthly_balance, 0) ELSE 0 END`,
      'ASC',
    );

    // 3) אחר כך "הלוואה במינוס" - אבל רק לחבר
    qb.addOrderBy(
      `
    CASE WHEN u.membership_type = :member AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(COALESCE(pd.loan_balances::jsonb, '[]'::jsonb)) elem
      WHERE (elem->>'balance')::numeric < 0
    )
    THEN 0 ELSE 1 END
    `,
      'ASC',
    );

    // 4) תאריך חיוב הקרוב (charge_date = יום בחודש)
    qb.addOrderBy(
      `
    CASE
      WHEN pd.charge_date IS NULL THEN (CURRENT_DATE + INTERVAL '100 years')
      ELSE
        CASE
          WHEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM CURRENT_DATE)::int, pd.charge_date) >= CURRENT_DATE
            THEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM CURRENT_DATE)::int, pd.charge_date)
          ELSE
            (make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM CURRENT_DATE)::int, pd.charge_date) + INTERVAL '1 month')
        END
    END
    `,
      'ASC',
    );

    return qb.getMany();
  }

  async onApplicationBootstrap() {
    if (this.config.get('SEED_ADMIN') !== 'true') return;

    const count = await this.usersRepository.count();
    if (count > 0) return;

    // const email = this.config.get<string>('ADMIN_EMAIL');
    // const password = this.config.get<string>('ADMIN_PASSWORD');
    // if (!email || !password) return;

    // תפקיד ברירת מחדל אם נדרש ע"י הסכמה
    const defaultRole = await this.membershipRolesRepo.findOne({
      where: { name: 'Member' },
    });
    await this.createUserAndPaymentInfo(
      {
        first_name: 'מנהל',
        last_name: 'מערכת',
        email_address: 'chesedgmach@gmail.com',
        password: '1234',
        is_admin: true,
        id_number: '123456789',
        phone_number: '0501234567',
        current_role: null as any,
        join_date: new Date(),
        membership_type: MembershipType.FRIEND,
      },
      {
        payment_method: payment_method.bank_transfer,
        charge_date: 1,
        bank_number: 1,
        bank_branch: 1,
        bank_account_number: 1,
      },
    );
  }
  async createUserAndPaymentInfo(
    userData: Partial<UserEntity>,
    paymentData: Partial<PaymentDetailsEntity>,
  ): Promise<UserEntity> {
    try {
      if (
        paymentData.payment_method === undefined ||
        !Object.values(paymentData).includes(paymentData.payment_method)
      ) {
        throw new Error('Invalid payment method');
      }

      const salt = await bcrypt.genSalt(10);
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, salt);
      } else {
        throw new Error('Password is required');
      }

      const newUser = this.usersRepository.create(userData);
      const paymentDetails = this.paymentDetailsRepository.create(paymentData);
      const savedUser = await this.usersRepository.save(newUser);
      const userWithCurrentRole = await this.usersRepository.findOne({
        where: { id: savedUser.id },
        relations: ['current_role'],
      });
      newUser.payment_details = paymentDetails;
      if (userData.current_role) {
        await this.userRoleHistoryService.createUserRoleHistory({
          from_date: newUser.join_date!,
          userId: savedUser.id,
          roleId: userWithCurrentRole?.current_role.id!,
        });
      }
      const savedPaymentDetails = await this.usersRepository.save(newUser);
      await this.updateUserMonthlyBalance(newUser);
      return savedPaymentDetails;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { email_address: email },
      relations: ['payment_details'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  async getUserById(id: number) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id, is_admin: false },
        relations: ['payment_details'],
      });
      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getUserByIdNumber(id_number: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { id: Number(id_number), is_admin: false },
    });
  }

  async getAllUsers(): Promise<UserEntity[]> {
    return this.usersRepository.find({
      where: { is_admin: false },
      relations: ['payment_details', 'current_role'],
    });
  }

  async calculateTotalDue(userId: number): Promise<number> {
    // 1. שליפת המשתמש ובדיקות
    const user = await this.usersRepository.findOne({
      where: { id: userId, is_admin: false },
      relations: ['payment_details'],
    });
    if (!user) throw new BadRequestException('User not found');
    if (!user.payment_details?.charge_date) {
      throw new BadRequestException('Missing payment details');
    }

    // 2. היסטוריית הדרגות, ממוינת לפי תאריך עולה
    const history = await this.roleHistoryRepo.find({
      where: { user: { id: userId } },
      relations: ['role'],
      order: { from_date: 'ASC' },
    });
    if (history.length === 0) {
      throw new BadRequestException('No role history for user');
    }

    // 3. תעריפים לכל הדרגות
    const allRates = await this.ratesRepo.find({ relations: ['role'] });
    if (allRates.length === 0) {
      throw new BadRequestException('No monthly rates defined');
    }

    // --- Helpers: עבודה לפי חודש ב-UTC כדי למנוע "גלישה" לחודש קודם/הבא בגלל timezone
    const toMonthStartUTC = (d: Date) =>
      new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));

    // 4. נקודת ההתחלה – ראש החודש של החודש הראשון בהיסטוריה (UTC)
    const firstFrom = new Date(history[0].from_date as any);
    let iter = toMonthStartUTC(firstFrom);
    console.log(user.join_date);

    // אם אתה רוצה *לא* לחייב על חודש ההצטרפות כשהוא באמצע חודש – תפתח את זה:
    // if (firstFrom.getUTCDate() > 1) iter.setUTCMonth(iter.getUTCMonth() + 1);

    // 5. נקודת הסיום – תחילת החודש הבא (UTC) אבל כ-EXCLUSIVE (לא נכלל בלולאה)
    const today = new Date();
    const chargeDay = user.payment_details.charge_date;
    const todayDay = today.getUTCDate();
    const startOfThisMonth = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1),
    );
    const startOfNextMonth = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1),
    );

    const endExclusive =
      todayDay < chargeDay ? startOfThisMonth : startOfNextMonth;

    let totalDue = 0;

    // 6. לולאה חודש-חודש: iter < endExclusive (ככה לא מחשב "עוד חודש")
    while (iter.getTime() < endExclusive.getTime()) {
      // א. הדרגה הפעילה בחודש הזה (לפי from_date)
      const active = history
        .filter(
          (h) =>
            toMonthStartUTC(new Date(h.from_date as any)).getTime() <=
            iter.getTime(),
        )
        .sort(
          (a, b) =>
            +new Date(b.from_date as any) - +new Date(a.from_date as any),
        )[0];

      if (active) {
        // ב. התעריף האחרון שנכנס לתוקף עד החודש הזה
        const rate = allRates
          .filter(
            (r) =>
              r.role.id === active.role.id &&
              toMonthStartUTC(new Date(r.effective_from as any)).getTime() <=
                iter.getTime(),
          )
          .sort(
            (a, b) =>
              +new Date(b.effective_from as any) -
              +new Date(a.effective_from as any),
          )[0];

        if (rate) totalDue += rate.amount;
      }

      iter.setUTCMonth(iter.getUTCMonth() + 1);
    }

    return totalDue;
  }

  async getUserTotalDeposits(userId: number): Promise<number> {
    const UserTotalDeposits =
      await this.monthlyDepositsService.getUserTotalDeposits(userId);
    return UserTotalDeposits;
  }

  async calculateUserMonthlyBalance(
    user: UserEntity,
  ): Promise<{ total_due: number; total_paid: number; balance: number }> {
    const totalDue = await this.calculateTotalDue(user.id);
    console.log(totalDue, 'totalDue');
    const totalPaid = await this.getUserTotalDeposits(user.id);
    const balance = totalPaid - totalDue;
    console.log(
      totalDue,
      'totalDue',
      totalPaid,
      'totalPaid',
      balance,
      'balance',
    );
    return { total_due: totalDue, total_paid: totalPaid, balance };
  }

  async updateUserMonthlyBalance(user: UserEntity) {
    const paymentDetails = await this.paymentDetailsRepository.findOne({
      where: { user: { id: user.id, is_admin: false } },
      relations: ['user'],
    });

    if (!paymentDetails) {
      // אם באמת מותר למחוק payment_details – אל תפיל פה את המערכת
      // אפשר להחזיר null או 0 או לזרוק חריגה "מסודרת"
      return null;
    }

    const balanceData = await this.calculateUserMonthlyBalance(user);
    paymentDetails.monthly_balance = balanceData.balance;

    await this.paymentDetailsRepository.save(paymentDetails);
    return paymentDetails.monthly_balance;
  }

  async getAllUsersBalances(): Promise<
    { user: string; total_due: number; total_paid: number; balance: number }[]
  > {
    const users = await this.usersRepository.find({
      where: { is_admin: false },
    });
    const balances = await Promise.all(
      users.map(async (user) => {
        const balanceData = await this.calculateUserMonthlyBalance(user);
        return {
          user: `${user.first_name} ${user.last_name}`,
          ...balanceData,
        };
      }),
    );

    return balances;
  }
  async keepAlive() {
    console.log('I am alive');

    return 'I am alive';
  }
  async setCurrentRole(userId: number, roleId: number) {
    const role = await this.membershipRolesRepo.findOne({
      where: { id: roleId },
    });
    if (!role) throw new BadRequestException('Role not found');

    await this.usersRepository.update({ id: userId }, { current_role: role });
  }
  async updateUserAndPaymentInfo(
    userId: number,
    userPatch?: Partial<UserEntity>,
    paymentPatch?: Partial<PaymentDetailsEntity>,
  ) {
    // 1) ולידציה בסיסית: אם לא נשלח שום דבר לעדכן – זורקים שגיאה 400
    if (
      (!userPatch || Object.keys(userPatch).length === 0) &&
      (!paymentPatch || Object.keys(paymentPatch).length === 0)
    ) {
      throw new BadRequestException('No fields provided to update');
    }

    // 2) מתחילים טרנזקציה: כל מה שבבלוק הפנימי ירוץ עם אותו Transaction Manager
    return this.dataSource.transaction(async (manager) => {
      // 3) שואבים Repositories "קשורים" לטרנזקציה (לא את ה-Repos הרגילים מה-constructor)
      const usersRepo = manager.getRepository(UserEntity);
      const paymentRepo = manager.getRepository(PaymentDetailsEntity);

      // 4) טוענים את המשתמש עם היחס לפרטי תשלום (relations)
      const user = await usersRepo.findOne({
        where: { id: userId },
        relations: ['payment_details'],
      });
      if (!user) throw new NotFoundException('User not found');

      // 5) אם יש userPatch – נעדכן רק את השדות שנשלחו
      if (userPatch && Object.keys(userPatch).length) {
        // 5.א) מונעים עדכון שדות שאסור לשנות ישירות
        delete (userPatch as any).id;
        delete (userPatch as any).created_at;
        delete (userPatch as any).updated_at;

        // 5.ב) merge מבצע "עדכון חלקי" על האובייקט הקיים
        usersRepo.merge(user, userPatch);

        // 5.ג) שומרים למסד הנתונים בתוך הטרנזקציה
        await usersRepo.save(user);
      }

      // 6) אם יש paymentPatch – נעדכן או ניצור רשומת תשלום למשתמש
      if (paymentPatch && Object.keys(paymentPatch).length) {
        // 6.א) שוב, מנקים שדות שלא נרצה שיעודכנו ידנית
        delete (paymentPatch as any).id;
        delete (paymentPatch as any).user;

        if (user.payment_details) {
          // 6.ב) יש כבר רשומת תשלום: עושים merge ושומרים
          paymentRepo.merge(user.payment_details, paymentPatch);
          await paymentRepo.save(user.payment_details);
        } else {
          // 6.ג) אין רשומה: יוצרים חדשה וקושרים למשתמש
          const created = paymentRepo.create({ ...paymentPatch, user });
          user.payment_details = await paymentRepo.save(created);
        }
      }

      // 7) טוענים מחדש את המשתמש אחרי העדכון כדי להחזיר אובייקט עדכני
      const updated = await usersRepo.findOne({
        where: { id: userId },
        relations: ['payment_details'],
      });

      // 8) מחזירים את התוצאה; אם בשלב כלשהו הייתה שגיאה – TypeORM יעשה rollback אוטומטי
      return updated!;
    }); // סוף הטרנזקציה (commit אם הכול עבר, אחרת rollback)
  }
  async searchUsers(query: string, limit = 5): Promise<UserEntity[]> {
    const q = `%${query}%`;
    return this.usersRepository
      .createQueryBuilder('user')
      .where(
        'user.first_name LIKE :q OR user.last_name LIKE :q OR user.phone_number LIKE :q',
        { q },
      )
      .orderBy('user.first_name', 'ASC')
      .limit(limit)
      .getMany();
  }
  async createYearSummary(year: number) {
    const users = await this.getAllUsers();
    const memberUsers = users.filter(
      (user) => user.membership_type == MembershipType.MEMBER,
    );
    const friendUsers = users.filter(
      (user) => user.membership_type == MembershipType.FRIEND,
    );
    for (const user of memberUsers) {
      console.log(user.id);

      const financialDetails =
        await this.userFinancialService.getOrCreateUserFinancials(user);
      const yearDetails =
        await this.userFinancialByYear.getOrCreateFinancialRecord(user, year);
      const spouseName = [user.spouse_first_name, user.spouse_last_name]
        .filter(Boolean)
        .join(' ');

    const hebrewJoinedAt = user.join_date
      ? new HDate(user.join_date).toString('h')
      : undefined;
    const loanBalances = user.payment_details?.loan_balances ?? [];
    const loanDebt = loanBalances
      .filter((loan) => loan.balance < 0)
      .reduce((sum, loan) => sum + Math.abs(loan.balance), 0);
    const unpaidOrders = await this.orderReturnRepo.find({
      where: { user: { id: user.id }, paid: false },
    });
    const standingOrderDebt = unpaidOrders.reduce(
      (sum, order) => sum + (Number(order.amount) || 0),
      0,
    );

    const data: YearSummaryPdfStyleData = {
        year,
        activeLoansTotal: loanDebt,
        standingOrderReturnDebt: standingOrderDebt,
        // cashboxTotal: financialDetails?.total_cash_holdings ?? 0,
        depositedAllTime:
          (financialDetails?.total_fixed_deposits_deposited ?? 0) -
          (financialDetails?.total_fixed_deposits_withdrawn ?? 0),
        depositedThisYear: yearDetails?.total_fixed_deposits_added ?? 0,
        donatedAllTime: financialDetails?.total_donations ?? 0,
        donatedThisYear: yearDetails?.total_donations ?? 0,
        memberName: `${user.first_name} ${user.last_name}`,
        memberId: user.id_number ?? undefined,
        reportDate: new Date().toLocaleDateString('he-IL'),
        spouseName: spouseName || undefined,
        spouseId: user.spouse_id_number ?? undefined,
        // gemachOwnCapital: 0,
        joinedAt: user.join_date
          ? user.join_date.toLocaleDateString('he-IL')
          : '-',
        hebrewJoinedAt,
        memberFeeDebt: user.payment_details.monthly_balance ?? 0,
        memberFeePaidAllTime: financialDetails?.total_monthly_deposits ?? 0,
        memberFeePaidThisYear: yearDetails?.total_monthly_deposits ?? 0,
      };
      await this.mailService.sendYearSummaryPdfStyle(user.email_address, data);
    }
    return 'ok';
  }

  async createYearSummaryForUser(userId: number, year: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId, is_admin: false },
      relations: ['payment_details'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const financialDetails =
      await this.userFinancialService.getOrCreateUserFinancials(user);
    const yearDetails =
      await this.userFinancialByYear.getOrCreateFinancialRecord(user, year);
    const spouseName = [user.spouse_first_name, user.spouse_last_name]
      .filter(Boolean)
      .join(' ');

    const loanBalances = user.payment_details?.loan_balances ?? [];
    const loanDebt = loanBalances
      .filter((loan) => loan.balance < 0)
      .reduce((sum, loan) => sum + Math.abs(loan.balance), 0);
    const unpaidOrders = await this.orderReturnRepo.find({
      where: { user: { id: user.id }, paid: false },
    });
    const standingOrderDebt = unpaidOrders.reduce(
      (sum, order) => sum + (Number(order.amount) || 0),
      0,
    );

    const data: YearSummaryPdfStyleData = {
      year,
      activeLoansTotal: loanDebt,
      standingOrderReturnDebt: standingOrderDebt,
      depositedAllTime:
        (financialDetails?.total_fixed_deposits_deposited ?? 0) -
        (financialDetails?.total_fixed_deposits_withdrawn ?? 0),
      depositedThisYear: yearDetails?.total_fixed_deposits_added ?? 0,
      donatedAllTime: financialDetails?.total_donations ?? 0,
      donatedThisYear: yearDetails?.total_donations ?? 0,
      memberName: `${user.first_name} ${user.last_name}`,
      memberId: user.id_number ?? undefined,
      reportDate: new Date().toLocaleDateString('he-IL'),
      spouseName: spouseName || undefined,
      spouseId: user.spouse_id_number ?? undefined,
      joinedAt: user.join_date
        ? user.join_date.toLocaleDateString('he-IL')
        : '-',
      hebrewJoinedAt: user.join_date
        ? new HDate(user.join_date).toString('h')
        : undefined,
      memberFeeDebt:
        (user.payment_details?.monthly_balance ?? 0) < 0
          ? Math.abs(user.payment_details?.monthly_balance ?? 0)
          : 0,
      memberFeePaidAllTime: financialDetails?.total_monthly_deposits ?? 0,
      memberFeePaidThisYear: yearDetails?.total_monthly_deposits ?? 0,
    };

    await this.mailService.sendYearSummaryPdfStyle(user.email_address, data);
    return { ok: true };
  }
}
