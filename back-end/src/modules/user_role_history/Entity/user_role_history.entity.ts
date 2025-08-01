import { MembershipRoleEntity } from "../../membership_roles/Entity/membership_rols.entity";
import { UserEntity } from "../../users/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('user_role_history')
export class UserRoleHistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.roleHistory, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => MembershipRoleEntity, { onDelete: 'SET NULL' })
  role: MembershipRoleEntity;

  @Column({
    type: 'date',
    transformer: {
      to:   (value: Date)   => value,          
      from: (value: string) => new Date(value) 
    }
  })
  from_date: Date;
}
