import { UserRole } from "src/types/userTypes";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PaymentDetailsEntity } from "./payment-details/payment_details.entity";
import { LoanEntity } from "../loans/loans.entity";
import { UserFinancialsEntity } from "./user-financials/user-financials.entity";
import { MonthlyDepositsEntity } from "../monthly_deposits/monthle_deposits.entity";
import { UserDebtsEntity } from "./user_debts/user_debts.entity";
import { on } from "events";
import { DonationsEntity } from "../donations/donations.entity";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id :number

    @Column()
    first_name :string ;

    @Column()
    last_name :string ;

    @Column({type:"date"})
    join_data :Date ;

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

    @OneToMany(() => UserFinancialsEntity, (financials) => financials.user, { cascade: true })
    financials: UserFinancialsEntity[];

    @OneToMany(()=>MonthlyDepositsEntity, (monthlyDeposits) => monthlyDeposits.user, { cascade: true })
    monthly_deposits: MonthlyDepositsEntity[];
    @OneToMany(()=>UserDebtsEntity, (debts) => debts.user, { cascade: true })
    debts: UserDebtsEntity[];
    @OneToMany(()=>DonationsEntity, (donations) => donations.user, { cascade: true })
    donations: DonationsEntity[];
}
