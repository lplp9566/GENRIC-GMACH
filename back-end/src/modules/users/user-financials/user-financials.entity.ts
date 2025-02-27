import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from '../user.entity';

@Entity('user_financials')
export class UserFinancialsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, user => user.financials)
  user: UserEntity; // ✅ קישור למשתמש

  @Column({ type: 'int' })
  year: number; // ✅ השנה של הנתונים

  @Column({type :"float" })
  total_deposits: number; // ✅ סך ההפקדות החודשיות באותה שנה

  @Column({ type: 'float' })
  total_donations: number; // ✅ סך התרומות באותה שנה

  @Column({type :"float" })
  total_loans_taken: number; // ✅ סך ההלוואות שנלקחו באותה שנה
    
  @Column({type :"float" }) 
  total_loans_repaid: number; // ✅ סך ההחזרים של הלוואות באותה שנה
}
