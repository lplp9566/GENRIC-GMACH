import {
  Box,
  Button,
  Card,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { RtlProvider } from "../../../Theme/rtl";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { createInitialInvestment } from "../../../store/features/admin/adminInvestmentsSlice";
interface NewInvestmentProps {
  open: boolean;
  onClose: () => void;
}
const NewInvestment = ({ open, onClose }: NewInvestmentProps) => {
  const GREEN_MAIN = "#0b5e29";
  // const GREEN_LIGHT = "#e8f5e9";
  const GREEN_DARK = "#094a20";
  const today = new Date().toISOString().split("T")[0];
    const dispatch = useDispatch<AppDispatch>();

  const [newInvestment, setNewInvestment] = useState({
    amount: 0,
    investment_name: "",  
    start_date: today,
    company_name: "",
    investment_portfolio_number: "",
    investment_by: "",
  });
  const availableInvestment = useSelector((s:RootState)=> s.AdminFundsOverviewReducer.fundsOverview?.available_funds)
  const onFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewInvestment((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (newInvestment.amount <= 0) {
      toast.error("אנא הזן סכום השקעה תקין.");
      return;

    } 
    if(newInvestment.amount > availableInvestment!){
      toast.error(`הסכום שהוזן גבוה מהקרן הזמינה להשקעה: ${availableInvestment} ש"ח`);
      return;
    }
    onClose();
    toast.promise(
      dispatch(createInitialInvestment({ ...newInvestment, start_date: new Date(newInvestment.start_date) })),
      {
        pending: "מוסיף השקעה...",
        success: "השקעה נוצרה בהצלחה! 👌",
        error: "שגיאה ביצירת ההשקעה 💥",
      },
      { autoClose: 3000 }
    );
  }
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginTop: "5%",
          justifyContent: "center",
          p: 2,
          // בלי minHeight: "100vh"
        }}
      >
        <Card
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: { xs: "100%", sm: 600 },
            p: 4,
            borderRadius: 4,
            boxShadow: 6,
            bgcolor: "#fff",
          }}
        >
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700, color: GREEN_MAIN }}
          >
            יצירת השקעה חדשה
          </Typography>
          <RtlProvider>
            <Stack spacing={2}>
              <TextField
                label="סכום השקעה"
                name="amount"
                value={newInvestment.amount}
                onChange={onFieldChange}
                fullWidth
                dir="rtl"
              />
              <TextField
                label="שם השקעה"
                name="investment_name"
                value={newInvestment.investment_name}
                onChange={onFieldChange}
                fullWidth
                dir="rtl"
              />
              <TextField
                label=" תאריך התחלה"
                name="start_date"
                type="date"
                value={newInvestment.start_date || today}
                onChange={onFieldChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                dir="rtl"
              />
              <TextField
                label=" שם החברה"
                name="company_name"
                value={newInvestment.company_name}
                onChange={onFieldChange}
                fullWidth
                dir="rtl"
              />
              <TextField
                label="מספר תיק השקעה"
                name="investment_portfolio_number"
                inputProps={{ min: 1, max: 28 }}
                value={newInvestment.investment_portfolio_number}
                onChange={onFieldChange}
                fullWidth
                dir="rtl"
              />
                    <TextField
                label="הושקע דרך "
                name="investment_by"
                value={newInvestment.investment_by}
                onChange={onFieldChange}
                fullWidth
                dir="rtl"
              />
            </Stack>
          </RtlProvider>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 3,
            }}
          >
            <Button
              variant="contained"
              type="submit"
              sx={{
                textTransform: "none",
                bgcolor: GREEN_MAIN,
                "&:hover": { bgcolor: GREEN_DARK },
              }}
            >
              אישור
            </Button>
            <Button type="button" onClick={onClose}>
              ביטול
            </Button>
          </Box>
        </Card>
      </Box>
    </Modal>
  );
};


export default NewInvestment;
