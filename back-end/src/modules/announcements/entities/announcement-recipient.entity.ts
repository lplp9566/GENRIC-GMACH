import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AnnouncementEntity } from './announcement.entity';
import { UserEntity } from '../../users/user.entity';

@Entity('announcement_recipients')
@Unique('uq_announcement_recipient', ['announcementId', 'userId'])
@Index('idx_announcement_recipients_announcement_id', ['announcementId'])
@Index('idx_announcement_recipients_user_id', ['userId'])
@Index('idx_announcement_recipients_read_at', ['readAt'])
export class AnnouncementRecipientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'announcement_id' })
  announcementId: string;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @ManyToOne(() => AnnouncementEntity, (announcement) => announcement.recipients, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'announcement_id' })
  announcement: AnnouncementEntity;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'timestamptz', name: 'delivered_at', nullable: true })
  deliveredAt: Date | null;

  @Column({ type: 'timestamptz', name: 'read_at', nullable: true })
  readAt: Date | null;
}

