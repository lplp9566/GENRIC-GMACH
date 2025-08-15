import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentDetailsEntity } from './payment_details.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentDetailsService {
  deleteLoanBalances(id: number, id1: number) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(PaymentDetailsEntity)
    private readonly paymentDetailsRepository: Repository<PaymentDetailsEntity>,
  ) {}
async deleteLoanBalance(loanToRemove: number, userID: number): Promise<void> {
  // 1) טוענים את ה־PaymentDetailsEntity לפי יחס ל־User
  const pd = await this.paymentDetailsRepository.findOne({
    where: { user: { id: userID } },      // ← כך תמצאו את השורה הנכונה
    relations: ['user'],
  });
  if (!pd) {
    throw new NotFoundException(`PaymentDetails for user ${userID} not found`);
  }

  // 2) מסננים החוצה את ההלוואה
  const before = [...pd.loan_balances];
  pd.loan_balances = pd.loan_balances.filter(lb => lb.loanId !== loanToRemove);
  console.log('🔍 before:', before);
  console.log('🔍 after filter:', pd.loan_balances);

  // 3) שומרים את ה־entity המעודכן (להוציא גם את קריאת update — לא נחוץ)
  await this.paymentDetailsRepository.save(pd);

  // 4) טוענים שוב כדי לוודא
  const reloaded = await this.paymentDetailsRepository.findOne({
    where: { id: pd.id },
  });
  console.log('✅ after save (db):', reloaded!.loan_balances);
}


}
