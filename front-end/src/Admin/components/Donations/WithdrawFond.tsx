// src/Admin/components/Donations/WithdrawFundModal.tsx
import React, { useEffect, useMemo, useState } from "react";
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
import { AppDispatch, RootState } from "../../../store/store";
import { RtlProvider } from "../../../Theme/rtl";
import {
  withdrawDonation,
  getAllFunds, // ✅ חדש
} from "../../../store/features/admin/adminDonationsSlice";
import { DonationActionType, ICreateDonation } from "./DonationDto";
import { useNavigate } from "react-router-dom";
import { setWithdrawDonationModal } from "../../../store/features/Main/AppMode";
import { toast } from "react-toastify";

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const WithdrawFundModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const open = useSelector((s: RootState) => s.mapModeSlice.withdrawDonationModal);

  // ✅ קרנות מתוך ה-store החדש
  const funds = useSelector((s: RootState) => s.AdminDonationsSlice.fundDonation);

  // שדות
  const [fundName, setFundName] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(today);

  // ✅ משיכת קרנות כשמודאל נפתח
  useEffect(() => {
    if (open) {
      dispatch(getAllFunds());
    }
  }, [open, dispatch]);

  // ✅ רשימת שמות הקרנות מהטבלה
  const fundNames = useMemo<string[]>(() => {
    if (!Array.isArray(funds)) return [];
    return funds
      .map((f: any) => String(f?.name ?? "").trim())
      .filter(Boolean);
  }, [funds]);

  // אם הקרן שנבחרה כבר לא קיימת ברשימה – ננקה
  useEffect(() => {
    if (fundName && fundNames.length && !fundNames.includes(fundName)) {
      setFundName("");
    }
  }, [fundNames, fundName]);

  const isValid = useMemo(() => {
    return !!fundName && amount > 0 && !!date;
  }, [fundName, amount, date]);

  const onClose = () => {
    dispatch(setWithdrawDonationModal(false));
  };

  const handleSubmit = async () => {
    const payload: ICreateDonation = {
      amount,
      date,
      action: DonationActionType.withdraw,
      donation_reason: fundName.trim(), // ✅ עדיין שולחים שם קרן (תאימות)
    };
    toast.promise(dispatch(withdrawDonation(payload)), {
      pending: "משיכת כסף מקרן...",
      success: "הכסף נשלח בהצלחה",
      error: "שגיאה בשליחת הכסף",
    })

    onClose();
    navigate("/donations");
  };

  return (
    <RtlProvider>
      <Dialog
        open={!!open}
        onClose={onClose}
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
          sx={{ bgcolor: "green", color: "#fff", py: 2, textAlign: "center" }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, m: 0 }}>
            משיכת כספים מקרן
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 4, pt: 3, pb: 2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, textAlign: "center" }}
          >
            בחר/י קרן, סכום ותאריך
          </Typography>

          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            {/* קרן */}
            <FormControl fullWidth size="small">
              <InputLabel
                id="fund-label"
                sx={{
                  color: "success.main",
                  "&.Mui-focused": { color: "success.dark" },
                }}
              >
                קרן*
              </InputLabel>

              <Select
                disabled={!fundNames.length}
                onChange={(e) => setFundName(String(e.target.value))}
                value={fundName}
                labelId="fund-label"
                label="קרן*"
                color="success"
                size="medium"
              >
                {fundNames.map((name) => (
                  <MenuItem key={name} value={name} dir="rtl">
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* תאריך */}
            <TextField
              label="תאריך*"
              type="date"
              size="medium"
              color="success"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            {/* סכום */}
            <TextField
              label="סכום (₪)*"
              type="number"
              size="medium"
              color="success"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(+e.target.value)}
              inputProps={{ min: 0, step: "0.5" }}
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
            משוך מהקרן
          </Button>
          <Button onClick={onClose}>ביטול</Button>
        </DialogActions>
      </Dialog>
    </RtlProvider>
  );
};

export default WithdrawFundModal;
