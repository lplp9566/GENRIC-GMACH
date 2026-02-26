import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DepositsActionsEntity } from './Entity/deposits-actions.entity';
import { DepositsService } from '../deposits.service';
import {
  DepositActionsType,
  IDepositAction,
  IUpdateDepositAction,
} from './depostits-actions-dto';
import { DepositsEntity } from '../Entity/deposits.entity';
import { MailService } from '../../mail/mail.service';
import { FundsOverviewService } from '../../funds-overview/funds-overview.service';

@Injectable()
export class DepositsActionsService {
  constructor(
    @InjectRepository(DepositsActionsEntity)
    private depositsActionsRepo: Repository<DepositsActionsEntity>,
    @InjectRepository(DepositsEntity)
    private readonly depositsRepo: Repository<DepositsEntity>,
    private readonly depositsService: DepositsService,
    private readonly mailService: MailService,
    private readonly fundsOverviewService: FundsOverviewService,
  ) {}
  async getDepositsActions() {
    return await this.depositsActionsRepo.find({
      relations: ['deposit', 'deposit.user'],
      order: { date: 'DESC', id: 'DESC' },
    });
  }

  async getDepositsActionsByDepositId(id: number) {
    return await this.depositsActionsRepo.find({
      where: { deposit: { id } },
      relations: ['deposit', 'deposit.user'],
      order: { date: 'DESC', id: 'DESC' },
    });
  }
  async createDepositAction(depositAction: IDepositAction) {
    try {
      console.log(depositAction)
      if (!depositAction) {
        throw new Error('DepositAction not found');
      }  
      const deposit = await this.depositsRepo.findOne({ where: { id: depositAction.deposit }  , relations: ['user'], });
      if (!deposit) {
        throw new Error('Deposit not found');
      }
      switch (depositAction.action_type) {
        case DepositActionsType.InitialDeposit:
          if (!depositAction.amount) throw new Error('Amount not found');
          const initialAction = this.depositsActionsRepo.create({
            deposit: deposit,
            action_type: depositAction.action_type,
            amount: depositAction.amount,
            date: depositAction.date,
          });
          await this.depositsActionsRepo.save(initialAction);
          return this.depositsActionsRepo.findOne({
            where: { id: initialAction.id },
            relations: ['deposit', 'deposit.user'],
          });
        case DepositActionsType.ChangeReturnDate:
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
          console.log(newAction,"new")
           await this.depositsActionsRepo.save(newAction);
           await this.maybeSendReceiptEmail(
             deposit.user,
             'עדכון יום החזר הפקדה',
             [`יום ההחזר עודכן לתאריך ${depositAction.update_date}.`],
           );
           return this.depositsActionsRepo.findOne({
             where: { id: newAction.id },
             relations: ['deposit', 'deposit.user'],
           });
        case DepositActionsType.RemoveFromDeposit:
          if (!depositAction.amount) throw new Error('Amount not found');
          await this.assertAvailableFunds(Number(depositAction.amount));
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
           return this.depositsActionsRepo.findOne({
             where: { id: newAction2.id },
             relations: ['deposit', 'deposit.user'],
           });
        case DepositActionsType.AddToDeposit:
          if (!depositAction.amount) throw new Error('Amount not found');
          await this.depositsService.addToDeposit(
            deposit,
            depositAction.amount,
            depositAction.date,
          );
          const newAction3 = this.depositsActionsRepo.create({
            deposit:deposit,
            action_type:depositAction.action_type,
            amount:depositAction.amount,
            date:depositAction.date
          });
  
           await this.depositsActionsRepo.save(newAction3);
           return this.depositsActionsRepo.findOne({
             where: { id: newAction3.id },
             relations: ['deposit', 'deposit.user'],
           });
          
      }

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateDepositAction(id: number, dto: IUpdateDepositAction) {
    try {
      return await this.depositsActionsRepo.manager.transaction(async (manager) => {
        const action = await manager.findOne(DepositsActionsEntity, {
          where: { id },
          relations: ['deposit', 'deposit.user'],
        });
        if (!action) throw new Error('Deposit action not found');

        if (!this.isMutableAction(action.action_type)) {
          throw new Error('Only add/remove deposit actions can be edited');
        }

        const depositId = Number(action.deposit?.id);
        const deposit = await manager.findOne(DepositsEntity, {
          where: { id: depositId },
          relations: ['user'],
        });
        if (!deposit) throw new Error('Deposit not found');

        const oldAmount = Number(action.amount ?? 0);
        const newAmount = dto.amount != null ? Number(dto.amount) : oldAmount;

        if (!Number.isFinite(newAmount) || newAmount <= 0) {
          throw new Error('Amount must be greater than zero');
        }

        if (action.action_type === DepositActionsType.AddToDeposit) {
          // On update: reverse old (+old), apply new (+new) => net (new - old)
          const currentBalance = Number(deposit.current_balance ?? 0);
          const nextBalance = currentBalance + (newAmount - oldAmount);
          if (newAmount < oldAmount) {
            await this.assertAvailableFunds(oldAmount - newAmount);
          }
          if (nextBalance < 0) {
            throw new Error('Not enough available balance for this edit');
          }
          deposit.current_balance = nextBalance;
        } else if (action.action_type === DepositActionsType.RemoveFromDeposit) {
          // On update: reverse old (-old), apply new (-new) => net -(new - old)
          if (newAmount > oldAmount) {
            await this.assertAvailableFunds(newAmount - oldAmount);
          }
          const nextBalance = Number(deposit.current_balance ?? 0) - (newAmount - oldAmount);
          if (nextBalance < 0) {
            throw new Error('Not enough available balance for this edit');
          }
          deposit.current_balance = nextBalance;
        }

        if (dto.date) {
          const parsedDate = new Date(dto.date);
          if (Number.isNaN(parsedDate.getTime())) throw new Error('Invalid date');
          action.date = parsedDate;
        }

        action.amount = newAmount;
        deposit.isActive = deposit.current_balance > 0;
        deposit.updated_at = new Date();

        await manager.save(DepositsEntity, deposit);
        await manager.save(DepositsActionsEntity, action);

        return manager.findOne(DepositsActionsEntity, {
          where: { id: action.id },
          relations: ['deposit', 'deposit.user'],
        });
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteDepositAction(id: number) {
    try {
      return await this.depositsActionsRepo.manager.transaction(async (manager) => {
        const action = await manager.findOne(DepositsActionsEntity, {
          where: { id },
          relations: ['deposit', 'deposit.user'],
        });
        if (!action) throw new Error('Deposit action not found');

        if (!this.isMutableAction(action.action_type)) {
          throw new Error('Only add/remove deposit actions can be deleted');
        }

        const depositId = Number(action.deposit?.id);
        const deposit = await manager.findOne(DepositsEntity, {
          where: { id: depositId },
          relations: ['user'],
        });
        if (!deposit) throw new Error('Deposit not found');

        const amount = Number(action.amount ?? 0);
        if (!Number.isFinite(amount) || amount <= 0) {
          throw new Error('Invalid action amount');
        }

        if (action.action_type === DepositActionsType.AddToDeposit) {
          await this.assertAvailableFunds(amount);
          // Deleting add means removing what was added.
          const currentBalance = Number(deposit.current_balance ?? 0);
          if (currentBalance < amount) {
            throw new Error('Not enough available balance to delete this action');
          }
          const nextBalance = currentBalance - amount;
          if (nextBalance < 0) {
            throw new Error('Not enough available balance to delete this action');
          }
          deposit.current_balance = nextBalance;
        } else if (action.action_type === DepositActionsType.RemoveFromDeposit) {
          // Deleting withdraw means restoring the withdrawn amount.
          deposit.current_balance = Number(deposit.current_balance ?? 0) + amount;
        }

        deposit.isActive = deposit.current_balance > 0;
        deposit.updated_at = new Date();

        await manager.save(DepositsEntity, deposit);
        await manager.delete(DepositsActionsEntity, { id: action.id });

        return { id, deleted: true, depositId: deposit.id, currentBalance: deposit.current_balance };
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private isMutableAction(actionType: DepositActionsType) {
    return (
      actionType === DepositActionsType.AddToDeposit ||
      actionType === DepositActionsType.RemoveFromDeposit
    );
  }

  private async assertAvailableFunds(requiredAmount: number) {
    const amount = Number(requiredAmount ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) return;

    const fundDetails = await this.fundsOverviewService.getFundDetails();
    const available = Number(fundDetails?.available_funds ?? 0);

    if (available < amount) {
      throw new Error(
        `אין יתרה זמינה מספקת. נדרש ${amount} אך זמין ${available}`,
      );
    }
  }

  private async maybeSendReceiptEmail(
    user: any,
    title: string,
    lines: string[],
  ) {
    if (!user) return;
    if (user.notify_receipts === false) return;
    if (!user.email_address) return;

    const fullName = `${user.first_name} ${user.last_name}`.trim();
    await this.mailService.sendReceiptNotification({
      to: user.email_address,
      fullName: fullName || 'לקוח יקר',
      idNumber: user.id_number ?? '',
      title,
      lines,
    });
  }
  
}
