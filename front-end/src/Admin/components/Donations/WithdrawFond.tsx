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
} from "../../../store/features/admin/adminDonationsSlice";
import { DonationActionType, ICreateDonation } from "./DonationDto";
import { useNavigate } from "react-router-dom";
import { setWithdrawDonationModal } from "../../../store/features/Main/AppMode";

// type Props = {
//   open: boolean;
//   onClose: () => void;
// };

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const WithdrawFundModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // קרנות מתוך ה־store
  const rawFundDetails = useSelector(
    (s: RootState) => s.AdminFundsOverviewReducer.fundsOverview?.fund_details
  );
  const open = useSelector(
    (s: RootState) => s.mapModeSlice.withdrawDonationModal
  );

  // שדות
  const [fundName, setFundName] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(today);
  // הפקת שמות הקרנות (גמיש לשמות שדה שונים)
const fundNames = useMemo<string[]>(() => {
  if (!rawFundDetails) return [];
//   if (Array.isArray(rawFundDetails)) {
//     // במידה ויום אחד זה יחזור כמערך של אובייקטים – תשאיר את הגיבוי
//     return rawFundDetails
//       .map((f: any) => f?.name ?? f?.fund_name ?? f?.donation_reason ?? f?.key ?? "")
//       .filter(Boolean);
//   }
  if (typeof rawFundDetails === "object") {
    // עכשיו: זה המצב שלך – אובייקט: { "קרן X": 241, "קרן Y": 68 }
    return Object.keys(rawFundDetails).map(String);
  }
  return [];
}, [rawFundDetails]);

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
      donation_reason: fundName.trim(), // שם הקרן
    };

    await dispatch(withdrawDonation(payload));
    onClose();
    navigate("/donations");
  };
useEffect(() => {
  console.log("fund_details:", rawFundDetails);
}, [rawFundDetails]);


  return (
    <RtlProvider>
      <Dialog
        open={open!}
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
              <Select disabled={!fundNames.length} onChange={(e) => setFundName(e.target.value)} value={fundName} labelId="fund-label" label="קרן*" color="success" size="medium" >
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
