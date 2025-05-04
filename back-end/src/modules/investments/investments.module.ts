import { forwardRef, Module } from '@nestjs/common';
import { InvestmentsController } from './investments.controller';
import { InvestmentsService } from './investments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentEntity } from './entity/investments.entity';
import { FundsOverviewModule } from '../funds-overview/funds-overview.module';
import { InvestmentTransactionsModule } from './investment-transactions/investment-transactions.module';
import { FundsOverviewByYearModule } from '../funds-overview-by-year/funds-overview-by-year.module';

@Module({
  imports:[TypeOrmModule.forFeature([InvestmentEntity]),FundsOverviewModule,FundsOverviewByYearModule, forwardRef(() => InvestmentTransactionsModule)
],
  controllers: [InvestmentsController],
  providers: [InvestmentsService],
  exports:[InvestmentsService,TypeOrmModule]
})
export class InvestmentsModule {}
