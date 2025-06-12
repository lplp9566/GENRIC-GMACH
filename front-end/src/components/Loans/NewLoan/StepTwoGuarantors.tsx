import React from "react";
import { Stack, TextField, Typography } from "@mui/material";
import SelectAllUsers from "../../SelectUsers/SelectAllUsers";
import { ICreateLoan } from "../LoanDto";

interface StepTwoProps {
  loan: ICreateLoan & { guarantors: number[] };
  setLoan: React.Dispatch<React.SetStateAction<ICreateLoan & { guarantors: number[] }>>;
  numGuarantors: number;
  setNum: React.Dispatch<React.SetStateAction<number>>;
}

export const StepTwoGuarantors: React.FC<StepTwoProps> = ({ setLoan, numGuarantors, setNum }) => {
  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let n = Math.max(0, Math.min(2, Number(e.target.value)));
    setNum(n);
    setLoan(prev => ({ ...prev, guarantors: prev.guarantors.slice(0, n) }));
  };

  const handleGuarantorChange = (idx: number, userId: number) => {
    setLoan(prev => {
      const arr = [...prev.guarantors];
      arr[idx] = userId;
      return { ...prev, guarantors: arr };
    });
  };

  return (
    <Stack spacing={2}>
      <Typography>כמה ערב(ים) להוסיף?</Typography>
      <TextField
        label="מספר ערבויות (0-2)"
        type="number"
        inputProps={{ min: 0, max: 2 }}
        value={numGuarantors}
        onChange={handleNumChange}
        fullWidth
      />
      {Array.from({ length: numGuarantors }).map((_, i) => (
        <SelectAllUsers
          key={i}
          label={`בחר ערב #${i + 1}`}
          onChange={(id: number) => handleGuarantorChange(i, id)}
        />
      ))}
    </Stack>
  );
};
