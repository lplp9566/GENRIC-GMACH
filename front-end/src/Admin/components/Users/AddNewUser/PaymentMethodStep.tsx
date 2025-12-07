import { FC } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { payment_method_enum } from "../UsersDto";
import { PaymentMethodStepProps } from "./AddUserStepsProps";
const PaymentMethodStep:FC<PaymentMethodStepProps> = ({data,onFieldChange}) => {
  return (
    <Box display="grid" gap={2} mb={2}>
      <FormControl fullWidth dir="rtl">
        <InputLabel id="charge-date-label">תאריך חיוב</InputLabel>
        <Select
          dir="rtl"
          labelId="charge-date-label"
          label="תאריך חיוב"
          name="charge_date"
          value={data.paymentData.charge_date?.toString() || ""}
          onChange={onFieldChange}     
        >
          {Array.from({ length: 28 }, (_, i) => (
            <MenuItem key={i + 1} value={String(i + 1)}>
              {i + 1}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>אופן תשלום</InputLabel>
        <Select
          dir="rtl"
          name="payment_method"
          value={data.paymentData.payment_method}
          label="אופן תשלום"
          onChange={onFieldChange}
        >
          <MenuItem dir="rtl" value={payment_method_enum.direct_debit}>
            הוראת קבע
          </MenuItem>
          <MenuItem dir="rtl" value={payment_method_enum.cash}>
            מזומן
          </MenuItem>
          <MenuItem dir="rtl" value={payment_method_enum.credit_card}>
            אשראי
          </MenuItem>
          <MenuItem dir="rtl" value={payment_method_enum.bank_transfer}>
            העברה בנקאית
          </MenuItem>
          <MenuItem dir="rtl" value={payment_method_enum.other}>
            אחר
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};
export default PaymentMethodStep;
