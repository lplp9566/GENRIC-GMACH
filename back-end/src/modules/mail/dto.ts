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
  standingOrderReturnDebt?: number;

  cashboxTotal?: number;
}
