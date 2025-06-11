// src/components/LoanActions/PaymentForm.tsx
import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { ICreateLoanAction, LoanPaymentActionType } from "../LoanDto";

interface Props {
  loanId: number;
  onSubmit: (dto: ICreateLoanAction) => void;
}

 const PaymentForm: React.FC<Props> = ({ loanId, onSubmit }) => {
  const [amount, setAmount] = useState<number | "">("");
  const [date, setDate]     = useState<string>("");

  const isValid = amount !== "" && date !== "";

  const handle = () => {
    if (!isValid) return;
    onSubmit({
      action_type: LoanPaymentActionType.PAYMENT,
      date,
      loanId,
      value: Number(amount),
    });
    setAmount("");
    setDate("");
  };

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      sx={{ mt: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}
      onSubmit={(e) => { e.preventDefault(); handle(); }}
    >
      <TextField
      fullWidth
        label="תאריך תשלום"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        size="small"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="סכום תשלום"
        value={amount}
        fullWidth
        onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
        size="small"
        // sx={{ minWidth: 120 }}
      />

      <Button
      sx={{bgcolor: isValid ? "green" : "grey.500" }}
      fullWidth
        type="submit"
        variant="contained"
        disabled={!isValid}
      >
        שלח
      </Button>
    </Box>
  );
};
export default PaymentForm
