import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentDetailsEntity } from './payment-details/payment_details.entity';
import { UserFinancialByYearEntity } from './user-financials-by-year/user-financial-by-year.entity';
import { MonthlyDepositsEntity } from '../monthly_deposits/monthly_deposits.entity';
import { UserFinancialEntity } from './user-financials/user-financials.entity';
import { RequestEntity } from '../requests/entities/request.entity';
import { UserRole } from './userTypes';
import { CashHoldingsEntity } from '../cash-holdings/Entity/cash-holdings.entity';
import { OrderReturnEntity } from '../order-return/Entity/order-return.entity';
import { LoanEntity } from '../loans/Entity/loans.entity';
import { DonationsEntity } from '../donations/Entity/donations.entity';
import { DepositsEntity } from '../deposits/Entity/deposits.entity';
// cSpell:ignore Financials
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'text'})
  first_name: string;

  @Column({type: 'text'})
  last_name: string;
  @Column({type: 'text'})
  id_number: string;
  @Column({
    type: 'date',
    transformer: {
      from: (value: string) => new Date(value),
      to: (value: Date) => value,
    },
  })
  join_date: Date;
  @Column({type: 'text'})
  password: string;

  @Column({type: 'text'})
  email_address: string;

  @Column({type: 'text'})
  phone_number: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.committeeMember })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  is_admin: boolean;
  @OneToOne(
    () => PaymentDetailsEntity,
    (paymentDetails) => paymentDetails.user,
    { cascade: true },
  )
  payment_details: PaymentDetailsEntity;

  @OneToMany(() => LoanEntity, (loan) => loan.user, { cascade: true })
  loans: LoanEntity[];

  @OneToMany(() => UserFinancialByYearEntity, (financials) => financials.user, {
    cascade: true,
  })
  financialHistoryByYear: UserFinancialByYearEntity[];

  @OneToOne(() => UserFinancialEntity, (financials) => financials.user, {
    cascade: true,
  })
  userFinancials: UserFinancialEntity;

  @OneToMany(
    () => MonthlyDepositsEntity,
    (monthlyDeposits) => monthlyDeposits.user,
    { cascade: true },
  )
  monthly_deposits: MonthlyDepositsEntity[];
  @OneToMany(() => DonationsEntity, (donations) => donations.user, {
    cascade: true,
  })
  donations: DonationsEntity[];
  @OneToMany(() => RequestEntity, (request) => request.user, { cascade: true })
  requests: RequestEntity[];
  @OneToMany(() => CashHoldingsEntity, (holding) => holding.user, {
    cascade: true,
  })
  cashHoldings: CashHoldingsEntity[];
  @OneToMany(() => OrderReturnEntity, (order) => order.user, { cascade: true })
  orderReturns: OrderReturnEntity[];
  @OneToMany(() => DepositsEntity, (deposit) => deposit.user, { cascade: true })
  deposits: DepositsEntity[];
}
