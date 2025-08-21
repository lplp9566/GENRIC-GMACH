import { Box, Button, TextField } from "@mui/material";
import { useState } from "react";
import { DepositActionsType, IDepositActionCreate } from "../depositsDto";
import { toast } from "react-toastify";

interface DepositDateChangeProps {
  depositId: number;
  handleSubmit?: (dto: IDepositActionCreate) => Promise<void>;
}
const DepositDateChange: React.FC<DepositDateChangeProps> = ({
  depositId,
  handleSubmit,
}) => {
  const [date, setDate] = useState<string>("");
  const [updateDate, setUpdateDate] = useState<string>("");
  const isValid = date !== "" && updateDate !== "";
  const handle = async () => {
    if (!isValid) return;
    const dto: IDepositActionCreate = {
      deposit: depositId,
      action_type: DepositActionsType.ChangeReturnDate,
      date,
      update_date: updateDate,
    };
    try {
      await handleSubmit?.(dto);
      toast.success("הפעולה נשמרה בהצלחה");
      setDate("");
      setUpdateDate("");
    } catch (err: any) {
      toast.error(err?.message ?? "אירעה שגיאה בשמירת הפעולה");
    }
    // Here you would typically dispatch an action or call an API to update the deposit date
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
        onChange={(e) => {
          setDate(e.target.value);
        }}
        size="small"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="יום החיוב בחודש "
        value={updateDate}
        fullWidth
        type="date"
        InputLabelProps={{ shrink: true }}
        onChange={(e) => {
          setUpdateDate(e.target.value);
        }}
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

export default DepositDateChange;
