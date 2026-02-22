import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ExpensesCategory } from '../../expenses-category/Entity/expenses-category.entity';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ type: 'date' })
  expenseDate: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  updated_at: Date | null;

  @ManyToOne(() => ExpensesCategory, (category) => category.expenses, {
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: ExpensesCategory;
}
