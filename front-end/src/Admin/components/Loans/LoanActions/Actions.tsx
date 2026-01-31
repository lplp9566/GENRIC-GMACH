import React, { useMemo, useState } from "react";
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
import { useSelector } from "react-redux";
import { ICreateLoanAction, ILoanWithUser, LoanPaymentActionType } from "../LoanDto";
import { RootState } from "../../../../store/store";
import PaymentLoanActionForm from "./PaymentLoanActionForm";
import DateOfPaymentChangeLoanForm from "./DateOfPaymentChangeLoanForm";
import MonthlyPaymentChangeLoanForm from "./MonthlyPaymentChangeLoanForm";
import AmountChangeLoanForm from "./AmountChangeLoanForm";

interface ActionsProps {
  loanId: number;
  handleSubmit: (dto: ICreateLoanAction) => void;
  max: number;
  initialAction?: ICreateLoanAction | null;
  loanOptions?: ILoanWithUser[];
  selectedLoanId?: number;
  onLoanChange?: (loanId: number) => void;
  showLoanSelect?: boolean;
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
  loanOptions,
  selectedLoanId,
  onLoanChange ,
  showLoanSelect,
}) => {
  const allLoans = useSelector((s: RootState) => s.AdminLoansSlice.allLoans);
  const resolvedLoanOptions = useMemo<ILoanWithUser[]>(
    () => (loanOptions ?? allLoans ?? []).filter((loan) => loan.isActive),
    [loanOptions, allLoans]
  );
  const shouldShowLoanSelect = showLoanSelect ?? true;
  const [mode, setMode] = useState<LoanPaymentActionType>(
    LoanPaymentActionType.PAYMENT
  );
  const [loanIdLocal, setLoanIdLocal] = useState<number>(
    selectedLoanId ?? loanId
  );

  React.useEffect(() => {
    if (initialAction?.action_type) {
      setMode(initialAction.action_type);
    }
  }, [initialAction]);
  React.useEffect(() => {
    setLoanIdLocal(selectedLoanId ?? loanId);
  }, [selectedLoanId, loanId]);

  const handleModeChange = (e: SelectChangeEvent) =>
    setMode(e.target.value as LoanPaymentActionType);
  const initialDate = toDateInputValue(initialAction?.date);
  const initialValue = initialAction?.value;
  const submitWithLoan = (dto: ICreateLoanAction) =>
    handleSubmit({ ...dto, loanId: loanIdLocal });
  return (
    <Box dir="rtl">
      <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
        {shouldShowLoanSelect && resolvedLoanOptions.length > 0 && (
          <FormControl
            fullWidth
            size="small"
            sx={{
              mb: 2,
              "& .MuiInputLabel-root": { color: "text.secondary" },
            }}
          >
            <InputLabel id="loan-select-label">מספר הלוואה</InputLabel>
            <Select
              labelId="loan-select-label"
              value={loanIdLocal}
              label="מספר הלוואה"
              onChange={(e) => {
                const nextId = Number(e.target.value);
                setLoanIdLocal(nextId);
                onLoanChange?.(nextId);
              }}
              sx={{
                borderRadius: 3,
                backgroundColor: "rgba(15, 23, 42, 0.25)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(148, 163, 184, 0.25)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(148, 163, 184, 0.5)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(96, 165, 250, 0.8)",
                },
              }}
            >
              {resolvedLoanOptions.map((loan) => (
                <MenuItem key={loan.id} value={loan.id}>
                  {`הלוואה #${loan.id} • ${loan.user.first_name} ${loan.user.last_name}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
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
            loanId={loanIdLocal}
            onSubmit={submitWithLoan}
            maxAmount={max}
            initialDate={initialDate}
            initialAmount={initialValue}
          />
        )}
        {mode === LoanPaymentActionType.AMOUNT_CHANGE && (
          <AmountChangeLoanForm
            loanId={loanIdLocal}
            onSubmit={submitWithLoan}
            initialDate={initialDate}
            initialValue={initialValue}
          />
        )}
        {mode === LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE && (
          <MonthlyPaymentChangeLoanForm
            loanId={loanIdLocal}
            onSubmit={submitWithLoan}
            initialDate={initialDate}
            initialValue={initialValue}
          />
        )}
        {mode === LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE && (
          <DateOfPaymentChangeLoanForm
            loanId={loanIdLocal}
            onSubmit={submitWithLoan}
            initialDate={initialDate}
            initialValue={initialValue}
          />
        )}
      </Paper>
    </Box>
  );
};

export default Actions;
