import React from "react";
import { Box, TextField } from "@mui/material";
import { StepBankDetailsProps } from "./AddUserStepsProps";

const numberFieldSx = {
  "& input[type=number]": {
    MozAppearance: "textfield",
  },
  "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
    {
      WebkitAppearance: "none",
      margin: 0,
    },
};

const StepBankDetails: React.FC<StepBankDetailsProps> = ({
  data,
  onFieldChange,
}) => (
  <Box display="grid" gap={2} mb={2}>
    <TextField
      label="מספר בנק"
      type="number"
      name="bank_number"
      value={data.paymentData.bank_number}
      onChange={onFieldChange}
      fullWidth
      dir="rtl"
      sx={numberFieldSx}
    />
    <TextField
      label="סניף"
      type="number"
      name="bank_branch"
      value={data.paymentData.bank_branch}
      onChange={onFieldChange}
      fullWidth
      dir="rtl"
      sx={numberFieldSx}
    />
    <TextField
      label="מספר חשבון"
      type="number"
      name="bank_account_number"
      value={data.paymentData.bank_account_number}
      onChange={onFieldChange}
      fullWidth
      dir="rtl"
      sx={numberFieldSx}
    />
  </Box>
);

export default StepBankDetails;
