// src/whatsapp/whatsapp-payments-flow.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MonthlyDepositsService } from '../monthly_deposits/monthly_deposits.service';
import { payment_method } from '../users/userTypes';

type Step =
  | 'IDLE'
  | 'SEARCH_USER'
  | 'CHOOSE_USER'
  | 'ASK_AMOUNT'
  | 'ASK_DATE'
  | 'CONFIRM';

interface PaymentConversationState {
  step: Step;
  searchResults?: { index: number; userId: number; label: string }[];
  selectedUserId?: number;
  amount?: number;
  dateStr?: string; // yyyy-mm-dd
}

@Injectable()
export class WhatsappPaymentsFlowService {
  constructor(
    private readonly usersService: UsersService,
    private readonly monthlyDepositsService: MonthlyDepositsService,
  ) {}

  private sessions = new Map<string, PaymentConversationState>();

  private getSession(phone: string): PaymentConversationState {
    if (!this.sessions.has(phone)) {
      this.sessions.set(phone, { step: 'IDLE' });
    }
    return this.sessions.get(phone)!;
  }

  private resetSession(phone: string) {
    this.sessions.set(phone, { step: 'IDLE' });
  }

  async handleIncoming(phone: string, text: string): Promise<string> {
    const cleanText = (text || '').trim();
    const lower = cleanText.toLowerCase();
    const session = this.getSession(phone);

    // ביטול מכל שלב
    if (['ביטול', 'cancel', 'בטל'].includes(lower)) {
      this.resetSession(phone);
      return 'הפעולה בוטלה. כדי להתחיל מחדש כתוב: "הוראת קבע".';
    }

    // התחלה
    if (session.step === 'IDLE') {
      if (lower.includes('הוראת קבע')) {
        session.step = 'SEARCH_USER';
        return 'התחלנו תהליך הוראת קבע.\nשלב 1: כתוב שם או מספר טלפון של המשתמש לחיפוש.';
      }
      return 'שלום 😊\nכדי להתחיל תהליך הוראת קבע, כתוב: "הוראת קבע".';
    }

    // חיפוש משתמש לפי שם/טלפון
    if (session.step === 'SEARCH_USER') {
      const query = cleanText;

      const users = await this.usersService.searchUsers(query, 5); // נכתוב פונקציה כזו עוד רגע

      if (!users.length) {
        return 'לא נמצאו משתמשים מתאימים. נסה שם/טלפון אחר או כתוב "ביטול".';
      }

      const results = users.map((u, idx) => ({
        index: idx + 1,
        userId: u.id,
        label: `${idx + 1} – ${u.first_name} ${u.last_name ?? ''}, ${u.phone_number ?? ''}, ID: ${u.id}`,
      }));

      session.searchResults = results;
      session.step = 'CHOOSE_USER';

      const lines = results.map((r) => r.label).join('\n');
      return `מצאתי את המשתמשים הבאים:\n${lines}\n\nכתוב את המספר 1–${results.length} כדי לבחור משתמש, או "ביטול" לביטול.`;
    }

    // בחירת משתמש מהרשימה
    if (session.step === 'CHOOSE_USER') {
      const choice = Number(cleanText);

      if (
        Number.isNaN(choice) ||
        !session.searchResults ||
        !session.searchResults.find((r) => r.index === choice)
      ) {
        return 'בחירה לא תקינה. כתוב את המספר של המשתמש מהרשימה (למשל 1), או "ביטול".';
      }

      const chosen = session.searchResults.find((r) => r.index === choice)!;

      session.selectedUserId = chosen.userId;
      session.searchResults = undefined;
      session.step = 'ASK_AMOUNT';

      return `נבחר המשתמש:\n${chosen.label}\n\nשלב 2: מה סכום ההוראה החודשית? (מספר בלבד, לדוגמה: 150)`;
    }

    // סכום
    if (session.step === 'ASK_AMOUNT') {
      const amount = Number(cleanText);
      if (Number.isNaN(amount) || amount <= 0) {
        return 'סכום לא תקין. אנא שלח מספר גדול מאפס, לדוגמה: 150.';
      }

      session.amount = amount;
      session.step = 'ASK_DATE';
      return 'שלב 3: מה תאריך ההפקדה? כתוב בפורמט: יום/חודש/שנה\nלדוגמה: 01/12/2025';
    }

    // תאריך
    if (session.step === 'ASK_DATE') {
      const [dd, mm, yyyy] = cleanText.split(/[./\-]/);
      const day = Number(dd);
      const month = Number(mm);
      const year = Number(yyyy);

      if (!day || !month || !year) {
        return 'תאריך לא תקין. ודא שאתה כותב בפורמט 01/12/2025.';
      }

      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) {
        return 'תאריך לא תקין. נסה שוב.';
      }

      // נשמור מחרוזת yyyy-mm-dd
      const mmPad = String(month).padStart(2, '0');
      const ddPad = String(day).padStart(2, '0');
      session.dateStr = `${year}-${mmPad}-${ddPad}`;
      session.step = 'CONFIRM';

      return `אישור פעולה:\nמשתמש ID: ${session.selectedUserId}\nסכום: ${session.amount} ₪\nתאריך: ${cleanText}\n\nאם כל הנתונים נכונים, השב "1".\nאם לא, כתוב "ביטול".`;
    }

    // אישור סופי
    if (session.step === 'CONFIRM') {
      if (cleanText === '1') {
        try {
          const depositDate = new Date(session.dateStr!);
          await this.monthlyDepositsService.recordMonthlyDeposit({
            user: session.selectedUserId,
            amount: session.amount,
            deposit_date: depositDate,
            description: 'הוראת קבע דרך וואטסאפ',
            payment_method: payment_method.direct_debit,
          } as any);
          this.resetSession(phone);
          return 'ההפקדה נרשמה בהצלחה ✅';
        } catch (err: any) {
          this.resetSession(phone);
          return `אירעה שגיאה ברישום ההפקדה: ${err.message ?? ''}`;
        }
      }

      return 'לא זוהתה תשובה. השב "1" לאישור או "ביטול" לביטול.';
    }

    // fallback
    this.resetSession(phone);
    return 'משהו השתבש בזרימה. נסה שוב לכתוב: "הוראת קבע".';
  }
}
