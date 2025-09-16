import React, { useMemo, useState } from "react";
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
import { setAddDonationModal } from "../../../store/features/Main/AppMode";
import { createDonation } from "../../../store/features/admin/adminDonationsSlice";
import { DonationActionType, ICreateDonation } from "./DonationDto";

type DonationKind = "regular" | "fund";

export type NewDonationPayload = {
  user: number;
  amount: number;
  donation_reason: string; // תמיד קיים: "equally" לתרומה רגילה, או שם הקרן
  action: "donation";
  date: Date; // תמיד "donation"
};

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   onSubmit: (payload: NewDonationPayload) => void; // dispatch ל-API אצלך
//   defaultUserId?: number;
// };

const AddDonationModal: React.FC = () => {
  const [userId, setUserId] = useState<number>();
  const [kind, setKind] = useState<DonationKind>("regular");
  const [fundName, setFundName] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const open = useSelector((s: RootState) => s.mapModeSlice.AddDonationModal);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  // ולידציה בסיסית
  const isValid = useMemo(() => {
    if (!userId || amount <= 0) return false;
    if (kind === "fund" && !fundName.trim()) return false;
    return true;
  }, [userId, amount, kind, fundName]);

  const handleSubmit = () => {
    const payload: ICreateDonation = {
      user: userId!,
      amount,
      date: new Date(),
      action: DonationActionType.donation,
      donation_reason: kind === "regular" ? "Equity" : fundName.trim(),
    };
    dispatch(createDonation(payload));
    navigate("/donations");
    handleClose();
  };

  const handleClose = () => {
    dispatch(setAddDonationModal(false));
  };

  return (
    <RtlProvider>
      <Dialog
        open={open!}
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

            {/* שם קרן (נראה רק אם נבחר "קרן") */}
            {kind === "fund" && (
              <TextField
                label="שם הקרן*"
                size="medium"
                color="success"
                fullWidth
                value={fundName}
                onChange={(e) => setFundName(e.target.value)}
              />
            )}

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
            הוסף תרומה
          </Button>
          <Button onClick={handleClose}>ביטול</Button>
        </DialogActions>
      </Dialog>
    </RtlProvider>
  );
};

export default AddDonationModal;
