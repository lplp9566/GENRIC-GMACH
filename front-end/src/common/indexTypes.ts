export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageCount: number;
  
}
export interface FindOptionsGeneric {
  status: StatusGeneric;
  page?: number;
  limit?: number;
  userId?: number | undefined;
}

export enum StatusGeneric {
  ALL      = 'all',
  ACTIVE   = 'active',
  INACTIVE = 'inactive',
}