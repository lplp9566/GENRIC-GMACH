// src/components/LoanActions/AmountChangeForm.tsx
import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import {
  ICreateLoan,
  ICreateLoanAction,
  LoanPaymentActionType,
} from "../LoanDto";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { setLoanModalMode } from "../../../store/features/Main/AppMode";
import CheckLoanModal from "../NewLoan/CheckLoanModal";

interface Props {
  loanId: number;
  onSubmit: (dto: ICreateLoanAction) => void;
}

const AmountChangeLoanForm: React.FC<Props> = ({ loanId, onSubmit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [newAmount, setNewAmount] = useState<number | "">("");
  const [date, setDate] = useState<string>("");
  const isValid = newAmount !== "" && date !== "";
  const { LoanModalMode } = useSelector(
    (state: RootState) => state.mapModeSlice
  );
  const Loan = useSelector((state: RootState) =>
    state.adminLoansSlice.allLoans.find((loan) => loan.id === loanId)
  );

  if (!Loan) return null;
  const newLoan: ICreateLoan = {
    loan_amount: Loan.remaining_balance + Number(newAmount),
    loan_date: Loan.loan_date,
    purpose: Loan.purpose,
    monthly_payment: Loan.monthly_payment,
    payment_date: Loan.payment_date,
    user: Loan.user.id,
  };
  const dto: ICreateLoanAction = {
    action_type: LoanPaymentActionType.AMOUNT_CHANGE,
    date: date,
    loanId,
    value: Number(newAmount),
  };
  const handle = () => {
    if (!isValid) return;
  dispatch(setLoanModalMode(true))
    // setDate("");
    // setNewAmount("");
  };

  return (
    <Box>
      {LoanModalMode && (
        <CheckLoanModal
          onClose={() => dispatch(setLoanModalMode(false))}
          loan={newLoan}
          type="update"
         dto={dto}
         onSubmit={onSubmit}
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
          onChange={(e) => setDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <Typography color={"green"} variant="subtitle2">
          אנא הכנס את הסכום שברצונך להוסיף להלוואה{" "}
        </Typography>
        <TextField
          label="סכום חדש"
          // type="number"
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
    </Box>
  );
};
export default AmountChangeLoanForm;
