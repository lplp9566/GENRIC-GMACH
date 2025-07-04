import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { ICreateLoanAction, LoanPaymentActionType } from "../LoanDto";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";

interface Props {
  loanId: number;
  onSubmit: (dto: ICreateLoanAction) => void;
}

const DateOfPaymentChangeLoanForm: React.FC<Props> = ({ loanId, onSubmit }) => {
  const loanDetails = useSelector(
    (s: RootState) => s.AdminLoansSlice.loanDetails
  );

  const [date, setDate] = useState<string>("");
  const [day, setDay] = useState<number | string>("");

  const handleDayOfPayment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 28 || value < 0)
      return toast.error("אנא הכנס יום תשלום בין 1-28");
    setDay(value);
  };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    const loanDate = new Date(loanDetails?.loan_date!);
    if (selectedDate < loanDate) {
      toast.error("תאריך הפעולה לא יכול להיות לפני תאריך תחילת ההלוואה");
      return;
    }
    setDate(e.target.value);
  };
  const isValid = day !== "" && date !== "";

  const handle = () => {
    if (!isValid) return;
    onSubmit({
      action_type: LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE,
      date,
      loanId,
      value: Number(day),
    });
    setDay("");
    setDate("");
    toast.success("יום התשלום שונה בהצלחה");
  };

  return (
    <Box
      component="form"
      noValidate
      autoCapitalize="off"
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
        label="תאריך הפעולה"
        type="date"
        value={date}
        onChange={handleDateChange}
        size="small"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="יום החיוב בחודש "
        value={day}
        fullWidth
        onChange={handleDayOfPayment}
        size="small"
        // sx={{ minWidth: 120 }}
      />
      <Button
        sx={{ bgcolor: isValid ? "#113E21" : "grey.500" }}
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
export default DateOfPaymentChangeLoanForm;
