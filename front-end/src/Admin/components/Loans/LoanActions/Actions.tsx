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
import { alpha } from "@mui/material/styles";
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
    <Box
      dir="rtl"
      sx={(theme) => ({
        bgcolor:
          theme.palette.mode === "dark"
            ? "#0f172a"
            : theme.palette.background.paper,
        borderRadius: "42px",
        border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 28px 70px rgba(2,6,23,0.7)"
            : "0 20px 44px rgba(15,23,42,0.14)",
        overflow: "hidden",
        p: 3,
      })}
    >
          <Box
            sx={(theme) => ({
              mx: -3,
              mt: -3,
              mb: 3,
              py: 2.2,
              borderRadius: "32px 32px 18px 18px",
              textAlign: "center",
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(180deg, #1f8f45 0%, #17823b 100%)"
                  : "linear-gradient(180deg, #219963 0%, #1a8a56 100%)",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: 0.2,
            })}
          >
            פעולות להלוואה
          </Box>
          {shouldShowLoanSelect && resolvedLoanOptions.length > 0 && (
            <FormControl
              fullWidth
              size="small"
              sx={(theme) => ({
                mb: 2,
                "& .MuiInputLabel-root": { color: theme.palette.text.secondary },
              })}
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
              sx={(theme) => ({
                borderRadius: 999,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(15, 23, 42, 0.6)"
                    : theme.palette.background.paper,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha(theme.palette.divider, 0.7),
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.success.main,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.success.main,
                },
              })}
            >
              {resolvedLoanOptions.map((loan) => (
                <MenuItem key={loan.id} value={loan.id}>
                  {`הלוואה #${loan.id} • ${loan.user.first_name} ${loan.user.last_name}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <FormControl fullWidth size="small">
          <InputLabel id="action-select-label">בחר פעולה</InputLabel>
          <Select
            labelId="action-select-label"
            value={mode}
            label="בחר פעולה"
            onChange={handleModeChange}
            sx={(theme) => ({
              borderRadius: 999,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(15, 23, 42, 0.6)"
                  : theme.palette.background.paper,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: alpha(theme.palette.divider, 0.7),
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.success.main,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.success.main,
              },
            })}
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
    </Box>
  );
};

export default Actions;
