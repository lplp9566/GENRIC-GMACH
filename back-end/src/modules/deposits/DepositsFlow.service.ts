import { Injectable } from '@nestjs/common';
import { addDays } from 'date-fns';
import { DepositsService } from '../deposits/deposits.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { FundsFlowService } from '../loans/calcelete.service';
import { log } from 'console';

@Injectable()
export class DepositsFlowService {
  constructor(
    private readonly depositsService: DepositsService,
    private readonly fundsOverviewService: FundsOverviewService,
    private readonly fundsFlowService: FundsFlowService,
  ) {}

  /**
   * בדיקת הקדמת תאריך החזר לפיקדון (מלא בלבד).
   * מחזיר ok=true אם אפשר להקדים; אחרת ok=false + הודעת שגיאה ידידותית.
   */
  async canBringDepositForwardFull(
    depositId: number,
    newReturnDate: Date,
    from: Date = new Date(),
  ): Promise<{ ok: boolean; error?: string }> {
    const checkpoint = newReturnDate < from ? addDays(from, 0) : newReturnDate;

    // 1) מצב קרן נוכחי
    const fund = await this.fundsOverviewService.getFundDetails();
    const baseCash = fund.available_funds ?? 0;

    // 2) כל הפיקדונות הפעילים
    const deposits = await this.depositsService.getDepositsActive();
    const target = deposits.find(d => d.id == depositId);
    console.log(depositId, "depositId");
    
    console.log(deposits, "deposits")
    console.log(target, "target")
    if (!target) return { ok: false, error: 'הפיקדון לא נמצא' };

    // 3) בניית מפה: תאריך -> סכום שצריך להחזיר בתאריך הזה
    const checkpointsMap = new Map<string, number>();
    for (const dep of deposits) {
      const end = dep.id === depositId ? checkpoint : new Date(dep.end_date);
      if (end < from) continue; // פיקדון שפוקע לפני נקודת ההתחלה – מניחים שכבר טופל
      const key = end.toISOString().slice(0, 10);
      checkpointsMap.set(key, (checkpointsMap.get(key) ?? 0) + dep.current_balance);
    }

    if (checkpointsMap.size === 0) return { ok: true };

    // 4) מיון כרונולוגי של נקודות הביקורת
    const sorted = Array.from(checkpointsMap.entries())
      .map(([key, sum]) => ({ date: new Date(key), sum }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    let coveredSoFar = 0;

    for (const cp of sorted) {
      // דרישה מצטברת עד cp.date (כל מה שפוקע עד כאן פחות מה שכיסינו)
      const requiredUpToHere =
        Array.from(checkpointsMap.entries())
          .filter(([k]) => new Date(k) <= cp.date)
          .reduce((acc, [, v]) => acc + v, 0) - coveredSoFar;

      if (requiredUpToHere <= 0) continue;

      // תזרים נכנס עד cp.date: דמי חבר + החזרי הלוואות
      const [membershipInflows, loanRepayInflows] = await Promise.all([
        this.fundsFlowService.calculateTotalInflows(from, cp.date),
        this.fundsFlowService.calculateLoanPaymentSum(from, cp.date),
      ]);

      const availableCash = baseCash + membershipInflows + loanRepayInflows;

      if (availableCash < requiredUpToHere) {
        return {
          ok: false,
          error: `אין מספיק מזומן כדי להחזיר את כל הפיקדונות עד ${cp.date.toISOString().slice(0,10)}. זמין ~${availableCash} ₪, נדרש ~${requiredUpToHere} ₪.`,
        };
      }

      // מספיק – מסמנים שכיסינו עד לנקודה זו
      coveredSoFar += requiredUpToHere;
    }

    return { ok: true };
  }
}
