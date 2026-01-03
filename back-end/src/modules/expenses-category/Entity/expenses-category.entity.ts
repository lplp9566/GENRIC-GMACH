import { Expense } from 'src/modules/expenses/Entity/expenses.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('expenses_category')
export class ExpensesCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;
  
  @OneToMany(() => Expense, (expense) => expense.category)
  expenses: Expense[];
}
