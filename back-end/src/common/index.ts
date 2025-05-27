export  interface FindLoansOpts {
  page?: number;
  limit?: number;
  userId?: number;
}
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageCount: number;
}