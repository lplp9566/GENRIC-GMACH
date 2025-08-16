import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";

interface DepositAmountRemoveProps {
  depositId?: number;
  max: number;
}
const DepositAmountRemove: React.FC<DepositAmountRemoveProps> = ({ depositId, max }) => {
  const [amountToRemove, setAmountToRemove] = useState<number | "">("");
  const [date, setDate] = useState<string>("");
  const isValid = amountToRemove !== "" && date !== "";
  const handle = () => {
    if (!isValid) return;
    if (amountToRemove > max) {
      toast.error("הסכום להחזרה לא יכול להיות גדול מהסכום הכולל של ההפקדה");
      return;
    }
    console.log(amountToRemove, date, depositId);
    // Here you would typically dispatch an action or call an API to remove the amount from the deposit
    setAmountToRemove("");
    setDate("");
  }
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
          onChange={(e) => {
            setDate(e.target.value);
          }}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label=" סכום להחזרה"
          // type="number"
          value={amountToRemove}
          onChange={(e) => setAmountToRemove(+e.target.value)}
          size="small"
          fullWidth
        />

        <Button
          sx={{ bgcolor: isValid ? "green" : "grey.500" }}
          onClick={handle}
          variant="contained"
          disabled={!isValid}
        >
          עדכן
        </Button>
      </Box>
  )
}

export default DepositAmountRemove