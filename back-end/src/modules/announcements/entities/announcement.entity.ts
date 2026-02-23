import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/user.entity';
import { AnnouncementRecipientEntity } from './announcement-recipient.entity';
import { AnnouncementAudience } from '../dto/create-announcement.dto';

@Entity('announcements')
export class AnnouncementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string | null;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  audience: AnnouncementAudience | null;

  // TODO: if users.id migrates to UUID, change this FK column to uuid as well.
  @Column({ type: 'int', name: 'created_by_user_id' })
  createdByUserId: number;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser: UserEntity;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @OneToMany(
    () => AnnouncementRecipientEntity,
    (recipient) => recipient.announcement,
    { cascade: false },
  )
  recipients: AnnouncementRecipientEntity[];
}
