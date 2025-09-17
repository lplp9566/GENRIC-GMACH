import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DonationActionType } from '../donations_dto';
import { UserEntity } from '../../users/user.entity';

@Entity('donations')
export class DonationsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.donations ,{nullable:true})
  user: UserEntity;

  @Column({ type: 'date' })
  date: Date;
  @Column({ type: 'enum', enum:DonationActionType })
  action: DonationActionType;
  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'text' })
  donation_reason: string;
}
