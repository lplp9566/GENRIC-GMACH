// src/components/LoanActions/Actions.tsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { ICreateLoanAction, LoanPaymentActionType } from "../LoanDto";
import PaymentLoanActionForm from "./PaymentLoanActionForm";
import DateOfPaymentChangeLoanForm from "./DateOfPaymentChangeLoanForm";
import MonthlyPaymentChangeLoanForm from "./MonthlyPaymentChangeLoanForm";
import AmountChangeLoanForm from "./AmountChangeLoanForm";

interface ActionsProps {
  loanId: number;
  handleSubmit: (dto: ICreateLoanAction) => void;
  max : number
}

type ActionMode =
  | LoanPaymentActionType.PAYMENT
  | LoanPaymentActionType.AMOUNT_CHANGE
  | LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE
  | LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE;

export const Actions: React.FC<ActionsProps> = ({ loanId ,handleSubmit,max}) => {
  const [mode, setMode] = useState<ActionMode>(LoanPaymentActionType.PAYMENT);

  const handleModeChange = (e: SelectChangeEvent) =>
    setMode(e.target.value as ActionMode);
  return (
    <Box dir="rtl">
      <Paper elevation={2} sx={{ p: 2, borderRadius: 2, backgroundColor: "#FEFEFE"}}>
        <Typography variant="h6" sx={{textAlign:"center", paddingBottom:2}}>פעולות להלוואה</Typography>
        <FormControl fullWidth size="small">
          <InputLabel id="action-select-label">בחר פעולה</InputLabel>
          <Select
            labelId="action-select-label"
            value={mode}
            label="בחר פעולה"
            onChange={handleModeChange}
            sx={{ backgroundColor: "#FFF", borderRadius: 1 }}
          >
            <MenuItem value={LoanPaymentActionType.PAYMENT}>תשלום הלוואה</MenuItem>
            <MenuItem value={LoanPaymentActionType.AMOUNT_CHANGE}>
              שינוי סכום הלוואה
            </MenuItem>
            <MenuItem value={LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE}>
              עדכון תשלום חודשי
            </MenuItem>
            <MenuItem value={LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE}>
              שינוי יום תשלום
            </MenuItem>
          </Select>
        </FormControl>

        {mode === LoanPaymentActionType.PAYMENT && (
          <PaymentLoanActionForm loanId={loanId} onSubmit={handleSubmit} maxAmount={max}/>
        )}
        {mode === LoanPaymentActionType.AMOUNT_CHANGE && (
          <AmountChangeLoanForm loanId={loanId} onSubmit={handleSubmit} />
        )}
        {mode === LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE && (
          <MonthlyPaymentChangeLoanForm loanId={loanId} onSubmit={handleSubmit} />
        )}
        {mode === LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE && (
          <DateOfPaymentChangeLoanForm loanId={loanId} onSubmit={handleSubmit} />
        )}
      </Paper>
    </Box>
  );
};

export default Actions;
