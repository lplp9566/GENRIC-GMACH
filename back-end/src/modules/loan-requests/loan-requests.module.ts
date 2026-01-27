import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoanRequestEntity } from "./loan-request.entity";
import { LoanGuarantorRequestEntity } from "./loan-request-guarantor.entity";
import { LoanRequestsController } from "./loan-requests.controller";
import { LoanRequestsService } from "./loan-requests.service";
import { UserEntity } from "../users/user.entity";
import { LoansModule } from "../loans/loans.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LoanRequestEntity,
      LoanGuarantorRequestEntity,
      UserEntity,
    ]),
    LoansModule,
  ],
  controllers: [LoanRequestsController],
  providers: [LoanRequestsService],
})
export class LoanRequestsModule {}
