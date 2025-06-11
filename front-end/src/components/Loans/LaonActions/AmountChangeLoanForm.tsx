// src/components/LoanActions/AmountChangeForm.tsx
import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { ICreateLoanAction, LoanPaymentActionType } from "../LoanDto";

interface Props {
  loanId: number;
  onSubmit: (dto: ICreateLoanAction) => void;
}

const AmountChangeLoanForm: React.FC<Props> = ({ loanId, onSubmit }) => {
  const [newAmount, setNewAmount] = useState<number | "">("");
  const [date, setDate] = useState<string>("");
  const isValid = newAmount !== "" && date !== "";

  const handle = () => {
    if (!isValid) return;
    onSubmit({
      action_type: LoanPaymentActionType.AMOUNT_CHANGE,
      date: new Date().toISOString(),
      loanId,
      value: Number(newAmount),
    });
    setDate("");
    setNewAmount("");
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
        InputLabelProps={{ shrink: true }}
      />
            <Typography color={"green"} variant="subtitle2">אנא הכנס את הסכום שברצונך להוסיף להלוואה </Typography>
      <TextField
        label="סכום חדש"
        type="number"
        value={newAmount}
        onChange={(e) => setNewAmount(+e.target.value)}
        size="small"
        fullWidth
      />

      <Button
        sx={{ bgcolor: isValid ? "green" : "grey.500" }}
        type="submit"
        variant="contained"
        disabled={!isValid}
      >
        עדכן
      </Button>
    </Box>
  );
};
export default AmountChangeLoanForm;
