import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  Typography,
} from "@mui/material";
import { ILoanAction, LoanPaymentActionType } from "../LoanDto";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../store/store";
import { editLoanAction } from "../../../../store/features/admin/adminLoanSlice";
import { toast } from "react-toastify";


function toDateInputValue(dateLike: string | Date) {
  const d = new Date(dateLike);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export type EditLoanActionModalProps = {
  open: boolean;
  action: ILoanAction | null;
  onClose: () => void;
  loanId: number;

  // מחזיר payload לעריכה (אתה תחבר לשרת)
  // אופציונלי - להציג מצב טעינה חיצוני
};

export const EditLoanActionModal: React.FC<EditLoanActionModalProps> = ({
  open,
  action,
  onClose,
    loanId,
}) => {
      const dispatch = useDispatch<AppDispatch>();

  const isPayment = action?.action_type === LoanPaymentActionType.PAYMENT;
  console.log(action);
  
const hendeleSave = async () => {
        onClose();

   toast.promise(dispatch(editLoanAction({
        loanId: loanId,
      id: action!.id,
      date: new Date(date),
      value: value,
    })), {
      pending: "מעדכן פעולה...",
      success: "הפעולה עודכנה בהצלחה!",
      error: "שגיאה בעדכון הפעולה",
    });
    onClose();
  }
  const initialDate = useMemo(
    () => (action ? toDateInputValue(action.date) : ""),
    [action]
  );
  const initialValue = useMemo(() => (action ? Number(action.value) : 0), [action]);

  const [date, setDate] = useState<string>(initialDate);
  const [value, setValue] = useState<number>(initialValue);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setDate(initialDate);
    setValue(initialValue);
    setError("");
  }, [initialDate, initialValue, open]);

//   const validate = () => {
//     if (!action) return "לא נבחרה פעולה לעריכה";
//     if (!date) return "חובה לבחור תאריך";
//     if (!Number.isFinite(value) || value <= 0) return "הסכום חייב להיות גדול מ-0";
//     if (!isPayment) return "כרגע ניתן לערוך רק פעולת תשלום";
//     return "";
//   };


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800, textAlign: "center" }}>
        עריכת פעולה
      </DialogTitle>

      <DialogContent>
        {!action ? (
          <Alert severity="info">בחר פעולה כדי לערוך</Alert>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {!isPayment && (
              <Alert severity="warning">
                כרגע אפשר לערוך רק תשלום. אם תרצה — אוסיף עריכה גם לשאר סוגי הפעולות.
              </Alert>
            )}

            <Typography sx={{ fontWeight: 700 }}>
              מזהה פעולה: {action.id}
            </Typography>

            <TextField
              label="תאריך"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="סכום"
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              fullWidth
              inputProps={{ min: 1, step: 1 }}
            />

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          ביטול
        </Button>
        <Button
          onClick={hendeleSave}
          variant="contained"
          disabled={!action  || !isPayment}
        >
          שמירה
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditLoanActionModal;
