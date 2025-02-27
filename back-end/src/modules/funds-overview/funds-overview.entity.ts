import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('funds_overview')
export class FundsOverviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  total_funds: number; // ✅ ההון העצמי של הגמ"ח

  @Column({ type: 'float' })
  loaned_amount: number; // ✅ סכום הכסף שנמצא כרגע בהלוואות

  @Column({ type: 'float' })
  investments: number; // ✅ סכום הכסף שנמצא בהשקעות

  @Column({ type: 'float' })
  special_funds: number; // ✅ סכום שמוקצה לקרנות מיוחדות (קרן עונג שבת וכו')

  @Column({ type: 'float' })
  monthly_deposits: number; // ✅ כסף שנכנס מהפקדות חודשיות

  @Column({ type: 'float' })
  donations_received: number; // ✅ כסף שנכנס מתרומות

  @Column({ type: 'float' })
  available_funds: number; // ✅ כסף נזיל (סך ההון העצמי פחות ההשקעות והלוואות

  @Column({ type: 'float', default: 0 })
  user_deposits_total: number; // ✅ סכום הפיקדונות הכללי בגמ"ח

  @Column({ type: 'float', default: 0 })
  expenses_total: number; // ✅ סכום ההוצאות הכללי בגמ"ח

  @Column({ type: 'json', nullable: true })
  fund_details: Record<string, number>; // ✅ פירוט הקרנות לפי שם וסכום
}
