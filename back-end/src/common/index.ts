export  interface FindOpts {
  page: number;
  limit: number;
  status?:LoanStatus;
  userId?: number;
  
}
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageCount: number;
}
export enum LoanStatus {
  ALL      = 'all',
  ACTIVE   = 'active',
  INACTIVE = 'inactive',
}