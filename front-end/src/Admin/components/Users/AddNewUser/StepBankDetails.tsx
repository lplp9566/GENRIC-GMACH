import React from "react";
import { Box, TextField } from "@mui/material";
import {  StepBankDetailsProps } from "./AddUserStepsProps";

const StepBankDetails: React.FC<StepBankDetailsProps> = ({ data,onFieldChange }) => (
  <Box display="grid" gap={2} mb={2}>
    <TextField label="מספר בנק" name="bank_number" value={data.paymentData.bank_number} onChange={onFieldChange} fullWidth dir="rtl" />
    <TextField label="סניף" name="bank_branch" value={data.paymentData.bank_branch} onChange={onFieldChange} fullWidth  dir="rtl"/>
    <TextField label="מספר חשבון" name="bank_account_number" value={data.paymentData.bank_account_number} onChange={onFieldChange} fullWidth dir="rtl"/>
  </Box>
);

export default StepBankDetails;
