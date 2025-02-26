import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanPaymentEntity } from './loan_payments.entity';

@Module({
    imports: [TypeOrmModule.forFeature([LoanPaymentEntity])],
    exports: [TypeOrmModule]
})
export class LoanPaymentsModule {
    ;
}
