import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FundEntity } from '../../funds/Entity/funds.entity';

@Entity('fund_year_stats')
@Index(['fundId', 'year'], { unique: true })
export class FundYearStatsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  fundId: number;

  @ManyToOne(() => FundEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund: FundEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  donatedTotal: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  withdrawnTotal: string;
}
