// src/components/Loans/StepBasicDetails.tsx
import React from "react";
import { Stack, TextField } from "@mui/material";
import SelectAllUsers from "../../SelectUsers/SelectAllUsers";

interface StepBasicDetailsProps {
  newLoan: {
    user: number;
    loan_amount: number;
    purpose: string;
    loan_date: string;
    monthly_payment: number;
    payment_date: number;
  };
  selectedUserId: number;
  allUsers: { id: number; first_name: string; last_name: string }[];
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUserChange: (id: number) => void;
}

const StepBasicDetails: React.FC<StepBasicDetailsProps> = ({
  newLoan,
  selectedUserId,
  onFieldChange,
  onUserChange,
}) => {
  const today = new Date().toISOString().split("T")[0];
  return (
    <Stack spacing={2}>
      <SelectAllUsers
        label="בחר משתמש"
        value={selectedUserId || newLoan.user}
        onChange={onUserChange}
      />
      <TextField
        label="סכום הלוואה"
        name="loan_amount"
        value={newLoan.loan_amount}
        onChange={onFieldChange}
        fullWidth
        dir="rtl"
      />
      <TextField
        label="מטרה"
        name="purpose"
        value={newLoan.purpose}
        onChange={onFieldChange}
        fullWidth
        dir="rtl"
      />
      <TextField
        label="תאריך הלוואה"
        name="loan_date"
        type="date"
        value={newLoan.loan_date || today}
        onChange={onFieldChange}
        InputLabelProps={{ shrink: true }}
        fullWidth
        dir="rtl"
      />
      <TextField
        label="תשלום חודשי"
        name="monthly_payment"
        value={newLoan.monthly_payment}
        onChange={onFieldChange}
        fullWidth
        dir="rtl"
      />
      <TextField
        label="יום תשלום"
        name="payment_date"
        inputProps={{ min: 1, max: 28 }}
        value={newLoan.payment_date}
        onChange={onFieldChange}
        fullWidth
        dir="rtl"
      />
    </Stack>
  );
};

export default StepBasicDetails;
