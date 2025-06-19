import { MembershipRoleEntity } from "src/modules/membership_roles/Entity/membership_rols.entity";
import { UserEntity } from "src/modules/users/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('user_role_history')
export class UserRoleHistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.roleHistory, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => MembershipRoleEntity, { onDelete: 'SET NULL' })
  role: MembershipRoleEntity;

  @Column({ type: 'date' })
  from_date: Date; 
}
