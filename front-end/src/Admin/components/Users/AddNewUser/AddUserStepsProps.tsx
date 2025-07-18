// AddUserStepProps.ts

import { SelectChangeEvent } from "@mui/material";
import { IAddUserFormData } from "../UsersDto";

export interface UserDetailsStepProps {
  data: IAddUserFormData;
  onUserChange: (key: keyof IAddUserFormData["userData"]) => (e: React.ChangeEvent<any>) => void;
  setData: React.Dispatch<React.SetStateAction<IAddUserFormData>>;
}

export interface StepBankDetailsProps {
  data: IAddUserFormData;
  onFieldChange: React.ChangeEventHandler<HTMLInputElement>;
}
export interface PaymentMethodStepProps {
  data: IAddUserFormData;
  onFieldChange: (e: SelectChangeEvent<string>) => void}

