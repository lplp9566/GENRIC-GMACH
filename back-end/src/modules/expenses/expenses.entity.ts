import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';


@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'float'})
  amount: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'date' })
  expenseDate: Date;

}

