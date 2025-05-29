export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageCount: number;
  
}
export interface FindLoansOpts {
  status: LoanStatus;
  page?: number;
  limit?: number;
  userId?: number;
}

export enum LoanStatus {
  ALL      = 'all',
  ACTIVE   = 'active',
  INACTIVE = 'inactive',
}