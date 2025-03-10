import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { InvestmentEntity } from "../../entity/investments.entity";

@Entity('investment_transactions')
export class InvestmentTransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => InvestmentEntity, investment => investment.id, { onDelete: 'CASCADE' })
  investment: InvestmentEntity;

  @Column({ type: 'enum', enum: ['INITIAL_INVESTMENT', 'ADDITIONAL_INVESTMENT', 'VALUE_UPDATE', 'WITHDRAWAL', 'MANAGEMENT_FEE'] })
  transaction_type: 'INITIAL_INVESTMENT' | 'ADDITIONAL_INVESTMENT' | 'VALUE_UPDATE' | 'WITHDRAWAL' | 'MANAGEMENT_FEE';

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  transaction_date: Date;

  @Column({ type: 'text', nullable: true })
  note: string;
}
