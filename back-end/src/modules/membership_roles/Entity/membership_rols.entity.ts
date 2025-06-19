import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('membership_roles')
export class MembershipRoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  name: string;
}
