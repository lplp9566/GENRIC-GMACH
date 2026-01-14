import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bank_current')
export class BankCurrentEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar' })
  bank_name: string;
  @Column({ type: 'date' })
  date: Date;
  @Column({ type: 'float' })
  amount: number;
}
