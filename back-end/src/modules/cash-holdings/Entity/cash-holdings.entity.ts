import { UserEntity } from '../../users/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cash_holdings')
export class CashHoldingsEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => UserEntity, (user) => user.donations)
  user: UserEntity;
  @Column({ type: 'float' })
  amount: number;
    @Column({ type: 'text' })
    note : string;
    @Column({type:'boolean'})
    is_active : boolean
}
