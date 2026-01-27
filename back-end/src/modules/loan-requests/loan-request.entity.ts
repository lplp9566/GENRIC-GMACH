import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "../users/user.entity";
import { payment_method } from "../users/userTypes";
import { LoanGuarantorRequestEntity } from "./loan-request-guarantor.entity";

export enum LoanRequestStatus {
  DRAFT = "DRAFT",
  CHECK_FAILED = "CHECK_FAILED",
  NEED_DETAILS = "NEED_DETAILS",
  NEED_GUARANTOR = "NEED_GUARANTOR",
  GUARANTOR_PENDING = "GUARANTOR_PENDING",
  GUARANTOR_REJECTED = "GUARANTOR_REJECTED",
  ADMIN_PENDING = "ADMIN_PENDING",
  ADMIN_APPROVED = "ADMIN_APPROVED",
  ADMIN_REJECTED = "ADMIN_REJECTED",
}

@Entity("loan_requests")
export class LoanRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  user: UserEntity;

  @Column({ type: "float" })
  amount: number;

  @Column({ type: "float" })
  monthly_payment: number;

  @Column({ type: "text", nullable: true })
  purpose: string | null;

  @Column({ type: "int", nullable: true })
  payment_date: number | null;

  @Column({ type: "enum", enum: payment_method, nullable: true })
  payment_method: payment_method | null;

  @Column({ type: "enum", enum: LoanRequestStatus })
  status: LoanRequestStatus;

  @Column({ type: "text", nullable: true })
  error_message: string | null;

  @Column({ type: "float", nullable: true })
  max_allowed: number | null;

  @Column({ type: "text", nullable: true })
  admin_note: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(
    () => LoanGuarantorRequestEntity,
    (guarantor) => guarantor.request,
    { cascade: true }
  )
  guarantor_requests: LoanGuarantorRequestEntity[];
}
