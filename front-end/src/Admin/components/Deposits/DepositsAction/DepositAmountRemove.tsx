import { Box, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DepositActionsType, IDepositActionCreate } from "../depositsDto";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";

interface DepositAmountRemoveProps {
  depositId: number;
  max: number;
  handleSubmit?: (dto: IDepositActionCreate) => Promise<void>;
  initialDate?: string;
  initialAmount?: number;
  submitLabel?: string;
}

const DepositAmountRemove: React.FC<DepositAmountRemoveProps> = ({
  depositId,
  max,
  handleSubmit,
  initialDate,
  initialAmount,
  submitLabel,
}) => {
  const [amountToRemove, setAmountToRemove] = useState<number | "">(
    initialAmount != null && Number.isFinite(initialAmount) ? Number(initialAmount) : ""
  );
  const [date, setDate] = useState<string>(initialDate ?? "");
  const availableFunds = useSelector(
    (s: RootState) => s.AdminFundsOverviewReducer.fundsOverview?.available_funds
  );

  useEffect(() => {
    setAmountToRemove(
      initialAmount != null && Number.isFinite(initialAmount) ? Number(initialAmount) : ""
    );
    setDate(initialDate ?? "");
  }, [initialDate, initialAmount, depositId]);

  const isValid = amountToRemove !== "" && date !== "";

  const handle = async () => {
    if (!isValid) return;

    if (amountToRemove > max) {
      toast.error("הסכום להחזרה לא יכול להיות גדול מהסכום הכולל של ההפקדה");
      return;
    }

    if (Number(amountToRemove) > Number(availableFunds ?? 0)) {
      toast.error(
        `אתה מבקש להוציא ${amountToRemove} ש\"ח, בעוד שבקרן יש ${availableFunds ?? 0} ש\"ח בלבד`
      );
      return;
    }

    const dto: IDepositActionCreate = {
      deposit: depositId,
      action_type: DepositActionsType.RemoveFromDeposit,
      amount: Number(amountToRemove),
      date,
      update_date: null,
    };

    try {
      if (!handleSubmit) throw new Error("לא הוגדרה פונקציית שליחה");
      await toast.promise(handleSubmit(dto), {
        pending: "שולח...",
        success: `הסכום ${amountToRemove} ש\"ח הוחזר בהצלחה`,
        error: "אירעה שגיאה בשמירת הפעולה",
      });
      setAmountToRemove("");
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
        handle();
      }}
    >
      <TextField
        fullWidth
        label="תאריך החזרה"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        size="small"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="סכום להחזרה"
        value={amountToRemove}
        onChange={(e) => setAmountToRemove(Number(e.target.value))}
        size="small"
        fullWidth
      />

      <Button
        sx={{ bgcolor: isValid ? "green" : "grey.500" }}
        type="submit"
        variant="contained"
        disabled={!isValid}
      >
        {submitLabel ?? "עדכן"}
      </Button>
    </Box>
  );
};

export default DepositAmountRemove;
