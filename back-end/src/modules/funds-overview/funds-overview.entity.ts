import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('funds_overview')
export class FundsOverviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ })
  total_funds: number; // ✅ ההון העצמי של הגמ"ח

  @Column({})
  loaned_amount: number; // ✅ סכום הכסף שנמצא כרגע בהלוואות

  @Column({ })
  investments: number; // ✅ סכום הכסף שנמצא בהשקעות

  @Column({  })
  special_funds: number; // ✅ סכום שמוקצה לקרנות מיוחדות (קרן עונג שבת וכו')

  @Column({ })
  monthly_deposits: number; // ✅ כסף שנכנס מהפקדות חודשיות

  @Column({  })
  donations_received: number; // ✅ כסף שנכנס מתרומות

  @Column({ })
  available_funds: number; // ✅ כסף נזיל (סך ההון העצמי פחות ההשקעות והלוואות)

  @Column({ type: 'json', nullable: true })
  fund_details: Record<string, number>; // ✅ פירוט הקרנות לפי שם וסכום
}
