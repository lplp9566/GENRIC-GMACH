import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../users/user.entity";


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
   }
