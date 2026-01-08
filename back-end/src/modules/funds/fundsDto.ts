import { DonationActionType } from "../donations/donations_dto";

export class CreateDonationDto {
  user?: number; // userId
  date: string;
  amount: number;
  action: DonationActionType;
  donation_reason: string;
  note?: string;
}
