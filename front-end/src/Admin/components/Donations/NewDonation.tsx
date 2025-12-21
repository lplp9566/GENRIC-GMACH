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
import { RtlProvider } from "../../../Theme/rtl";
import SelectAllUsers from "../SelectUsers/SelectAllUsers";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { useNavigate } from "react-router-dom";
import {
  setAddDonationDraft,
  setAddDonationModal,
} from "../../../store/features/Main/AppMode";
import {
  createDonation,
  getAllFunds, // ✅ חדש
} from "../../../store/features/admin/adminDonationsSlice";
import { DonationActionType, ICreateDonation } from "./DonationDto";
import { toast } from "react-toastify";

type DonationKind = "regular" | "fund";

const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

const AddDonationModal: React.FC = () => {
  const [userId, setUserId] = useState<number>();
  const [kind, setKind] = useState<DonationKind>("regular");
  const [fundName, setFundName] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(today);

  const open = useSelector((s: RootState) => s.mapModeSlice.AddDonationModal);
  const draft = useSelector((s: RootState) => s.mapModeSlice.AddDonationDraft);

  const funds = useSelector(
    (s: RootState) => s.AdminDonationsSlice.fundDonation
  ); // ✅

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    dispatch(getAllFunds());

    if (draft) {
      setUserId(draft.userId);
      setKind(draft.kind ?? "regular");
      setFundName(draft.fundName ?? "");
      setAmount(draft.amount ?? 0);
      setDate(draft.date ?? today);
    } else {
      // פתיחה רגילה (איפוס)
      setUserId(undefined);
      setKind("regular");
      setFundName("");
      setAmount(0);
      setDate(today);
    }
  }, [open, draft, dispatch]);

  const fundNames = useMemo<string[]>(() => {
    if (!Array.isArray(funds)) return [];
    return funds.map((f: any) => String(f?.name ?? "").trim()).filter(Boolean);
  }, [funds]);

  // אם עברנו ל"תרומה רגילה" – ננקה בחירת קרן
  useEffect(() => {
    if (kind === "regular") setFundName("");
  }, [kind]);

  // אם הקרן שנבחרה לא קיימת יותר – ננקה
  useEffect(() => {
    if (fundName && fundNames.length && !fundNames.includes(fundName)) {
      setFundName("");
    }
  }, [fundNames, fundName]);
  useEffect(() => {
    if (!open) return;

    if (draft) {
      setUserId(draft.userId);
      setKind(draft.kind ?? "regular");
      setFundName(draft.fundName ?? "");
      setAmount(draft.amount ?? 0);
      setDate(draft.date ?? today);
    }
  }, [open, draft]);

  // ולידציה בסיסית
  const isValid = useMemo(() => {
    if (!userId || amount <= 0) return false;
    if (kind === "fund" && !fundName.trim()) return false;
    if (!date) return false;
    return true;
  }, [userId, amount, kind, fundName, date]);

  const handleSubmit = async () => {
    const payload: ICreateDonation = {
      user: userId!,
      amount,
      date,
      action: DonationActionType.donation,
      donation_reason: kind === "regular" ? "Equity" : fundName.trim(), // ✅ תאימות
    };
    toast.promise(dispatch(createDonation(payload)), {
      pending: "התרומה נשלחה בהצלחה",
      success: "התרומה נשלחה בהצלחה",
      error: "שגיאה בשליחת התרומה",
    });
    navigate("/donations");
    handleClose();
  };

  const handleClose = () => {
    dispatch(setAddDonationDraft(null));
    dispatch(setAddDonationModal(false));
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
            הוספת תרומה חדשה
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 4, pt: 3, pb: 2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, textAlign: "center" }}
          >
            אנא מלא/י את השדות הנדרשים
          </Typography>

          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            {/* בחירת משתמש */}
            <SelectAllUsers
              filter="all"
              value={userId}
              onChange={(id) => setUserId(id)}
              label="בחר משתמש*"
              color="success"
            />

            {/* סוג תרומה: רגיל / קרן */}
            <FormControl fullWidth size="small">
              <InputLabel
                id="kind-label"
                sx={{
                  color: "success.main",
                  "&.Mui-focused": { color: "success.dark" },
                }}
              >
                סוג תרומה*
              </InputLabel>
              <Select
                size="medium"
                labelId="kind-label"
                value={kind}
                label="סוג תרומה*"
                color="success"
                onChange={(e) => setKind(e.target.value as DonationKind)}
              >
                <MenuItem value="regular">תרומה רגילה</MenuItem>
                <MenuItem value="fund">תרומה לקרן</MenuItem>
              </Select>
            </FormControl>

            {/* ✅ בחירת קרן (רק אם נבחר "קרן") */}
            {kind === "fund" && (
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
                  labelId="fund-label"
                  value={fundName}
                  label="קרן*"
                  color="success"
                  size="medium"
                  onChange={(e) => setFundName(String(e.target.value))}
                >
                  {fundName && !fundNames.includes(fundName) && (
                    <MenuItem value={fundName} dir="rtl">
                      {fundName}
                    </MenuItem>
                  )}

                  {fundNames.map((name) => (
                    <MenuItem key={name} value={name} dir="rtl">
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

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
              onChange={(e) => setAmount( Number(e.target.value))}
              inputProps={{ min: 0 }}
              sx={{
                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                  {
                    WebkitAppearance: "none",
                    margin: 0,
                  },
                "& input[type=number]": {
                  MozAppearance: "textfield",
                },
              }}
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
            הוסף תרומה
          </Button>
          <Button onClick={handleClose}>ביטול</Button>
        </DialogActions>
      </Dialog>
    </RtlProvider>
  );
};

export default AddDonationModal;
