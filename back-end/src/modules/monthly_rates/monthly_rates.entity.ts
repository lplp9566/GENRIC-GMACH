import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('monthly_rates')
export class MonthlyRatesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'text' })
  role: string;

  @Column({ type: 'float' })
  amount: number;
}
