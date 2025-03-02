import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity('donations')
export class DonationsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.donations)
  user: UserEntity;

  @Column({ type: 'date' })
  donation_date: Date;

  @Column({ type: 'float' })
  amount: number;
  
  @Column({ type: 'text' })
  donation_reason: string;
  
}
