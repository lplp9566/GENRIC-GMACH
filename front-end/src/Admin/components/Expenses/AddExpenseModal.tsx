import { FC, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { AppDispatch, RootState } from "../../../store/store";
import { RtlThemeProvider } from "../../../Theme/rtl";

// ✅ thunks מהסלייס שלך
import {
  createExpense,
  getAllExpenses,
  getAllExpensesCategory,
} from "../../../store/features/admin/adminExpensesSlice";

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
}

const AddExpenseModal: FC<AddExpenseModalProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const allExpensesCategory = useSelector(
    (s: RootState) => s.AdminExpensesSlice.allExpensesCategory
  );

  const categories = useMemo(
    () => (Array.isArray(allExpensesCategory) ? allExpensesCategory : []),
    [allExpensesCategory]
  );

  const [categoryId, setCategoryId] = useState<number | "">("");
  const [amount, setAmount] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState<string>(today);
  const [note, setNote] = useState<string>("");

  // טעינה/איפוס בעת פתיחה
  useEffect(() => {
    if (!open) return;

    dispatch(getAllExpensesCategory());

    // איפוס
    setCategoryId("");
    setAmount(0);
    setExpenseDate(today);
    setNote("");
  }, [open, dispatch]);

  const isValid = useMemo(() => {
    if (!categoryId) return false;
    if (!expenseDate) return false;
    if (amount <= 0) return false;
    return true;
  }, [categoryId, expenseDate, amount]);

  const handleSubmit = async () => {
    // בהתאם ל-Entity שלך: Expense.category הוא Relation.
    // הכי נכון לשלוח category_id כדי שהשרת יקשר לקטגוריה.
    const payload = {
      amount,
      expenseDate,         // "YYYY-MM-DD"
      note: note?.trim() || null,
      category_id: Number(categoryId), // ✅ מומלץ בצד שרת לקבל category_id
    };

    try {
      await toast.promise(dispatch(createExpense(payload as any)).unwrap(), {
        pending: "מוסיף הוצאה...",
        success: "ההוצאה נוספה בהצלחה!",
        error: "אירעה שגיאה בעת הוספת ההוצאה.",
      });

      // רענון רשימה (לא חובה, אבל שימושי)
      dispatch(getAllExpenses());

      onClose();
    } catch {
      // toast כבר מציג error
    }
  };

  return (
    <RtlThemeProvider>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        dir="rtl"
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
        }}
      >
        <DialogTitle
          component="div"
          sx={{ bgcolor: "error.main", color: "#fff", py: 2, textAlign: "center" }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, m: 0 }}>
            הוספת הוצאה חדשה
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 4, pt: 3, pb: 2 }}>
          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            {/* קטגוריה */}
            <FormControl fullWidth size="small">
              <InputLabel id="cat-label">קטגוריה*</InputLabel>
              <Select
                labelId="cat-label"
                value={categoryId}
                label="קטגוריה*"
                size="medium"
                onChange={(e) => setCategoryId(e.target.value as any)}
                disabled={!categories.length}
              >
                {categories.map((c: any) => (
                  <MenuItem key={c.id} value={c.id} dir="rtl">
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* תאריך */}
            <TextField
              label="תאריך*"
              type="date"
              size="medium"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />

            {/* סכום */}
            <TextField
              label="סכום (₪)*"
              type="number"
              size="medium"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              inputProps={{ min: 0 }}
              sx={{
                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                  WebkitAppearance: "none",
                  margin: 0,
                },
                "& input[type=number]": { MozAppearance: "textfield" },
              }}
            />

            {/* הערה */}
            <TextField
              label="הערה"
              size="medium"
              fullWidth
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
              minRows={2}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{ px: 4, pb: 3, display: "flex", justifyContent: "space-between" }}
        >
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isValid}
            sx={{
              bgcolor: "#2a8c82",
              color: "#fff",
              px: 3,
              py: 1,
              borderRadius: 2,
              "&:hover": { bgcolor: "#276f54" },
            }}
          >
            הוסף הוצאה
          </Button>
          <Button onClick={onClose}>ביטול</Button>
        </DialogActions>
      </Dialog>
    </RtlThemeProvider>
  );
};

export default AddExpenseModal;
