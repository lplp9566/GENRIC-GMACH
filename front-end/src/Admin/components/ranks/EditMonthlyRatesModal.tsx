import { FC, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { AppDispatch } from "../../../store/store";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { updateMembershipRank } from "../../../store/features/admin/adminRankSlice";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultAmount: number;
  defaultDate: string; 
  id:number
}

const EditMonthlyRatesModal: FC<Props> = ({
  open,
  onClose,
  defaultAmount,
  defaultDate,
  id
}) => {
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [date, setDate] = useState<string>(defaultDate);
      const dispatch = useDispatch<AppDispatch>();

  const submit = async () => {
    onClose();
    toast.promise(
      dispatch(
        updateMembershipRank({
          id,
          amount,
          effective_from: date
        })
      ).unwrap(),
      {
        pending: "מעדכן תרומה... ",
        success: "התרומה עודכנה בהצלחה! 👌",
        error: "שגיאה בעדכון התרומה 💥",
      }
    )
  };
console.log(date);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" sx={{ direction: "rtl" }}>
      <DialogTitle>עריכת סכום חודשי</DialogTitle>

      <DialogContent>
        <Stack spacing={2} pt={1}>
          <TextField
            type="number"
            label="סכום חודשי"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            fullWidth
          />

          <TextField
            type="date"
            label="תאריך תחולה"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          ביטול
        </Button>

        <Button onClick={submit} variant="contained" color="primary">
          שמירה
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMonthlyRatesModal;
