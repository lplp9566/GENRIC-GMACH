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
import { payment_method } from './userTypes';
import { log } from 'console';

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

    @Inject(forwardRef(() => MonthlyDepositsService))
    private readonly monthlyDepositsService: MonthlyDepositsService,
    @Inject(forwardRef(() => UserRoleHistoryService))
    private readonly userRoleHistoryService: UserRoleHistoryService,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService, 
  ) {}
 
  async getUserPaymentDetails(
    userId: number,
  ): Promise<PaymentDetailsEntity | null> {
    return this.paymentDetailsRepository.findOne({
      where: { user: { id: userId, is_admin: false } },
    });
  }
async onApplicationBootstrap() {
    if (this.config.get('SEED_ADMIN') !== 'true') return;

    const count = await this.usersRepository.count();
    if (count > 0) return;

    // const email = this.config.get<string>('ADMIN_EMAIL');
    // const password = this.config.get<string>('ADMIN_PASSWORD');
    // if (!email || !password) return;

    // תפקיד ברירת מחדל אם נדרש ע"י הסכמה
    const defaultRole = await this.membershipRolesRepo.findOne({ where: { name: 'Member' } });

    // הכנה: האש לסיסמה (כי הפונקציה שלך מצפה לסיסמה גולמית ומבצעת האש בתוכה;
    // אם היא כבר מבצעת האש – תן לה את הגולמית, אחרת האש כאן)
    // const hashed = await bcrypt.hash(password, 12);

    // userData + paymentData "ריקים" (כדי לא להישבר בוולידציה)
    await this.createUserAndPaymentInfo(
      {
        first_name: 'מנהל',
        last_name: 'מערכת',
        email_address: "chesedgmach@gmail.com",
        password: "1234",         
        is_admin: true,
        id_number: '123456789',
         phone_number: '0501234567',
        current_role: null as any,
        join_date: new Date(),
      },
      {
        payment_method: payment_method.bank_transfer,     
        charge_date: 1,
        bank_number: 1,
        bank_branch: 1,
        bank_account_number: 1,
       
      },
    );

    // this.logger.log(`Admin user seeded: ${email}`);
  }
  async createUserAndPaymentInfo(
    userData: Partial<UserEntity>,
    paymentData: Partial<PaymentDetailsEntity>,
    // roleData: Partial<UserRoleHistoryEntity>,
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
      const userWithCurrentRole = await this.usersRepository.findOne({where:{id:savedUser.id},relations:["current_role"]});
      newUser.payment_details = paymentDetails;
      if (userData.current_role) {
        await this.userRoleHistoryService.createUserRoleHistory({
          from_date: newUser.join_date,
          userId: savedUser.id,
          roleId: userWithCurrentRole?.current_role.id!,
        });
      }
      const savedPaymentDetails = await this.usersRepository.save(newUser);
      await this.updateUserMonthlyBalance(newUser)
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
    return this.usersRepository.findOne({ where: { id: Number(id_number), is_admin: false } });
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

    // 4. נקודת ההתחלה – ראש החודש הראשון
    const firstFrom =
      history[0].from_date instanceof Date
        ? history[0].from_date
        : new Date(history[0].from_date);
    let iter = new Date(firstFrom.getFullYear(), firstFrom.getMonth(), 1);

    // 5. נקודת הסיום – ראש החודש הנוכחי
    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    let totalDue = 0;

    // 6. לולאה חודש־חודש מ־iter ועד לרגע end (כולל יוני)
    while (iter.getTime() <= end.getTime()) {
      console.log(user.first_name);
      
      console.log('⏳ Month:', iter.toISOString().slice(0,7));

      // א. בחר את הדרגה שהייתה פעילה באותו חודש
      const active = history
        .filter((h) => new Date(h.from_date).getTime() <= iter.getTime())
        .sort((a, b) => +new Date(b.from_date) - +new Date(a.from_date))[0];

      if (!active) {
        console.log('  ✖ No active role, skipping');
      } else {
        console.log('  ✔ Active role id:', active.role.id);

        // ב. מצא את התעריף האחרון שהחל עד אותו חודש
        const rate = allRates
          .filter(
            (r) =>
              r.role.id === active.role.id &&
              new Date(r.effective_from).getTime() <= iter.getTime(),
          )
          .sort(
            (a, b) => +new Date(b.effective_from) - +new Date(a.effective_from),
          )[0];

        if (rate) {
          console.log('  💰 Using rate:', rate.amount);
          totalDue += rate.amount;
          console.log(`totalDue`,totalDue);
          
        } else {
          console.log('  ✖ No rate found, skipping');
        }
      }

      // מעבר לחודש הבא
      iter.setMonth(iter.getMonth() + 1);
    }

    console.log('🏁 totalDue:', totalDue);
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
    console.log(totalDue,"totalDue");
    const totalPaid = await this.getUserTotalDeposits(user.id);
    const balance = totalPaid - totalDue;
    console.log(totalDue,"totalDue",totalPaid,"totalPaid",balance,"balance");
    return { total_due: totalDue, total_paid: totalPaid, balance };
  }

  async updateUserMonthlyBalance(user: UserEntity) {
    const paymentDetails = await this.paymentDetailsRepository.findOne({
      where: { user: { id: user.id, is_admin: false } },
      relations: ['user'],
    });
    if (!paymentDetails) {
      throw new Error('Payment details not found for user');
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

}
