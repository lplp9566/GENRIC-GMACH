import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { payment_method } from '../users/userTypes';

@Entity('monthly_deposits')
export class MonthlyDepositsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.monthly_deposits, {})
  user: UserEntity;

  @Column({ type: 'date' })
  deposit_date: Date;
  @Column({ type: 'text', nullable: true })
  description?: string;
  @Column({ type: 'enum', enum: payment_method })
  payment_method: payment_method;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'int' })
  month: number;
  @Column({ type: 'int' })
  year: number;
}
