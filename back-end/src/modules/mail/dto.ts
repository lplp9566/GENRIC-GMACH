export interface YearSummaryPdfStyleData {
  reportDate: string;
  hebrewReportDate?: string;
  year: number;

  memberName: string;
  memberId?: string;
  joinedAt: string;
  hebrewJoinedAt?: string;
  spouseName?: string;
  spouseId?: string;

  memberFeePaidThisYear: number;
  memberFeePaidAllTime: number;
  memberFeeDebt: number;

  donatedThisYear: number;
  donatedAllTime: number;

  depositedThisYear: number;
  depositedAllTime: number;

  activeLoansTotal: number;
  loanDebtTotal: number;
  totalLoansTakenCount: number;
  totalLoansTakenAmount: number;
  standingOrderReturnDebt?: number;

  cashboxTotal?: number;
}

export interface DonationReceiptEmailData {
  to: string;
  fullName: string;
  idNumber: string;
  amount: number;
  fundLabel: string;
  logoUrl?: string;
}
