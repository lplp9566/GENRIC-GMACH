import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserRole } from '../users/userTypes';

@Entity('monthly_rates')
export class MonthlyRatesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'text' })
  role: UserRole;

  @Column({ type: 'float' })
  amount: number;
}
