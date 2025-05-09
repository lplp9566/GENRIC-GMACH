import { BadRequestException, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { DepositsEntity } from '../deposits.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DepositsActionsEntity } from './deposits-actions.entity';
import { DepositsService } from '../deposits.service';
import { DepositActionsType, IDepositAction } from './depostits-actions-dto';

@Injectable()
export class DepositsActionsService {
  constructor(
    @InjectRepository(DepositsActionsEntity)
    private depositsActionsRepo: Repository<DepositsActionsEntity>,
    @InjectRepository(DepositsEntity)
    private readonly depositsRepo: Repository<DepositsEntity>,
    private readonly depositsService: DepositsService,
  ) {}
  async getDepositsActions() {
    return await this.depositsActionsRepo.find();
  }

  async getDepositsActionsByDepositId(id: number) {
    return await this.depositsActionsRepo.find({ where: { deposit: { id } } });
  }
  async createDepositAction(depositAction: IDepositAction) {
    try {
      if (!depositAction) {
        throw new Error('DepositAction not found');
      }  
      const deposit = await this.depositsRepo.findOne({ where: { id: depositAction.deposit }  , relations: ['user'], });
      if (!deposit) {
        throw new Error('Deposit not found');
      }
      switch (depositAction.action_type) {
        case DepositActionsType.ChangeReturnDate:
          console.log("first")
          if (!depositAction.update_date) throw new Error('Update date not found');
  
          await this.depositsService.editEndDate(
            depositAction.deposit,
            depositAction.update_date,
          );
  
          const newAction =this.depositsActionsRepo.create({
            deposit:deposit,
            action_type:depositAction.action_type,
            date:depositAction.date,
            update_date:depositAction.update_date
          });
  
           await this.depositsActionsRepo.save(newAction);
           return this.depositsService.getDepositsActive();
           break
        case DepositActionsType.RemoveFromDeposit:
          console.log("rrr")
          if (!depositAction.amount) throw new Error('Amount not found');
          await this.depositsService.withdrawDeposit(
            deposit,
            depositAction.amount,
            depositAction.date,
          );
  
          const newAction2 =   this.depositsActionsRepo.create({
            deposit:deposit!,
            action_type:depositAction.action_type,
            amount:depositAction.amount,
            date:depositAction.date
          });
  
           await this.depositsActionsRepo.save(newAction2);
           return this.depositsService.getDepositsActive(); 
           break
          
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  
}
