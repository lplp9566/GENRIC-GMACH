// Steps/PaymentMethodStep.tsx
import React from "react";
import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { payment_method } from "../UsersDto";
import { PaymentStepProps } from "./AddUserStepsProps";


const PaymentMethodStep: React.FC<PaymentStepProps> = ({ data, onPaymentChange }) => (
  <Box display="grid" gap={2} mb={2}>
    <TextField
    dir="rtl"
      label="תאריך חיוב"
      InputLabelProps={{ shrink: true }}
      value={data.paymentData.charge_date}
      onChange={onPaymentChange("charge_date")}
      fullWidth
    />
    <FormControl fullWidth>
      <InputLabel>אופן תשלום</InputLabel>
      <Select
      dir="rtl"
        value={data.paymentData.payment_method}
        label="אופן תשלום"
        onChange={()=> onPaymentChange("payment_method")}
      >
        <MenuItem dir="rtl" value={payment_method.direct_debit}>הוראת קבע</MenuItem>
        <MenuItem dir="rtl" value={payment_method.cash}>מזומן</MenuItem>
        <MenuItem dir="rtl"  value={payment_method.credit_card}>אשראי</MenuItem>
        <MenuItem dir="rtl" value={payment_method.bank_transfer}>העברה בנקאית</MenuItem>
        <MenuItem dir="rtl" value={payment_method.other}>אחר</MenuItem>
      </Select>
    </FormControl>
  </Box>
);

export default PaymentMethodStep;
