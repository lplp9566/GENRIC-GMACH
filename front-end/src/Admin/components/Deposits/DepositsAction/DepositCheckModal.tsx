// src/components/Deposits/BringForwardModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../../../../store/store";
import { bringForwardCheck } from "../../../../store/features/admin/adminDepositsSlice";

type Props = {
  open: boolean;
  depositId: number;
  newReturnDate: string; // "YYYY-MM-DD"
  onClose: () => void;
  handleSubmit: () => Promise<void>;

};

const BringForwardModal: React.FC<Props> = ({
  open,
  depositId,
  newReturnDate,
  onClose,
  handleSubmit
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { depositCheckStatus, depositCheck } = useSelector(
    (s: RootState) => s.AdminDepositsSlice
  );

  const [approveLoading, setApproveLoading] = useState(false);

  const displayDate = useMemo(() => {
    const d = new Date(newReturnDate);
    return Number.isNaN(d.getTime()) ? newReturnDate : d.toLocaleDateString("he-IL");
  }, [newReturnDate]);

  // כשנפתח/משתנה תאריך → בדיקה מחדש
  useEffect(() => {
    if (!open) return;
    // dispatch(clearDepositCheck());
    if (!newReturnDate) return;

    // שליחת בדיקה לשרת
    dispatch(bringForwardCheck({ depositId, newReturnDate }));
  }, [open, depositId, newReturnDate, dispatch]);

  // ניקוי סטייט כשנסגר
  useEffect(() => {
    if (!open) {
      setApproveLoading(false);

    }
  }, [open, dispatch]);

const approve = () => {
    onClose();
    handleSubmit()
7  };

  const isChecking = depositCheckStatus === "pending";
  const canApprove = depositCheckStatus === "fulfilled" && depositCheck.ok;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { direction: "rtl" } }}
    >
      <DialogTitle sx={{ direction: "rtl" }}>הקדמת פיקדון</DialogTitle>

      <DialogContent sx={{ direction: "rtl" }}>
        {isChecking && (
          <Box display="flex" alignItems="center" gap={2} py={2}>
            <CircularProgress size={24} />
            <Typography>בודק זמינות עד {displayDate}…</Typography>
          </Box>
        )}

        {!isChecking && canApprove && (
          <Box py={1}>
            <Typography variant="subtitle1" fontWeight={700} color="success.main">
              אפשר להקדים את תאריך ההחזר ל־{displayDate}.
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              לאשר את ההקדמה? הפעולה תשנה את תאריך הפדיון ותתועד במערכת.
            </Typography>
          </Box>
        )}

        {!isChecking && !canApprove && (
          <Box py={1}>
            <Typography variant="subtitle1" fontWeight={700} color="error.main">
              לא ניתן להקדים.
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {depositCheck.error || "אין מספיק מזומן לפי התזרים הצפוי."}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ direction: "rtl" }}>
        <Button onClick={onClose} disabled={approveLoading}>
          ביטול
        </Button>

        {canApprove && (
          <Button
            onClick={() => approve()}
            variant="contained"
            disabled={approveLoading}
          >
            {approveLoading ? "מאשר…" : "אישור"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BringForwardModal;
