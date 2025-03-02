import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../users/user.entity";
import { UserDebtsEntity } from "../users/user_debts/user_debts.entity";

@Entity('monthly_deposits')
export class MonthlyDepositsEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, (user) => user.monthly_deposits,{
    })
    user:UserEntity

    @Column({ type: "date" })
    deposit_date: Date;

    @Column({ type: 'float' })
    amount: number;

    @Column({type:"boolean"})
    isDepositCharged:boolean;

     @OneToMany(() => UserDebtsEntity, (debt) => debt.deposit_payment , { cascade: true })
     debt: UserDebtsEntity;
   }
