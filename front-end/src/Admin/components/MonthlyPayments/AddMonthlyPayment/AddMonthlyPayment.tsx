// src/components/AddPaymentModal.tsx
import React, { useState } from "react";
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
import { AppDispatch, RootState } from "../../../../store/store";
import { setMonthlyPaymentModalMode } from "../../../../store/features/Main/AppMode";
import { paymentMethod } from "../MonthlyPaymentsDto";
import SelectAllUsers from "../../SelectUsers/SelectAllUsers";
import { createMonthlyPayment } from "../../../../store/features/admin/adminMonthlyPayments";
import { payment_method } from "../../Users/UsersDto";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RtlProvider } from "../../../../Theme/rtl";

export const AddPaymentModal: React.FC = () => {
  const open = useSelector(
    (s: RootState) => s.mapModeSlice.MonthlyPaymentModalMode
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const [newPayment, setNewPayment] = useState<{
    userId: number;
    amount: number;
    depositDate: string;
    method: payment_method;
    description: string;
  }>({
    userId: 0,
    amount: 0,
    depositDate: today,
    method: paymentMethod[0].value as payment_method,
    description: "",
  });

  const handleClose = () => {
    dispatch(setMonthlyPaymentModalMode(false));
  };

  const handleSubmit = () => {
    const payload = {
      user: newPayment.userId,
      amount: newPayment.amount,
      deposit_date: newPayment.depositDate,
      payment_method: newPayment.method,
      description: newPayment.description,
    };
    const promise = dispatch(createMonthlyPayment(payload)).unwrap();

    toast.promise(
      promise,
      {
        pending: "מוסיף תשלום חדש…",
        success: "התשלום נוסף בהצלחה! 👌",
        error: "שגיאה בהוספת התשלום 💥",
      },
      { autoClose: 3000 }
    );

    promise
      .then(() => {
        handleClose();
        navigate("/paymentsPage");
      })
      .catch(() => {
        // שגיאה כבר הודגמה ב-toast
      });
  };

  return (
      <RtlProvider>

    <Dialog
      open={!!open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      dir="rtl"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          bgcolor: "#e8f5e9",
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          bgcolor: "green",
          color: "#fff",
          py: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, m: 0 }}>
          הוספת הוראת קבע חדשה
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 4, pt: 3, pb: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, textAlign: "center" }}
        >
          אנא מלא/י את כל השדות המסומנים בכוכבית
        </Typography>

        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <SelectAllUsers
            value={newPayment.userId}
            onChange={(id) => setNewPayment((p) => ({ ...p, userId: id }))}
            label="בחר משתמש*"
            color="success"
          />

          <TextField
            label="סכום (₪)*"
            size="medium"
            color="success"
            fullWidth
            value={newPayment.amount}
            onChange={(e) =>
              setNewPayment((p) => ({
                ...p,
                amount: +e.target.value,
              }))
            }
          />

          <TextField
            label="תאריך*"
            type="date"
            size="medium"
            fullWidth
            color="success"
            InputLabelProps={{ shrink: true }}
            value={newPayment.depositDate}
            onChange={(e) =>
              setNewPayment((p) => ({
                ...p,
                depositDate: e.target.value,
              }))
            }
          />

          <FormControl fullWidth size="small">
            <InputLabel
              id="method-label"
              sx={{
                color: "success.main",
                "&.Mui-focused": { color: "success.dark" },
              }}
            >
              אמצעי תשלום
            </InputLabel>
            <Select
            size="medium"
              labelId="method-label"
              value={newPayment.method}
              label="אמצעי תשלום*"
              color="success"
              onChange={(e) =>
                setNewPayment((p) => ({
                  ...p,
                  method: e.target.value as payment_method,
                }))
              }
            >
              {paymentMethod.map((pm) => (
                <MenuItem key={pm.value} value={pm.value} dir="rtl">

                  {pm.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="הערות"
            size="small"
            fullWidth
            color="success"
            multiline
            minRows={3}
            value={newPayment.description}
            onChange={(e) =>
              setNewPayment((p) => ({
                ...p,
                description: e.target.value,
              }))
            }
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 4,
          pb: 3,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            newPayment.userId === 0 ||
            newPayment.amount <= 0 ||
            !newPayment.method
          }
          sx={{
            bgcolor: "green",
            color: "#fff",
            px: 3,
            py: 1,
            borderRadius: 2,
            "&:hover": { bgcolor: "#115293" },
          }}
        >
          הוסף הוראת קבע
        </Button>
          <Button onClick={handleClose}>ביטול</Button>
      </DialogActions>
    </Dialog>
      </RtlProvider>

  );
};
