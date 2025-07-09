// AddUserStepProps.ts

import { IAddUserFormData } from "../UsersDto";

export interface UserDetailsStepProps {
  data: IAddUserFormData;
  onUserChange: (key: keyof IAddUserFormData["userData"]) => (e: React.ChangeEvent<any>) => void;
  setData: React.Dispatch<React.SetStateAction<IAddUserFormData>>;
}

export interface PaymentStepProps {
  data: IAddUserFormData;
  onPaymentChange: (key: keyof IAddUserFormData["paymentData"]) => (e: React.ChangeEvent<any>) => void;
}