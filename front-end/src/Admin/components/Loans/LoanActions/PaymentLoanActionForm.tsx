// src/components/LoanActions/PaymentForm.tsx
import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { ICreateLoanAction, LoanPaymentActionType } from "../LoanDto";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";

interface Props {
  loanId: number;
  onSubmit: (dto: ICreateLoanAction) => void;
  maxAmount : number;
  initialDate?: string;
  initialAmount?: number;
}

 const PaymentForm: React.FC<Props> = ({
  loanId,
  onSubmit,
  maxAmount,
  initialDate,
  initialAmount,
}) => {
  const loanDetails = useSelector((s: RootState) => s.AdminLoansSlice.loanDetails);

  const [amount, setAmount] = useState<number | string>("");
  const [date, setDate]     = useState<string>("");

  React.useEffect(() => {
    if (initialDate !== undefined) setDate(initialDate);
    if (initialAmount !== undefined) setAmount(initialAmount);
  }, [initialDate, initialAmount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =   Number (e.target.value);
    if(value > maxAmount) return toast.error("הסכום המקסימלי הוא " + maxAmount);
    setAmount(value);
  }
  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedDate = new Date(e.target.value);
    const loanDate = new Date(loanDetails?.loan_date!);
    if (selectedDate < loanDate) {
      toast.error(
        "תאריך התשלום לא יכול להיות לפני תאריך תחילת ההלוואה"
      );
      return;
    }
    setDate(e.target.value);
  };
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
    toast.success("התשלום נשלח בהצלחה");
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
        onChange={handleDateChange}
        size="small"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="סכום תשלום"
        value={amount}
        fullWidth
        InputProps={{ inputProps: { min: 0, max: maxAmount } }}
        onChange={handleAmountChange}
        size="small"
        type="number"
        // sx={{ minWidth: 120 }}
      />

      <Button
      sx={{bgcolor: isValid ? "#113E21" : "grey.500" }}
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
