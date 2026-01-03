import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import {Expense} from "../../expenses/Entity/expenses.entity"
@Entity('expenses_category')
export class ExpensesCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;
  
  @OneToMany(() => Expense, (expense) => expense.category)
  expenses: Expense[];
}
