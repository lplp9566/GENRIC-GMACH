import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FundEntity } from "./Entity/funds.entity";
import { UserEntity } from "../users/user.entity";
@Injectable()
export class FundsService {
  constructor(
    @InjectRepository(FundEntity) private fundsRepo: Repository<FundEntity>,
  ) {}
  async getFunds() {
    return this.fundsRepo.find();
  }

  async findOrCreateByName(name: string, createdByUser?: UserEntity | null) {
    const clean = String(name ?? '').trim();
    if (!clean) throw new BadRequestException('Fund name is required');

    let fund = await this.fundsRepo.findOne({ where: { name: clean } });
    if (!fund) {
      fund = this.fundsRepo.create({ name: clean, createdBy: createdByUser ?? undefined });
      fund = await this.fundsRepo.save(fund);
    }
    return fund;
  }
}
