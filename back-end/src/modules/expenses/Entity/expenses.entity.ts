import { ExpensesCategory } from 'src/modules/expenses-category/entities/expenses-category.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';


@Entity("expenses")
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'float'})
  amount: number;

  @Column({ type: 'text' , nullable: true })
  note?: string;

  @Column({ type: 'date' })
  expenseDate: Date;
  @ManyToOne(() => ExpensesCategory, (category) => category.expenses, {
    eager: true,       // טוען אוטומטית את הקטגוריה
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: ExpensesCategory;
}


