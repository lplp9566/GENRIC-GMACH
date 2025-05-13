import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InvestmentTransactionEntity } from '../investment-transactions/entity/investment-transaction.entity';
const decimalTransformer = {
  to: (value: number) => value, // לפני שמירה – מספר
  from: (value: string) => parseFloat(value), // אחרי קריאה – ממיר למספר
};
@Entity('investments')
export class InvestmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  investment_name: string;
  @Column()
  investment_by: string;
  @Column()
  company_name: string;
  @Column()
  investment_portfolio_number: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_principal_invested: number; // סה"כ קרן שהושקעה

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  current_value: number; // שווי נוכחי של ההשקעה

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  principal_remaining: number; // כמה מהקרן עוד קיים בתוך ההשקעה

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  profit_realized: number; // סה"כ רווח שצברנו (יכול להיות גם שלילי)

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  withdrawn_total: number; // סה"כ משיכות מההשקעה (קרן ורווחים)

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  management_fees_total: number; // סה"כ דמי ניהול שנגבו

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  last_update: Date; // מתי העדכון האחרון היה

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
  @OneToMany(
    () => InvestmentTransactionEntity,
    (transaction) => transaction.investment,
    { cascade: true },
  )
  transactions: InvestmentTransactionEntity[];
}
