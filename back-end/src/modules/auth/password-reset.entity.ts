import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('password_resets')
export class PasswordResetEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  code: string;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  used_at: Date | null;
}
