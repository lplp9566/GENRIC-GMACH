import React from "react";
import { Stack, TextField } from "@mui/material";
import SelectAllUsers from "../../SelectUsers/SelectAllUsers";
import { ICreateLoan } from "../LoanDto";

interface StepOneFormProps {
  loan: ICreateLoan & { guarantors: number[] };
  setLoan: React.Dispatch<React.SetStateAction<ICreateLoan & { guarantors: number[] }>>;
}

export const StepOneForm: React.FC<StepOneFormProps> = ({ loan, setLoan }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoan(prev => ({
      ...prev,
      [name]: name === "purpose" || name === "loan_date" ? value : Number(value),
    }));
  };

  return (
    <Stack spacing={2}>
      <SelectAllUsers
        label="בחר משתמש"
        onChange={(id: number) => setLoan(prev => ({ ...prev, user: id }))}
      />
      <TextField
        label="סכום הלוואה"
        name="loan_amount"
        type="number"
        value={loan.loan_amount}
        onChange={handleChange}
        fullWidth
        required
      />
      <TextField
        label="מטרה"
        name="purpose"
        value={loan.purpose}
        onChange={handleChange}
        fullWidth
        required
      />
      <TextField
        label="תאריך הלוואה"
        name="loan_date"
        type="date"
        value={loan.loan_date}
        onChange={handleChange}
        fullWidth
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        label="תשלום חודשי"
        name="monthly_payment"
        type="number"
        value={loan.monthly_payment}
        onChange={handleChange}
        fullWidth
        required
      />
      <TextField
        label="יום תשלום חודשי (1-31)"
        name="payment_date"
        type="number"
        inputProps={{ min: 1, max: 31 }}
        value={loan.payment_date}
        onChange={handleChange}
        fullWidth
        required
      />
    </Stack>
  );
};
