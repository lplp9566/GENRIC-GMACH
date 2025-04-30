export interface IRequest {
  id?: number;
  userId: number;
  request: string;
  status: RequestStatus;
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
