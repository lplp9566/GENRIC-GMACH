import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LoanRequestEntity, LoanRequestStatus } from "./loan-request.entity";
import {
  GuarantorRequestStatus,
  LoanGuarantorRequestEntity,
} from "./loan-request-guarantor.entity";
import { UserEntity } from "../users/user.entity";
import { LoansService } from "../loans/loans.service";
import { payment_method } from "../users/userTypes";
import { LoanEntity } from "../loans/Entity/loans.entity";

interface CheckLoanInput {
  userId: number;
  amount: number;
  monthly_payment: number;
  payment_date?: number;
}

@Injectable()
export class LoanRequestsService {
  constructor(
    @InjectRepository(LoanRequestEntity)
    private readonly requestsRepo: Repository<LoanRequestEntity>,
    @InjectRepository(LoanGuarantorRequestEntity)
    private readonly guarantorRepo: Repository<LoanGuarantorRequestEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    private readonly loansService: LoansService
  ) {}

  async checkLoan(input: CheckLoanInput) {
    const user = await this.usersRepo.findOne({ where: { id: input.userId } });
    if (!user) throw new BadRequestException("User not found");
    const loanData = {
      user,
      loan_amount: input.amount,
      monthly_payment: input.monthly_payment,
      payment_date: input.payment_date ?? 1,
      loan_date: new Date(),
    } as any;
    return this.loansService.checkLoan(loanData);
  }

  async createRequest(
    input: CheckLoanInput & {
      purpose?: string;
      payment_method?: payment_method;
    }
  ) {
    const user = await this.usersRepo.findOne({ where: { id: input.userId } });
    if (!user) throw new BadRequestException("User not found");
    const check = await this.checkLoan(input);
    if (!check.ok) {
      return { request: null, check };
    }
    const hasDetails =
      Boolean(input.purpose) &&
      Boolean(input.payment_date) &&
      Boolean(input.payment_method);
    const request = this.requestsRepo.create({
      user,
      amount: input.amount,
      monthly_payment: input.monthly_payment,
      purpose: input.purpose ?? null,
      payment_date: input.payment_date ?? null,
      payment_method: input.payment_method ?? null,
      status: hasDetails
        ? user.is_member
          ? LoanRequestStatus.ADMIN_PENDING
          : LoanRequestStatus.NEED_GUARANTOR
        : LoanRequestStatus.NEED_DETAILS,
      error_message: null,
      max_allowed: null,
    });
    const saved = await this.requestsRepo.save(request);
    return { request: saved, check };
  }

  async getRequests(userId?: number) {
    if (userId) {
      return this.requestsRepo.find({
        where: { user: { id: userId } },
        relations: ["user", "guarantor_requests", "guarantor_requests.guarantor"],
        order: { created_at: "DESC" },
      });
    }
    return this.requestsRepo.find({
      relations: ["user", "guarantor_requests", "guarantor_requests.guarantor"],
      order: { created_at: "DESC" },
    });
  }

  async getGuarantorRequests(guarantorId: number) {
    return this.guarantorRepo.find({
      where: { guarantor: { id: guarantorId } },
      relations: ["request", "request.user", "guarantor"],
      order: { created_at: "DESC" },
    });
  }

  async updateDetails(
    requestId: number,
    payload: {
      amount?: number;
      monthly_payment?: number;
      purpose: string;
      payment_date: number;
      payment_method: payment_method;
    }
  ) {
    const request = await this.requestsRepo.findOne({
      where: { id: requestId },
      relations: ["user"],
    });
    if (!request) throw new BadRequestException("Request not found");
    if (payload.amount !== undefined) request.amount = payload.amount;
    if (payload.monthly_payment !== undefined)
      request.monthly_payment = payload.monthly_payment;
    request.purpose = payload.purpose;
    request.payment_date = payload.payment_date;
    request.payment_method = payload.payment_method;
    if (request.user.is_member) {
      request.status = LoanRequestStatus.ADMIN_PENDING;
    } else {
      request.status = LoanRequestStatus.NEED_GUARANTOR;
    }
    return this.requestsRepo.save(request);
  }

  async addGuarantor(requestId: number, guarantorId: number) {
    const request = await this.requestsRepo.findOne({
      where: { id: requestId },
      relations: ["user"],
    });
    if (!request) throw new BadRequestException("Request not found");
    if (
      request.status !== LoanRequestStatus.NEED_GUARANTOR &&
      request.status !== LoanRequestStatus.GUARANTOR_REJECTED
    ) {
      console.log("addGuarantor blocked", {
        requestId,
        status: request.status,
      });
      throw new BadRequestException("Request not ready for guarantor");
    }
    const guarantor = await this.usersRepo.findOne({
      where: { id: guarantorId },
    });
    if (!guarantor) throw new BadRequestException("Guarantor not found");
    const req = this.guarantorRepo.create({
      request,
      guarantor,
      status: GuarantorRequestStatus.PENDING,
    });
    request.status = LoanRequestStatus.GUARANTOR_PENDING;
    await this.requestsRepo.save(request);
    return this.guarantorRepo.save(req);
  }

  async respondGuarantor(
    requestId: number,
    guarantorRequestId: number,
    approve: boolean
  ) {
    const guarantorReq = await this.guarantorRepo.findOne({
      where: { id: guarantorRequestId },
      relations: ["request", "guarantor"],
    });
    if (!guarantorReq) throw new BadRequestException("Guarantor request not found");
    if (guarantorReq.request.id !== requestId) {
      throw new BadRequestException("Request mismatch");
    }
    guarantorReq.status = approve
      ? GuarantorRequestStatus.APPROVED
      : GuarantorRequestStatus.REJECTED;
    await this.guarantorRepo.save(guarantorReq);
    const request = await this.requestsRepo.findOne({
      where: { id: requestId },
      relations: ["user"],
    });
    if (!request) throw new BadRequestException("Request not found");
    request.status = approve
      ? LoanRequestStatus.ADMIN_PENDING
      : LoanRequestStatus.GUARANTOR_REJECTED;
    return this.requestsRepo.save(request);
  }

  async adminApprove(requestId: number) {
    const request = await this.requestsRepo.findOne({
      where: { id: requestId },
      relations: ["user"],
    });
    if (!request) throw new BadRequestException("Request not found");
    const check = await this.checkLoan({
      userId: request.user.id,
      amount: request.amount,
      monthly_payment: request.monthly_payment,
      payment_date: request.payment_date ?? 1,
    });
    if (!check.ok) {
      request.status = LoanRequestStatus.CHECK_FAILED;
      request.error_message = check.error;
      await this.requestsRepo.save(request);
      throw new BadRequestException(check.error);
    }
    const loanPayload: Partial<LoanEntity> = {
      user: request.user.id as any,
      loan_amount: request.amount,
      loan_date: new Date(),
      purpose: request.purpose ?? "",
      monthly_payment: request.monthly_payment,
      payment_date: request.payment_date ?? 1,
      first_payment_date: null,
    };
    await this.loansService.createLoan(loanPayload as any);
    request.status = LoanRequestStatus.ADMIN_APPROVED;
    return this.requestsRepo.save(request);
  }

  async adminReject(requestId: number, note?: string) {
    const request = await this.requestsRepo.findOne({
      where: { id: requestId },
    });
    if (!request) throw new BadRequestException("Request not found");
    request.status = LoanRequestStatus.ADMIN_REJECTED;
    request.admin_note = note ?? null;
    return this.requestsRepo.save(request);
  }
}
