import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/user.entity';
import { DepositsActionsEntity } from '../deposits-actions/Entity/deposits-actions.entity';

@Entity('deposits')
export class DepositsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.donations)
  user: UserEntity;

  @Column({type: 'date'})
  start_date: Date;

  @Column({type: 'date'})
  end_date: Date;

  @Column({ type: 'float' })
  initialDeposit: number;
  
  @Column({ type: 'float' })
  current_balance: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => DepositsActionsEntity, action => action.deposit, { cascade: true })
  actions: DepositsActionsEntity[];
}
