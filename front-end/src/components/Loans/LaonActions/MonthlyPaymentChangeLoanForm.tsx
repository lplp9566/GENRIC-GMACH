// src/components/LoanActions/MonthlyPaymentChangeForm.tsx
import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { ICreateLoanAction, LoanPaymentActionType } from "../LoanDto";

interface Props {
  loanId: number;
  onSubmit: (dto: ICreateLoanAction) => void;
}

const MonthlyPaymentChangeLoanForm: React.FC<Props> = ({
  loanId,
  onSubmit,
}) => {
  const [monthly, setMonthly] = useState<number | "">(0);
  const [date, setDate] = useState<string>("");
  const isValid = monthly !== "" && date !== "";

  const handle = () => {
    if (!isValid) return;
    onSubmit({
      action_type: LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE,
      date: new Date().toISOString(),
      loanId,
      value: Number(monthly),
    });
    setMonthly("");
    setDate("");
  };

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      sx={{
        mt: 2,
        display: "flex",
        gap: 2,
        alignItems: "center",
        flexWrap: "wrap",
      }}
      onSubmit={(e) => {
        e.preventDefault();
        handle();
      }}
    >
      <TextField
        fullWidth
        label="תאריך תשלום"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        size="small"
        sx={{ minWidth: 150 }}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="תשלום חודשי חדש"
        value={monthly}
        onChange={(e) => setMonthly(+e.target.value)}
        size="small"
        fullWidth
      />

      <Button
        sx={{ bgcolor: isValid ? "green" : "grey.500" }}
        fullWidth
        variant="contained"
        type="submit"
        disabled={!isValid}
      >
        עדכן
      </Button>
    </Box>
  );
};
export default MonthlyPaymentChangeLoanForm;
