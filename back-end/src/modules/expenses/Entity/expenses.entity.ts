import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';


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

}

