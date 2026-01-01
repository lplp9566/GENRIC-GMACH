import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { createInitialInvestment } from "../../../store/features/admin/adminInvestmentsSlice";
import { RtlThemeProvider } from "../../../Theme/rtl";

interface NewInvestmentProps {
  open: boolean;
  onClose: () => void;
}

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const NewInvestment = ({ open, onClose }: NewInvestmentProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const availableInvestment = useSelector(
    (s: RootState) => s.AdminFundsOverviewReducer.fundsOverview?.available_funds
  );

  const [newInvestment, setNewInvestment] = useState({
    amount: 0,
    investment_name: "",
    start_date: today,
    company_name: "",
    investment_portfolio_number: "",
    investment_by: "",
  });

  const onFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewInvestment((prev) => ({ ...prev, [name]: value }));
  };

  const isValid = useMemo(() => {
    if (!newInvestment.investment_name.trim()) return false;
    if (!newInvestment.company_name.trim()) return false;
    if (!newInvestment.start_date) return false;

    const amount = Number(newInvestment.amount);
    if (!amount || amount <= 0) return false;

    if (
      typeof availableInvestment === "number" &&
      amount > availableInvestment
    )
      return false;

    return true;
  }, [newInvestment, availableInvestment]);

  const handleSubmit = async () => {
    const amount = Number(newInvestment.amount);

    if (amount <= 0) {
      toast.error("אנא הזן סכום השקעה תקין.");
      return;
    }
    if (
      typeof availableInvestment === "number" &&
      amount > availableInvestment
    ) {
      toast.error(
        `הסכום שהוזן גבוה מהקרן הזמינה להשקעה: ${availableInvestment} ש"ח`
      );
      return;
    }

    onClose();

    toast.promise(
      dispatch(
        createInitialInvestment({
          ...newInvestment,
          amount,
          start_date: new Date(newInvestment.start_date),
        })
      ),
      {
        pending: "מוסיף השקעה...",
        success: "השקעה נוצרה בהצלחה! 👌",
        error: "שגיאה ביצירת ההשקעה 💥",
      },
      { autoClose: 3000 }
    );
  };

  return (
    <RtlThemeProvider>
      <Dialog
      disableScrollLock 
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        dir="rtl"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            overflow: "hidden",
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
            יצירת השקעה חדשה
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 4, pt: 3, pb: 2 }}>
          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{ display: "flex", flexDirection: "column", gap: 3}}
          >
<Typography variant="body1" sx={{ fontWeight: 700 }}>
          </Typography>

            <TextField
              label="סכום השקעה (₪)*"
              name="amount"
              type="number"
              size="medium"
              color="success"
              fullWidth
              value={newInvestment.amount}
              onChange={onFieldChange}
              inputProps={{ min: 0 }}
              sx={{
                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                  { WebkitAppearance: "none", margin: 0 },
                "& input[type=number]": { MozAppearance: "textfield" },
              }}
            />

            <TextField
              label="שם השקעה*"
              name="investment_name"
              size="medium"
              color="success"
              fullWidth
              value={newInvestment.investment_name}
              onChange={onFieldChange}
            />

            <TextField
              label="תאריך התחלה*"
              name="start_date"
              type="date"
              size="medium"
              color="success"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newInvestment.start_date || today}
              onChange={onFieldChange}
            />

            <TextField
              label="שם החברה*"
              name="company_name"
              size="medium"
              color="success"
              fullWidth
              value={newInvestment.company_name}
              onChange={onFieldChange}
            />

            <TextField
              label="מספר תיק השקעה"
              name="investment_portfolio_number"
              size="medium"
              color="success"
              fullWidth
              value={newInvestment.investment_portfolio_number}
              onChange={onFieldChange}
            />

            <TextField
              label="הושקע דרך"
              name="investment_by"
              size="medium"
              color="success"
              fullWidth
              value={newInvestment.investment_by}
              onChange={onFieldChange}
            />

            {typeof availableInvestment === "number" && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", mt: -1 }}
              >
                קרן זמינה להשקעה: {availableInvestment} ₪
              </Typography>
            )}
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
            disabled={!isValid}
            sx={{
              bgcolor: "green",
              color: "#fff",
              px: 3,
              py: 1,
              borderRadius: 2,
              "&:hover": { bgcolor: "#115293" },
            }}
          >
            אישור
          </Button>

          <Button onClick={onClose}>ביטול</Button>
        </DialogActions>
      </Dialog>
    </RtlThemeProvider>
  );
};

export default NewInvestment;
