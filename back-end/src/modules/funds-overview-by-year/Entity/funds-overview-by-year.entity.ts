import { AfterLoad, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('funds_overview_by_year')
export class FundsOverviewByYearEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  year: number; 
  @Column({ type: 'float' })
  total_monthly_deposits: number;

  @Column({ type: 'float' })
  total_equity_donations: number;

  @Column({ type: 'float' })
  special_fund_donations: number;
  @Column({ type: 'float' })
  total_special_funds_withdrawn: number; // Total amount loaned out
  @Column({ type: 'int' })
  total_loans_taken: number;
  @Column({ type: 'float' })
  total_loans_amount: number;
  @Column({ type: 'float' })
  total_loans_repaid: number;

  @Column({ type: 'float', default: 0 })
  total_fixed_deposits_added: number;

  @Column({ type: 'float', default: 0 })
  total_fixed_deposits_withdrawn: number;
  @Column({ type: 'float', default: 0 })
  total_standing_order_return: number;
  @Column({ type: 'float', default: 0 })
  total_investments_out: number; 
  @Column({ type: 'float', default: 0 })
    total_investments_in: number;
  @Column({ type: 'json', nullable: true , default: {} })
  fund_details_donated: Record<string, number>;
  @Column({ type: 'json', nullable: true , default: {} })
  fund_details_withdrawn: Record<string, number>;
  @Column({ type: 'float', default: 0 })
  total_expenses: number;
    @Column({ type: 'float', default: 0 })
  total_donations: number;

  @AfterLoad()
  calculateTotalDonations() {
    this.total_donations =
      (this.total_equity_donations || 0) + (this.special_fund_donations || 0);
  }
}
