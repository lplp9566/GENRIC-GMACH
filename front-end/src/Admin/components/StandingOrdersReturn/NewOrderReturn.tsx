// src/components/AddStandingOrderRefundModal.tsx
import React, { useState } from "react";
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
import SelectAllUsers from "../SelectUsers/SelectAllUsers";
// import { RtlProvider } from "../../../Theme/rtl";
import { toast } from "react-toastify";
import { AppDispatch } from "../../../store/store";
import { useDispatch } from "react-redux";
import { createOrderReturn } from "../../../store/features/admin/adminStandingOrderReturt";
import { RtlThemeProvider } from "../../../Theme/rtl";

interface AddStandingOrderRefundModalProps {
  open: boolean;
  onClose: () => void;
//   onSubmit: (data: {
//     userId: number;
//     amount: number;
//     date: string;
//     notes: string;
//   }) => void;
}

export const AddStandingOrderRefundModal: React.FC<
  AddStandingOrderRefundModalProps
> = ({ open, onClose }) => {
  const today = new Date().toISOString().slice(0, 10);
  const dispatch = useDispatch<AppDispatch>();

  const [form, setForm] = useState({
    userId: 0,
    amount: 0,
    date: today,
    note: "",
  });

  const handleSubmit = () => {
    try {
        toast.promise (
        dispatch(
            createOrderReturn(
                form
        )
        ).unwrap(),
        {
            pending: "ממתין...",
            success: "ההוראה נוספה בהצלחה! 👌",
            error: "שגיאה בהוספת ההוראה 💥"
            },
        )


    } catch (error) {
        
    }
    onClose();
  };

  const isDisabled = form.userId === 0 || form.amount <= 0;

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
            borderRadius: 4,
            boxShadow: "0 12px 30px rgba(0,0,0,0.16)",
            // bgcolor: "#e8f5e9",
          },
        }}
      >
        {/* כותרת */}
        <DialogTitle
          sx={{
            bgcolor: "green",
            color: "#fff",
            py: 2.5,
            textAlign: "center",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            הוספת החזר הוראת קבע
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 4, pt: 3 }}>
          <Box display="flex" flexDirection="column" gap={3} sx={{
                p: 2,
                // borderRadius: 3,
                // border: "1px solid #c8e6c9",
              }}>
            {/* משתמש */}
          
              <SelectAllUsers
                value={form.userId}
                onChange={(id) =>
                  setForm((p) => ({ ...p, userId: id }))
                }
                label="בחר משתמש*"
                color="success"
                filter="members"
              />

            {/* סכום */}
            <TextField
              label="סכום (₪)*"
              type="number"
              color="success"
              value={form.amount}
              inputProps={{ min: 0 }}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  amount: Number(e.target.value),
                }))
              }
            />

            {/* תאריך */}
            <TextField
              label="תאריך*"
              type="date"
              color="success"
              InputLabelProps={{ shrink: true }}
              value={form.date}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  date: e.target.value,
                }))
              }
            />

            {/* הערות */}
            <TextField
              label="הערות"
              multiline
              minRows={3}
              color="success"
              value={form.note}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  note: e.target.value,
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
            disabled={isDisabled}
            onClick={handleSubmit}
            sx={{
              bgcolor: "green",
              px: 3,
              borderRadius: 2,
              "&:hover": { bgcolor: "#115293" },
            }}
          >
            הוסף החזר
          </Button>

          <Button onClick={onClose}>ביטול</Button>
        </DialogActions>
      </Dialog>
                </RtlThemeProvider>

    // </RtlProvider>
  );
};
