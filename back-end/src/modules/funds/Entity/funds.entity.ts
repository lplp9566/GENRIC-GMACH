import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/user.entity';

@Entity('funds')
export class FundEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  createdBy?: UserEntity;

  @CreateDateColumn()
  createdAt: Date;
}
