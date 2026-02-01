import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentDetailsEntity } from './payment-details/payment_details.entity';
import { UserFinancialByYearEntity } from './user-financials-by-year/user-financial-by-year.entity';
import { MonthlyDepositsEntity } from '../monthly_deposits/monthly_deposits.entity';
import { UserFinancialEntity } from './user-financials/user-financials.entity';
import { RequestEntity } from '../requests/entities/request.entity';
import { CashHoldingsEntity } from '../cash-holdings/Entity/cash-holdings.entity';
import { OrderReturnEntity } from '../order-return/Entity/order-return.entity';
import { LoanEntity } from '../loans/Entity/loans.entity';
import { DonationsEntity } from '../donations/Entity/donations.entity';
import { DepositsEntity } from '../deposits/Entity/deposits.entity';
import { UserRoleHistoryEntity } from '../user_role_history/Entity/user_role_history.entity';
import { MembershipRoleEntity } from '../membership_roles/Entity/membership_rols.entity';
import { MembershipType, userPermission } from './userTypes';
// cSpell:ignore Financials
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  first_name: string;

  @Column({ type: 'text' })
  last_name: string;

  @Column({ type: 'text' })
  id_number: string;

  @Column({
    type: 'date',
    nullable: true,
    transformer: {
      from: (value: string | null) => (value ? new Date(value) : null),
      to: (value: Date | null) => value,
    },
  })
  join_date: Date | null;
  @Column({ type: 'text' })
  password: string;

  @Column({ type: 'text' })
  email_address: string;

  @Column({ type: 'text' })
  phone_number: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  is_member: boolean | null;

  @Column({ type: 'text', nullable: true })
  spouse_first_name: string | null;

  @Column({ type: 'text', nullable: true })
  spouse_last_name: string | null;

  @Column({ type: 'text', nullable: true })
  spouse_id_number: string | null;

  @Column({ type: 'boolean', default: true, nullable: true })
  notify_account: boolean;
  @Column({ type: 'boolean', default: true, nullable: true })
  notify_receipts: boolean;
  @Column({ type: 'boolean', default: true, nullable: true })
  notify_general: boolean;
  @Column({ type: 'boolean', default: false })
  is_admin: boolean;
  @Column({ type: 'enum', enum: ['user', 'admin_read', 'admin_write'], default: 'user' })
  permission: userPermission;
  
  @OneToOne(
    () => PaymentDetailsEntity,
    (paymentDetails) => paymentDetails.user,
    { cascade: true },
  )
  payment_details: PaymentDetailsEntity;
  @Column({
    type: 'enum',
    enum: MembershipType,
    default: MembershipType.MEMBER,
    name: 'membership_type',
  })
  membership_type: MembershipType;

  @ManyToOne(() => MembershipRoleEntity, { nullable: true, eager: true })
  current_role: MembershipRoleEntity;

  @OneToMany(() => UserRoleHistoryEntity, (history) => history.user, {
    cascade: true,
  })
  roleHistory: UserRoleHistoryEntity[];

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
