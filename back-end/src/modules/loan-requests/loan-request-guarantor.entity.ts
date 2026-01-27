import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "../users/user.entity";
import { LoanRequestEntity } from "./loan-request.entity";

export enum GuarantorRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

@Entity("loan_request_guarantors")
export class LoanGuarantorRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LoanRequestEntity, (request) => request.guarantor_requests, {
    onDelete: "CASCADE",
  })
  request: LoanRequestEntity;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  guarantor: UserEntity;

  @Column({ type: "enum", enum: GuarantorRequestStatus })
  status: GuarantorRequestStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
