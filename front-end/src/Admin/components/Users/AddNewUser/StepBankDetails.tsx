import React from "react";
import { Box, TextField } from "@mui/material";
import { PaymentStepProps } from "./AddUserStepsProps";

const StepBankDetails: React.FC<PaymentStepProps> = ({ data, onPaymentChange }) => (
  <Box display="grid" gap={2} mb={2}>
    <TextField label="מספר בנק" value={data.paymentData.bank_number} onChange={onPaymentChange("bank_number")} fullWidth dir="rtl" />
    <TextField label="סניף" value={data.paymentData.bank_branch} onChange={onPaymentChange("bank_branch")} fullWidth  dir="rtl"/>
    <TextField label="מספר חשבון" value={data.paymentData.bank_account_number} onChange={onPaymentChange("bank_account_number")} fullWidth dir="rtl"/>
  </Box>
);

export default StepBankDetails;
