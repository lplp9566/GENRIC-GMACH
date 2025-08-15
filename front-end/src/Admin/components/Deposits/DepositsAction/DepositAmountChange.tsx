import{ FC, useState } from 'react'

import { Box, Button, TextField, Typography } from '@mui/material';
import { toast } from 'react-toastify';
interface IDepositAmountChangeProps {
  depositId: number;
}

const DepositAmountChange:FC<IDepositAmountChangeProps> = ({depositId}) => {

    // const dispatch = useDispatch<AppDispatch>();
  const [newAmount, setNewAmount] = useState<number | "">("");
  const [date, setDate] = useState<string>("");
  const isValid = newAmount !== "" && date !== "";
  const handle = () => {
    if (!isValid) return;
    console.log(newAmount, date, depositId);
    
    // setDate("");
    // setNewAmount("");
  };  return (
       <Box>
      
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
          label="תאריך תשלום"
          type="date"
          value={date}
          onChange={(e) => {
            if (new Date(e.target.value) < new Date()) {
               toast.error("נא להזין תאריך עתידי");
              return;
            }
            setDate(e.target.value);
          }}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <Typography color={"green"} variant="subtitle2">
          אנא הכנס את הסכום שברצונך להוסיף להפקדה{" "}
        </Typography>
        <TextField
          label="סכום חדש"
          // type="number"
          value={newAmount}
          onChange={(e) => setNewAmount(+e.target.value)}
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
    </Box>
  )
}

export default DepositAmountChange