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
  max: number;
  initialAction?: ICreateLoanAction | null;
}

const toDateInputValue = (dateLike?: string) => {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const Actions: React.FC<ActionsProps> = ({
  loanId,
  handleSubmit,
  max,
  initialAction,
}) => {
  const [mode, setMode] = useState<LoanPaymentActionType>(
    LoanPaymentActionType.PAYMENT
  );

  React.useEffect(() => {
    if (initialAction?.action_type) {
      setMode(initialAction.action_type);
    }
  }, [initialAction]);

  const handleModeChange = (e: SelectChangeEvent) =>
    setMode(e.target.value as LoanPaymentActionType);
  const initialDate = toDateInputValue(initialAction?.date);
  const initialValue = initialAction?.value;
  return (
    <Box dir="rtl">
      <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ textAlign: "center", paddingBottom: 2 }}>
          פעולות להלוואה
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel id="action-select-label">בחר פעולה</InputLabel>
          <Select
            labelId="action-select-label"
            value={mode}
            label="בחר פעולה"
            onChange={handleModeChange}
            sx={{ borderRadius: 1 }}
          >
            <MenuItem value={LoanPaymentActionType.PAYMENT}>
              תשלום הלוואה
            </MenuItem>
            <MenuItem value={LoanPaymentActionType.AMOUNT_CHANGE}>
              הוספת סכום לההלואה
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
          <PaymentLoanActionForm
            loanId={loanId}
            onSubmit={handleSubmit}
            maxAmount={max}
            initialDate={initialDate}
            initialAmount={initialValue}
          />
        )}
        {mode === LoanPaymentActionType.AMOUNT_CHANGE && (
          <AmountChangeLoanForm
            loanId={loanId}
            onSubmit={handleSubmit}
            initialDate={initialDate}
            initialValue={initialValue}
          />
        )}
        {mode === LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE && (
          <MonthlyPaymentChangeLoanForm
            loanId={loanId}
            onSubmit={handleSubmit}
            initialDate={initialDate}
            initialValue={initialValue}
          />
        )}
        {mode === LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE && (
          <DateOfPaymentChangeLoanForm
            loanId={loanId}
            onSubmit={handleSubmit}
            initialDate={initialDate}
            initialValue={initialValue}
          />
        )}
      </Paper>
    </Box>
  );
};

export default Actions;
