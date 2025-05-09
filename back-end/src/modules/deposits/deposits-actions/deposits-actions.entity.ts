import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DepositsEntity } from "../deposits.entity";
import { DepositActionsType } from "./depostits-actions-dto";
@Entity("deposits_actions")
export class DepositsActionsEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => DepositsEntity, (deposit) => deposit.actions, { onDelete: 'CASCADE' })
    deposit: DepositsEntity;

    @Column({ type: "date" })
    date: Date;

    @Column({ type: "enum", enum: DepositActionsType})
    action_type:DepositActionsType ;
    
    @Column({ type: "float", nullable: true   })
    amount?: number;

    @Column({ type: "date", nullable: true   })
    update_date?: Date;
}