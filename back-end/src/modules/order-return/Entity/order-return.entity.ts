import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/user.entity';

@Entity('order-return')
export class OrderReturnEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => UserEntity, (user) => user.donations)
  user: UserEntity;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'float' })
  amount: number;
}
