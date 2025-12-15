import { FC, useState } from "react";
import { RtlProvider } from "../../../../Theme/rtl";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Typography,
} from "@mui/material";
import SelectAllUsers from "../../SelectUsers/SelectAllUsers";
import { AppDispatch, RootState } from "../../../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ICreateDeposits } from "../depositsDto";
import { setAddDepositModal } from "../../../../store/features/Main/AppMode";
import { toast } from "react-toastify";
import { createDeposit } from "../../../../store/features/admin/adminDepositsSlice";

const NewDepositModal: FC = () => {
  const open = useSelector((s: RootState) => s.mapModeSlice.AddDepositModal);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const handleClose = () => dispatch(setAddDepositModal(false));

  // שמות השדות תואמים ל-API (snake_case) והטיפוסים מחרוזות תאריך
  const [newDeposit, setNewDeposit] = useState<ICreateDeposits>({
    user: 0,
    initialDeposit: 0,
    start_date: today,
    end_date: today,
  });

  const isValid =
    newDeposit.user > 0 &&
    newDeposit.initialDeposit > 0 &&
    !!newDeposit.start_date &&
    !!newDeposit.end_date;

  const handleSubmit = () => {
    if (!isValid) return;

    const payload: ICreateDeposits = { ...newDeposit }; // תואם בדיוק לאינטרפייס

    const promise = dispatch(createDeposit(payload)).unwrap();

    toast.promise(
      promise,
      {
        pending: "מוסיף הפקדה חדשה…",
        success: `הוספת הפקדה של ${newDeposit.initialDeposit.toLocaleString()} ₪ בוצעה בהצלחה`,
        error: "שגיאה בהוספת ההפקדה 💥",
      },
      { autoClose: 3000 }
    );

    promise
      .then(() => {
        handleClose();
        navigate("/deposits"); // עדכן לנתיב הנכון אצלך
      })
      .catch(() => {});
  };

  return (
    <RtlProvider>
      <Dialog open={!!open} onClose={handleClose} fullWidth maxWidth="sm" dir="rtl"
        PaperProps={{ sx: { borderRadius: 3, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", bgcolor: "#e8f5e9" } }}>
        <DialogTitle component="div" sx={{ bgcolor: "green", color: "#fff", py: 2, textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, m: 0 }}>
            הוספת הפקדה חדשה
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 4, pt: 3, pb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
            אנא מלא/י את כל השדות המסומנים בכוכבית
          </Typography>

          <Box component="form" noValidate autoComplete="off"
               sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <SelectAllUsers
            filter="all"
              value={newDeposit.user}
              onChange={(id) => setNewDeposit((p) => ({ ...p, user: id }))}
              label="בחר משתמש*"
              color="success"
            />

            <TextField
              label="סכום (₪)*"
              size="medium"
              color="success"
              fullWidth
              inputMode="numeric"
              value={newDeposit.initialDeposit}
              onChange={(e) => setNewDeposit((p) => ({
                ...p,
                initialDeposit: Number(e.target.value) || 0,
              }))}
            />

            <TextField
              label="תאריך הפקדה*"
              type="date"
              size="medium"
              fullWidth
              color="success"
              InputLabelProps={{ shrink: true }}
              value={newDeposit.start_date}
              onChange={(e) => setNewDeposit((p) => ({ ...p, start_date: e.target.value }))}
            />

            <TextField
              label="תאריך החזרה*"
              type="date"
              size="medium"
              fullWidth
              color="success"
              InputLabelProps={{ shrink: true }}
              value={newDeposit.end_date}
              onChange={(e) => setNewDeposit((p) => ({ ...p, end_date: e.target.value }))}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 4, pb: 3, display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isValid}
            sx={{ bgcolor: "green", color: "#fff", px: 3, py: 1, borderRadius: 2, "&:hover": { bgcolor: "#115293" } }}
          >
            הוסף הפקדה
          </Button>
          <Button onClick={handleClose}>ביטול</Button>
        </DialogActions>
      </Dialog>
    </RtlProvider>
  );
};

export default NewDepositModal;
