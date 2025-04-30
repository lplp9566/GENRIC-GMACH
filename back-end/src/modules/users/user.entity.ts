import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PaymentDetailsEntity } from "./payment-details/payment_details.entity";
import { LoanEntity } from "../loans/loans.entity";
import { UserFinancialByYearEntity } from "./user-financials-by-year/user-financial-by-year.entity";
import { MonthlyDepositsEntity } from "../monthly_deposits/monthly_deposits.entity";
import { DonationsEntity } from "../donations/donations.entity";
import { UserFinancialEntity } from "./user-financials/user-financials.entity";
import { RequestEntity } from "../requests/entities/request.entity";
import {UserRole} from "./userTypes"
// cSpell:ignore Financials
@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id :number

    @Column()
    first_name :string ;

    @Column()
    last_name :string ;

    @Column({
        type: 'date',
        transformer: {
          from: (value: string) => new Date(value), 
          to: (value: Date) => value, 
        },
      })
      join_date: Date;

    @Column()
    password :string ;

    @Column()
    email_address:string
    
    @Column()
    phone_number:string

    @Column()
    role : UserRole

    @Column()
    is_admin :boolean
    @OneToOne(() => PaymentDetailsEntity, (paymentDetails) => paymentDetails.user, { cascade: true })
    payment_details: PaymentDetailsEntity;

    @OneToMany(() => LoanEntity, (loan) => loan.user, { cascade: true })
    loans: LoanEntity[];

    @OneToMany(() => UserFinancialByYearEntity, (financials) => financials.user, { cascade: true })
    financialHistoryByYear: UserFinancialByYearEntity[];

    @OneToOne(() => UserFinancialEntity,(financials) => financials.user, { cascade: true })
    userFinancials: UserFinancialEntity


    @OneToMany(()=>MonthlyDepositsEntity, (monthlyDeposits) => monthlyDeposits.user, { cascade: true })
    monthly_deposits: MonthlyDepositsEntity[];
    @OneToMany(()=>DonationsEntity, (donations) => donations.user, { cascade: true })
    donations: DonationsEntity[];
    @OneToMany(() => RequestEntity, (request) => request.user, { cascade: true })
    requests: RequestEntity[];
}
