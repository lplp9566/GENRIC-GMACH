import { on } from 'events';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../user.entity';
import { payment_method } from 'src/types/userTypes';

@Entity('payment_details')
export class PaymentDetailsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => UserEntity, (user) => user.payment_details, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Column()
  bank_number: number;

  @Column()
  bank_branch: number;

  @Column()
  bank_account_number: number;

  // @Column()
  // credit_card_number:number'

  @Column()
  charge_date: string;

  @Column()
  amount: number;

  @Column()
  payment_method: payment_method;
}
