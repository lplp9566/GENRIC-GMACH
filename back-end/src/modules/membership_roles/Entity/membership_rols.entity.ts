import { RoleMonthlyRateEntity } from "../../role_monthly_rates/Entity/role_monthly_rates.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('membership_roles')
export class MembershipRoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  name: string;

    @OneToMany(() => RoleMonthlyRateEntity, rate => rate.role, {
    cascade: ['insert', 'update'], 
    eager: false, 
  })
  monthlyRates: RoleMonthlyRateEntity[];
}
