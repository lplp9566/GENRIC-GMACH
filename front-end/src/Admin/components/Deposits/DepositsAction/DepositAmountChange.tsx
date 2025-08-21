import { FC, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { IDepositActionCreate, DepositActionsType } from "../depositsDto";

interface IDepositAmountChangeProps {
  depositId: number;
  handleSubmit?: (dto: IDepositActionCreate) => Promise<void>;
}

const DepositAmountChange: FC<IDepositAmountChangeProps> = ({ depositId, handleSubmit }) => {
  const [amountStr, setAmountStr] = useState<string>("");
  const [date, setDate] = useState<string>("");

  const amountNum = amountStr === "" ? NaN : Number(amountStr);
  const isValid = Number.isFinite(amountNum) && amountNum > 0 && !!date;

  const onSubmit = async () => {
    if (!isValid) return;

    const dto: IDepositActionCreate = {
      deposit: depositId,
      action_type: DepositActionsType.AddToDeposit,
      amount: amountNum,
      date,
      update_date: null,
    };

    try {
      await handleSubmit?.(dto);
      toast.success("הפעולה נשמרה בהצלחה");
      setAmountStr("");
      setDate("");
    } catch (err: any) {
      toast.error(err?.message ?? "אירעה שגיאה בשמירת הפעולה");
    }
  };

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      sx={{ mt: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <TextField
        fullWidth
        label="תאריך פעולה"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        size="small"
        InputLabelProps={{ shrink: true }}
      />

      <Typography color="green" variant="subtitle2">
        אנא הכנס את הסכום שברצונך להוסיף להפקדה
      </Typography>

      <TextField
        label="סכום"
        type="number"
        inputMode="numeric"
        value={amountStr}
        onChange={(e) => setAmountStr(e.target.value)}
        size="small"
        fullWidth
        inputProps={{ min: 1 }}
      />

      <Button type="submit" variant="contained" disabled={!isValid} sx={{ bgcolor: isValid ? "green" : "grey.500" }}>
        עדכן
      </Button>
    </Box>
  );
};

export default DepositAmountChange;
