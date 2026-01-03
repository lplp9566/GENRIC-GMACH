import { FC, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch } from "../../../store/store";
import { RtlThemeProvider } from "../../../Theme/rtl";

// ✅ החלף לשם המדויק אצלך אם שונה
import { CreateExpensesCategory } from "../../../store/features/admin/adminExpensesSlice";

interface AddExpensesCategoryModalProps {
  open: boolean;
  onClose: () => void;
}

const AddExpensesCategoryModal: FC<AddExpensesCategoryModalProps> = ({
  open,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState("");
const onSubmit = async () => {
  try {
    const action = await dispatch(CreateExpensesCategory({ name }));

    if (CreateExpensesCategory.fulfilled.match(action)) {
      toast.success("הקטגוריה נוספה בהצלחה!");
      onClose();
      return;
    }

    const msg =
      (action as any)?.payload ||
      (action as any)?.error?.message ||
      "אירעה שגיאה בעת הוספת הקטגוריה.";
    toast.error(String(msg));
  } catch (e: any) {
    toast.error(e?.message ?? "אירעה שגיאה בעת הוספת הקטגוריה.");
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
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{ bgcolor: "error.main", color: "#fff", py: 2, textAlign: "center" }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, m: 0 }}>
            הוספת קטגוריית הוצאה
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 4, pt: 3, pb: 2 }} dir="rtl">
          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              marginTop: 2,
            }}
          >
            <TextField
              label="שם קטגוריה *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              dir="rtl"
              variant="outlined"
              size="medium"
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 4,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={onSubmit}
            variant="contained"
            disabled={!name.trim()}
            sx={{
              bgcolor: "#2a8c82",
              color: "#fff",
              "&:hover": { bgcolor: "#276f54" },
              "&.Mui-disabled": { bgcolor: "#c8e6c9", color: "#9e9e9e" },
            }}
          >
            הוסף קטגוריה
          </Button>

          <Button onClick={onClose} sx={{ color: "#2a8c82" }}>
            ביטול
          </Button>
        </DialogActions>
      </Dialog>
    </RtlThemeProvider>
  );
};

export default AddExpensesCategoryModal;
