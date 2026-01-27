import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { LoanRequestsService } from "./loan-requests.service";
import { payment_method } from "../users/userTypes";

@Controller("loan-requests")
export class LoanRequestsController {
  constructor(private readonly service: LoanRequestsService) {}

  @Post("check")
  check(
    @Body()
    body: {
      userId: number;
      amount: number;
      monthly_payment: number;
      payment_date?: number;
    }
  ) {
    return this.service.checkLoan(body);
  }

  @Post()
  create(
    @Body()
    body: {
      userId: number;
      amount: number;
      monthly_payment: number;
      payment_date?: number;
      purpose?: string;
      payment_method?: payment_method;
    }
  ) {
    return this.service.createRequest(body);
  }

  @Get()
  list(@Query("userId") userId?: string) {
    return this.service.getRequests(userId ? Number(userId) : undefined);
  }

  @Get("guarantor")
  listGuarantor(@Query("userId") userId?: string) {
    if (!userId) return [];
    return this.service.getGuarantorRequests(Number(userId));
  }

  @Patch(":id/details")
  updateDetails(
    @Param("id") id: string,
    @Body()
    body: {
      purpose: string;
      payment_date: number;
      payment_method: payment_method;
    }
  ) {
    return this.service.updateDetails(Number(id), body);
  }

  @Post(":id/guarantor")
  addGuarantor(
    @Param("id") id: string,
    @Body() body: { guarantorId: number }
  ) {
    return this.service.addGuarantor(Number(id), body.guarantorId);
  }

  @Post(":id/guarantor/:gid/approve")
  approveGuarantor(@Param("id") id: string, @Param("gid") gid: string) {
    return this.service.respondGuarantor(Number(id), Number(gid), true);
  }

  @Post(":id/guarantor/:gid/reject")
  rejectGuarantor(@Param("id") id: string, @Param("gid") gid: string) {
    return this.service.respondGuarantor(Number(id), Number(gid), false);
  }

  @Post(":id/admin-approve")
  adminApprove(@Param("id") id: string) {
    return this.service.adminApprove(Number(id));
  }

  @Post(":id/admin-reject")
  adminReject(@Param("id") id: string, @Body() body: { note?: string }) {
    return this.service.adminReject(Number(id), body.note);
  }
}
