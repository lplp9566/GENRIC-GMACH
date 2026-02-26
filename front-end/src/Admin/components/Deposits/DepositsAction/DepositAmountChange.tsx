import { FC, useEffect, useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { toast } from "react-toastify";
import { IDepositActionCreate, DepositActionsType } from "../depositsDto";

interface IDepositAmountChangeProps {
  depositId: number;
  handleSubmit?: (dto: IDepositActionCreate) => Promise<void>;
  initialDate?: string;
  initialAmount?: number;
  submitLabel?: string;
}

const DepositAmountChange: FC<IDepositAmountChangeProps> = ({
  depositId,
  handleSubmit,
  initialDate,
  initialAmount,
  submitLabel,
}) => {
  const [amountStr, setAmountStr] = useState<string>(
    initialAmount != null && Number.isFinite(initialAmount) ? String(initialAmount) : ""
  );
  const [date, setDate] = useState<string>(initialDate ?? "");

  useEffect(() => {
    setAmountStr(
      initialAmount != null && Number.isFinite(initialAmount) ? String(initialAmount) : ""
    );
    setDate(initialDate ?? "");
  }, [initialDate, initialAmount, depositId]);

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
      if (!handleSubmit) throw new Error("לא הוגדרה פונקציית שליחה");
      await toast.promise(handleSubmit(dto), {
        pending: "שולח...",
        success: `הסכום ${amountNum} ש\"ח נוסף בהצלחה להפקדה`,
        error: "אירעה שגיאה בשמירת הפעולה",
      });
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
      sx={{
        mt: 2,
        display: "flex",
        gap: 2,
        alignItems: "center",
        flexWrap: "wrap",
      }}
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

      <TextField
        label="סכום"
        inputMode="numeric"
        value={amountStr}
        onChange={(e) => setAmountStr(e.target.value)}
        size="small"
        fullWidth
        inputProps={{ min: 1 }}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={!isValid}
        sx={{ bgcolor: isValid ? "green" : "grey.500" }}
      >
        {submitLabel ?? "עדכן"}
      </Button>
    </Box>
  );
};

export default DepositAmountChange;
