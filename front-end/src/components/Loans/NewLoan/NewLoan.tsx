// src/components/Loans/NewLoanForm.tsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import { ICreateLoan } from "../LoanDto";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SelectAllUsers from "../../SelectUsers/SelectAllUsers";
import {
  FieldStack,
  FormCard,
  HeaderAvatar,
  RootContainer,
} from "./NewLoanStyle";
import { toast } from "react-toastify";
import CheckLoanModal from "./CheckLoanModal";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { setLoanModalMode } from "../../../store/features/Main/AppMode";

const NewLoanForm: React.FC = () => {
  const theme = useTheme();
  const today = new Date().toISOString().split("T")[0];
  const [newLoan, setNewLoan] = useState<ICreateLoan>({
    loan_amount: 0,
    purpose: "",
    loan_date: today,
    monthly_payment: 0,
    payment_date: 1,
    user: 0,
  });
    const dispatch = useDispatch<AppDispatch>();
  const {LoanModalMode}= useSelector((state: RootState) => state.mapModeSlice);
  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewLoan((prev) => ({
      ...prev,
      [name]:
        name === "purpose"
          ? value
          : name === "loan_date"
          ? value 
          : Number(value),
    }));
  };

  const handleUserChange = (userId: number) => {
    setNewLoan((prev) => ({ ...prev, user: userId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newLoan.user === 0) {
      toast.warn("אנא בחר משתמש ");
      return;
    }
    if (newLoan.loan_amount <= 0) {
      toast.warn("סכום הלוואה חייב להיות גדול מ-0");
      return;
    }
    if (newLoan.monthly_payment <= 0) {
      toast.warn("תשלום חודשי חייב להיות גדול מ-0");
      return;
    }
    if (newLoan.loan_date === "") {
      toast.warn("אנא בחר תאריך הלוואה");
      return;
    }
    if (newLoan.purpose === "") {
      toast.warn("אנא מלא מטרה להלוואה");
      return;
    }
    dispatch(setLoanModalMode(true))
  };

  return (
    <RootContainer>
      {LoanModalMode && (
        <CheckLoanModal onClose={() => dispatch(setLoanModalMode(false)) }loan={newLoan} type="create"/>
      )}
      <FormCard>
        <Stack spacing={2} alignItems="center">
          <HeaderAvatar>
            <PersonAddIcon fontSize="large" />
          </HeaderAvatar>
          <Typography
            variant="h5"
            align="center"
            sx={{ fontWeight: 700 }}
            color={theme.palette.primary.dark}
          >
            יצירת הלוואה חדשה
          </Typography>
        </Stack>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <FieldStack spacing={2}>
            <SelectAllUsers onChange={handleUserChange} label="בחר משתמש" />
            <TextField
              label="סכום הלוואה"
              name="loan_amount"
              value={newLoan.loan_amount}
              onChange={handleFieldChange}
              fullWidth
              InputProps={{ sx: { borderRadius: 2 } }}
              required
            />
            <TextField
              label="מטרה"
              name="purpose"
              value={newLoan.purpose}
              onChange={handleFieldChange}
              fullWidth
              InputProps={{ sx: { borderRadius: 2 } }}
              required
            />

            <TextField
              label="תאריך הלוואה"
              name="loan_date"
              type="date"
              value={newLoan.loan_date}
              onChange={handleFieldChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{ sx: { borderRadius: 2 } }}
              required
            />
            <TextField
              label="תשלום חודשי"
              name="monthly_payment"
              value={newLoan.monthly_payment}
              onChange={handleFieldChange}
              fullWidth
              InputProps={{ sx: { borderRadius: 2 } }}
              required
            />
            <TextField
              label="יום תשלום חודשי (1-31)"
              name="payment_date"
              type="number"
              value={newLoan.payment_date}
              onChange={handleFieldChange}
              fullWidth
              InputProps={{
                sx: { borderRadius: 2 },
                inputProps: { max: 31, min: 1 },
              }}
              required
            />
          </FieldStack>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                color: "#ffffff",
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                },
              }}
            >
              צור הלוואה
            </Button>
          </Box>
        </Box>
      </FormCard>
    </RootContainer>
  );
};

export default NewLoanForm;
