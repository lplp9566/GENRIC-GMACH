import { Injectable } from '@nestjs/common';
import { RegulationEntity } from './entity/regulation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RegulationService {
  constructor(
    @InjectRepository(RegulationEntity)
    private readonly regulationRepo: Repository<RegulationEntity>,
  ) {}
  async getRegulation(): Promise<RegulationEntity[]> {
    return await this.regulationRepo.find();
  }

  async createRegulation(
    regulation: RegulationEntity,
  ): Promise<RegulationEntity> {
    return await this.regulationRepo.save(regulation);
  }

async updateOrCreateRegulation(newUrl: string): Promise<RegulationEntity> {
  let regulation = await this.regulationRepo.findOne({ where: {} });

  if (regulation) {
    regulation.regulation = newUrl;
  } else {
    regulation = this.regulationRepo.create({ regulation: newUrl });
  }

  return this.regulationRepo.save(regulation);
}

}
