import { MembershipRoleEntity } from "../../membership_roles/Entity/membership_rols.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('role_monthly_rates')
export class RoleMonthlyRateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MembershipRoleEntity, { onDelete: 'CASCADE' })
  role: MembershipRoleEntity;
  @Column({
    type: 'date',
    transformer: {
      from: (value: string) => new Date(value),
      to:   (value: Date)   => value,
    },
  })
  effective_from: Date;

  @Column({ type: 'float' })
  amount: number;
}


