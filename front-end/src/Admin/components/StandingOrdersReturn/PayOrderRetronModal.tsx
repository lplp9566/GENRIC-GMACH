// src/components/AddPaymentDateModal.tsx
import React, {  useState } from "react";
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
// import { RtlProvider } from "../../../Theme/rtl";
import { IOrdersReturnDto } from "./ordersReturnDto";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { toast } from "react-toastify";
import { payOrderReturn } from "../../../store/features/admin/adminStandingOrderReturt";
import { RtlThemeProvider } from "../../../Theme/rtl";


interface AddPaymentDateModalProps {
  open: boolean;
  onClose: () => void;
  selectedPayment: IOrdersReturnDto;
  title?: string;  
       // אופציונלי
}

export const AddPaymentDateModal: React.FC<AddPaymentDateModalProps> = ({
  open,
  onClose,
  selectedPayment,
  title = "הוספת תשלום",
}) => {
    const dispatch = useDispatch<AppDispatch>();

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(  today);


  const handleSubmit = async() => {
    await toast.promise(
      dispatch(
        payOrderReturn({
          id:Number(selectedPayment.id),
          paid_at: date,    
        })
      ),
      {
        pending: "ממתין...",
        success: "התשלום נוצר בהצלחה! 👌",
        error: "שגיאה ביצירת התשלום 💥",
      }
    );
    onClose();
  };

  const isDisabled = !date;

  return (
    // <RtlProvider>
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
          <Typography variant="h6" sx={{ fontWeight: 700, m: 0 }}>
            {title}
          </Typography>
        </DialogTitle>
          
        <DialogContent sx={{ px: 4, pt: 3, pb: 2 ,}}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 ,marginTop:2}}>
            <TextField
              label="תאריך*"
              type="date"
              size="medium"
              fullWidth
              color="success"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
            disabled={isDisabled}
            sx={{
              bgcolor: "green",
              color: "#fff",
              px: 3,
              py: 1,
              borderRadius: 2,
              "&:hover": { bgcolor: "#115293" },
            }}
          >
            הוסף
          </Button>

          <Button onClick={onClose}>ביטול</Button>
        </DialogActions>
      </Dialog>
              </RtlThemeProvider>

  );
};
