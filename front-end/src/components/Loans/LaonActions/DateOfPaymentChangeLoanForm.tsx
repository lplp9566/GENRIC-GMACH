// src/components/LoanActions/DateOfPaymentChangeForm.tsx
import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { ICreateLoanAction, LoanPaymentActionType } from "../LoanDto";

interface Props {
  loanId: number;
  onSubmit: (dto: ICreateLoanAction) => void;
}

 const DateOfPaymentChangeLoanForm: React.FC<Props> = ({ loanId, onSubmit }) => {
  const [date, setDate] = useState<string>("");

  const handle = () => {
    onSubmit({
      action_type: LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE,
      date,
      loanId,
      value: 0,
    });
  };

  return (
    <Box sx={{ mt: 2, display: "flex", gap: 2, alignItems: "center" }}>
      <TextField
        label="תאריך חדש"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        size="small"
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <Button variant="contained" onClick={handle}>
        עדכן
      </Button>
    </Box>
  );
};
export default DateOfPaymentChangeLoanForm
