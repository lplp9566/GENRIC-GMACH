import { Module } from '@nestjs/common';
import { RegulationController } from './regulation.controller';
import { RegulationService } from './regulation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegulationEntity } from './entity/regulation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RegulationEntity])],
  controllers: [RegulationController],
  providers: [RegulationService],
  exports: [RegulationService,TypeOrmModule],
})
export class RegulationModule {}
