import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('funds_overview')
export class FundsOverviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  own_equity: number; // ✅ ההון העצמי של הגמ"ח

  @Column({ type: 'float' })
  fund_principal : number; 

  @Column({ type: 'float' })
  total_loaned_out: number; // ✅ סכום הכסף שנמצא כרגע בהלוואות

  @Column({ type: 'float' })
  total_invested: number; // ✅ סכום הכסף שנמצא בהשקעות

  @Column({ type: 'float' })
  Investment_profits : number;

  @Column({ type: 'float' })
  special_funds: number; // ✅ סכום שמוקצה לקרנות מיוחדות (קרן עונג שבת וכו')

  @Column({ type: 'float' })
  monthly_deposits: number; // ✅ כסף שנכנס מהפקדות חודשיות

  @Column({ type: 'float' })
  total_donations: number; // ✅ כסף שנכנס מתרומות

  @Column({ type: 'float' })
  available_funds: number; // ✅ כסף נזיל (סך ההון העצמי פחות ההשקעות והלוואות
 
  @Column({ type: 'float' })
  cash_holdings : number; 
  
  @Column({ type: 'float', default: 0 })
  total_user_deposits: number; // ✅ סכום הפיקדונות הכללי בגמ"ח

  @Column({ type: 'float', default: 0 })
  total_expenses: number; // ✅ סכום ההוצאות הכללי בגמ"ח

  @Column({ type: 'float', default: 0 })
  standing_order_return : number; // ✅ סכום החזרים על הוראות קבע
  @Column({ type: 'json', nullable: true })
  fund_details: Record<string, number>; // ✅ פירוט הקרנות לפי שם וסכום


}
