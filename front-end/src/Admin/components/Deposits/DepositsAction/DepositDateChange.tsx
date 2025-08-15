import { Box, Button, TextField } from "@mui/material";
import { useState } from "react";

interface DepositDateChangeProps {
  depositId?: number;
}
const DepositDateChange: React.FC<DepositDateChangeProps> = ({ depositId }) => {
  const [date, setDate] = useState<string>("");
  const [updateDate, setUpdateDate] = useState<string>("");
  const isValid = date !== "" && updateDate !== "";
  const handle = () => {
    if (!isValid) return;
    // Here you would typically dispatch an action or call an API to update the deposit date
    console.log("Updating deposit date:", { depositId, date, updateDate });
    setDate("");
    setUpdateDate("");
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
          }
        }
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
