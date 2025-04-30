import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { RequestStatus } from "../dto/request.dto";
import { UserEntity } from "../../users/user.entity"

@Entity('requests')
export class RequestEntity {
    @PrimaryGeneratedColumn()
  id: number;
 @ManyToOne(() => UserEntity, (user) => user.loans, { onDelete: 'CASCADE' })
  user: UserEntity;  userId: number;
  
  @Column({type:"date"})
  requestDate: Date;
@Column({type:"text"})
  request: string;
  @Column({type:"enum", enum:RequestStatus})
  status: RequestStatus;
}
