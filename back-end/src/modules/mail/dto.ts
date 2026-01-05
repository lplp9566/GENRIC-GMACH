  export interface YearSummaryPdfStyleData {
  // כותרת
  reportDate: string;  // למשל "01.01.2025"
  year: number;        // 2024

  // פרטי חבר
  memberName: string;  // "אלעיזר פיסקוב"
  memberId?: string;   // אופציונלי
  joinedAt: string;    // "07.2019"

  // דמי חבר
  memberFeePaidThisYear: number;     // 1693
  memberFeePaidAllTime: number;      // 4945
  memberFeeDebt: number;             // 0

  // תרומות
  donatedThisYear: number;            // 0
  donatedAllTime: number;             // 1350

  // הפקדות
  depositedThisYear: number;          // 0
  depositedAllTime: number;           // 0

  // הלוואות
  activeLoansTotal: number;           // 0

  // נתוני גמ"ח (למטה)
  gemachOwnCapital: number;           // 158698.81
  gemachMainFund: number;             // 129748.12
  gemachMemberFeesTotal: number;      // 69029.02
  gemachDonationsTotal: number;       // 60667.10
  gemachKohRefund?: number;           // 52 (אם זה רלוונטי אצלכם)

  // פירוט קרנות (אופציונלי)
  depositsFund?: number;              // 10747.76
  _fundsTextLine?: string;          // אם יש לך שורה אחת שמאגדת כמה קרנות

  // הוצאות
  expensesTotal: number;              // -116577.17
  expensesCommissions: number;        // -3871.17
  expensesLoansActivity: number;      // -112706
  expensesInvestments: number;        // -19920

  // יתרה
  cashboxTotal: number;               // 26072.81
}