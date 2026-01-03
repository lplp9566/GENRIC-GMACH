import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { useState } from "react";

// import { useDispatch } from "react-redux";
// import { AppDispatch } from "../../../store/store";
// import { toast } from "react-toastify";

// TODO: החלף ל-slice/action האמיתי אצלך

import { ExpenseRow } from "./ExpensesTable";

interface EditExpenseModalProps {
  expense: ExpenseRow;
  open: boolean;
  onClose: () => void;
}

const EditExpenseModal = ({ expense, open, onClose }: EditExpenseModalProps) => {
  // const dispatch = useDispatch<AppDispatch>();

  const { amount, date, note } = expense;

  // state עבור העריכה
  const [newAmount, setNewAmount] = useState<number>(Number(amount) || 0);
  const [newDate, setNewDate] = useState<string>(date); // אצלך זה כבר YYYY-MM-DD (כי אנחנו ממירים לפני פתיחת המודאל)
  const [newNote, setNewNote] = useState<string>(note ?? "");

  const handleSubmit = async () => {
    try {
      // toast.promise(
      //   dispatch(
      //     updateExpenseById({
      //       id: Number(id),
      //       amount: newAmount,
      //       expenseDate: newDate, // חשוב: השם כמו בשרת
      //       note: newNote,
      //     })
      //   ).unwrap(),
      //   {
      //     pending: "מעדכן הוצאה...",
      //     success: "ההוצאה עודכנה בהצלחה! 👌",
      //     error: "שגיאה בעדכון ההוצאה 💥",
      //   }
      // );

      onClose();
    } catch (err: any) {
      console.error("Update expense failed:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>עריכת הוצאה</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          {/* סכום */}
          <TextField
            label="סכום הוצאה"
            fullWidth
            value={newAmount}
            onChange={(e) => setNewAmount(Number(e.target.value))}
          />

          {/* תאריך */}
          <TextField
            label="תאריך"
            type="date"
            fullWidth
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {/* הערה */}
          <TextField
            label="הערה"
            fullWidth
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button variant="contained" onClick={handleSubmit}>
          שמירה
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditExpenseModal;
