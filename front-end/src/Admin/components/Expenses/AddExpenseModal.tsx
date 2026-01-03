// AddExpenseModal.tsx
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
import {
  createExpense,
  getAllExpenses,
  getAllExpensesCategory,
} from "../../../store/features/admin/adminExpensesSlice";

const today = new Date().toISOString().slice(0, 10);

export type AddExpenseDraft = {
  categoryId?: number | null;
  amount?: number;
  expenseDate?: string; // YYYY-MM-DD
  note?: string;
};

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  draft?: AddExpenseDraft | null; // ✅ חדש
}

const AddExpenseModal: FC<AddExpenseModalProps> = ({ open, onClose, draft }) => {
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

  // ✅ בעת פתיחה: טוען קטגוריות + ממלא לפי draft אם קיים
  useEffect(() => {
    if (!open) return;

    dispatch(getAllExpensesCategory());

    if (draft) {
      setCategoryId(draft.categoryId ?? "");
      setAmount(draft.amount ?? 0);
      setExpenseDate(draft.expenseDate ?? today);
      setNote(draft.note ?? "");
    } else {
      setCategoryId("");
      setAmount(0);
      setExpenseDate(today);
      setNote("");
    }
  }, [open, draft, dispatch]);

  // ✅ אם draft כולל categoryId אבל הקטגוריות נטענות מאוחר יותר
  // ונגמר במצב שה-id לא קיים ברשימה - ננקה כדי שלא יישאר ערך "תקוע"
  useEffect(() => {
    if (!open) return;
    if (!categoryId) return;
    if (!categories.length) return;

    const exists = categories.some((c: any) => Number(c?.id) === Number(categoryId));
    if (!exists) setCategoryId("");
  }, [open, categoryId, categories]);

  const isValid = useMemo(() => {
    if (!categoryId) return false;
    if (!expenseDate) return false;
    if (amount <= 0) return false;
    return true;
  }, [categoryId, expenseDate, amount]);

  const handleSubmit = async () => {
    const payload = {
      amount,
      expenseDate,
      note: note?.trim() || null,
      category_id: Number(categoryId),
    };

    try {
      await toast.promise(dispatch(createExpense(payload as any)).unwrap(), {
        pending: "מוסיף הוצאה...",
        success: "ההוצאה נוספה בהצלחה!",
        error: "אירעה שגיאה בעת הוספת ההוצאה.",
      });

      dispatch(getAllExpenses());
      onClose();
    } catch {
      // toast כבר מציג
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
            <Typography></Typography>
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

            <TextField
              label="תאריך*"
              type="date"
              size="medium"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />

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
