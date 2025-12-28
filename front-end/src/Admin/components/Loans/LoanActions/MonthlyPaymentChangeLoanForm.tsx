// src/components/LoanActions/MonthlyPaymentChangeForm.tsx
import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { ICreateLoan, ICreateLoanAction, LoanPaymentActionType } from "../LoanDto";
import { AppDispatch, RootState } from "../../../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { setLoanModalMode } from "../../../../store/features/Main/AppMode";
import CheckLoanModal from "../CheckLoanModal";
import { toast } from "react-toastify";

interface Props {
  loanId: number;
  onSubmit: (dto: ICreateLoanAction) => void;
}

const MonthlyPaymentChangeLoanForm: React.FC<Props> = ({
  loanId,
  onSubmit,
}) => {
    const dispatch = useDispatch<AppDispatch>();
  const [monthly, setMonthly] = useState<number | "">(0);
  const [date, setDate] = useState<string>("");
    const { LoanModalMode } = useSelector(
      (state: RootState) => state.mapModeSlice
    );
  const Loan = useSelector((state: RootState) => state.AdminLoansSlice.allLoans.find((loan) => loan.id === loanId));
    const loanDetails = useSelector((s: RootState) => s.AdminLoansSlice.loanDetails);
  
  const isValid = monthly !== "" && date !== "";
  if (!Loan) return null;
  const newLoan: ICreateLoan = {
    loan_amount: Loan.remaining_balance,
    loan_date: Loan.loan_date,
    purpose: Loan.purpose,
    monthly_payment: Number(monthly),
    payment_date: Loan.payment_date,
    user: Loan.user.id,
  }
  const dto: ICreateLoanAction = {
    action_type: LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE,
    date: date,
    loanId,
    value: Number(monthly),
  }
    const handleDateChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const selectedDate = new Date(e.target.value);
      const loanDate = new Date(loanDetails?.loan_date!);
      if (selectedDate < loanDate) {
        toast.error(
          "תאריך הפעולה לא יכול להיות לפני תאריך תחילת ההלוואה"
        );
        return;
      }
      setDate(e.target.value);
    };
  const handle = () => {
    if (!isValid) return;
  dispatch(setLoanModalMode(true))
  };

  return (
    <Box>
            {LoanModalMode && (
        <CheckLoanModal
          onClose={() => dispatch(setLoanModalMode(false))}
          loan={newLoan}
          type="update"
         dto={dto}
         onSubmit={() => onSubmit(dto)}
        />
      )}
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
        onChange={handleDateChange}
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
        type="number"
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
        </Box>

  );
};
export default MonthlyPaymentChangeLoanForm;
