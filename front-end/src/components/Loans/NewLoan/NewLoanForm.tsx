// src/components/Loans/NewLoanForm.tsx
import React, { useState } from "react";
import {
  Box,
  Card,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import SelectAllUsers from "../../SelectUsers/SelectAllUsers";
import CheckLoanModal from "../CheckLoanModal";
import { ICreateLoan } from "../LoanDto";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const steps = [
  "פרטי ההלוואה הבסיסיים",
  "פרטי הלוואה והערבויות",
  "סיכום ואישור",
];

// צבעי המותג
const GREEN_MAIN = "#0b5e29";
const GREEN_LIGHT = "#e8f5e9";
const GREEN_DARK = "#094a20";
const TEXT_SECONDARY = "#666";

const CustomConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 10 },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: GREEN_MAIN,
    borderTopWidth: 2,
  },
}));

const NewLoanForm: React.FC = () => {
  const allUsers = useSelector(
    (s: RootState) => s.adminUsers.allUsers ?? []
  );
const selectedUser = useSelector((s:RootState)=> s.adminUsers.selectedUser)
  const today = new Date().toISOString().split("T")[0];
    const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [openModal, setOpenModal] = useState(false);

  // נתוני הלוואה (ללא guarantor1/2)
  const [newLoan, setNewLoan] = useState<
    Omit<ICreateLoan, "guarantor1" | "guarantor2">
  >({
    user: selectedUser? selectedUser.id : 0,
    loan_amount: 0,
    purpose: "",
    loan_date: today,
    monthly_payment: 0,
    payment_date: 1,
  });

  // ערבויות
  const [guarantors, setGuarantors] = useState<
    { id: number; firstName: string; lastName: string }[]
  >([]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewLoan((p) => ({
      ...p,
      [name]:
        name === "purpose" || name === "loan_date"
          ? value
          : Number(value),
    }));
  };

  const addGuarantor = () => {
    if (guarantors.length >= 2) return;
    setGuarantors((g) => [...g, { id: 0, firstName: "", lastName: "" }]);
  };

  const onGuarantorChange = (idx: number, userId: number) => {
    // מונע כפילויות
    if (guarantors.some((g, i) => g.id === userId && i !== idx)) {
      toast.warn("ערב זה כבר נוסף");
      return;
    }
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return;
    setGuarantors((g) => {
      const copy = [...g];
      copy[idx] = {
        id: userId,
        firstName: user.first_name,
        lastName: user.last_name,
      };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // מקדמים שלב אם לא בשלב האחרון
    if (activeStep < steps.length - 1) {
      setActiveStep((s) => s + 1);
      return;
    }
    // בדיקות סופיות
    if (
      !newLoan.user ||
      newLoan.loan_amount <= 0 ||
      newLoan.monthly_payment <= 0 ||
      !newLoan.loan_date ||
      !newLoan.purpose ||
      newLoan.payment_date < 1 ||
      newLoan.payment_date > 28
    ) {
      toast.warn("נא למלא את כל הפריטים החובה ולוודא יום תשלום תקין");
      return;
    }
    // תפתח את המודל
    setOpenModal(true);
  };

  // שמות מלאים לשימוש ב-DB ובתצוגה
  const borrower = allUsers.find((u) => u.id === newLoan.user);
  const borrowerName = borrower
    ? `${borrower.first_name} ${borrower.last_name}`
    : "";

  const guarantor1 =
    guarantors[0] &&
    `${guarantors[0].firstName} ${guarantors[0].lastName}`;
  const guarantor2 =
    guarantors[1] &&
    `${guarantors[1].firstName} ${guarantors[1].lastName}`;

  return (
    <>
      {openModal && (
        <CheckLoanModal
          onClose={() => setOpenModal(false)}
          loan={{
            ...newLoan,
            // שולחים DB את השמות המלאים
            guarantor1: guarantor1 || null,
            guarantor2: guarantor2 || null,
          }}
          type="create"
        />
      )}

      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: GREEN_LIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
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
            יצירת הלוואה חדשה
          </Typography>

          <Stepper
            alternativeLabel
            activeStep={activeStep}
            connector={<CustomConnector />}
            sx={{ mb: 4 }}
          >
            {steps.map((label, idx) => (
              <Step key={idx}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      color:
                        activeStep >= idx
                          ? GREEN_MAIN
                          : "#ccc",
                      "&.Mui-active": {
                        color: GREEN_DARK,
                      },
                      "&.Mui-completed": {
                        color: GREEN_MAIN,
                      },
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: activeStep === idx ? 600 : 400,
                      color:
                        activeStep === idx
                          ? GREEN_MAIN
                          : TEXT_SECONDARY,
                    }}
                  >
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* STEP 1 */}
          {activeStep === 0 && (
            // {userSelected ? (
              
            // ) }
            <Stack spacing={2}>
              
              <SelectAllUsers
                label="בחר משתמש"
                
                value={selectedUser? selectedUser.id : newLoan.user}
                
                onChange={(id) =>
                  setNewLoan((p) => ({ ...p, user: id }))
                }
              />
              <TextField
                label="סכום הלוואה"
                name="loan_amount"
                value={newLoan.loan_amount}
                onChange={handleFieldChange}
                fullWidth
              />
              <TextField
                label="מטרה"
                name="purpose"
                value={newLoan.purpose}
                onChange={handleFieldChange}
                fullWidth
              />
              <TextField
                label="תאריך הלוואה"
                name="loan_date"
                type="date"
                value={newLoan.loan_date}
                onChange={handleFieldChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="תשלום חודשי"
                name="monthly_payment"
                value={newLoan.monthly_payment}
                onChange={handleFieldChange}
                fullWidth
              />
              <TextField
                label="יום תשלום (1–28)"
                name="payment_date"
                type="number"
                inputProps={{ min: 1, max: 28 }}
                value={newLoan.payment_date}
                onChange={handleFieldChange}
                fullWidth
              />
            </Stack>
          )}

          {/* STEP 2 */}
          {activeStep === 1 && (
            <Stack spacing={2}>
              <Button
                variant="outlined"
                onClick={addGuarantor}
                disabled={guarantors.length >= 2}
                sx={{
                  borderColor: GREEN_MAIN,
                  color: GREEN_MAIN,
                  "&:hover": { backgroundColor: GREEN_LIGHT },
                }}
              >
                + הוסף ערב
              </Button>
              {guarantors.map((g, i) => (
                <SelectAllUsers
                  key={i}
                  label={`ערב #${i + 1}`}
                  value={g.id}
                  onChange={(id) => onGuarantorChange(i, id)}
                />
              ))}
            </Stack>
          )}

          {/* STEP 3 */}
          {activeStep === 2 && (
            <Card
              variant="outlined"
              sx={{
                p: 3,
                mb: 2,
                background: GREEN_LIGHT,
                borderColor: GREEN_MAIN,
                boxShadow: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                סיכום ואישור
              </Typography>
              <Stack spacing={1}>
                <Typography>
                  <strong>לווה:</strong> {borrowerName}
                </Typography>
                <Typography>  
                  <strong>סכום:</strong> ₪{newLoan.loan_amount}
                </Typography>
                <Typography>
                  <strong>מטרה:</strong> {newLoan.purpose}
                </Typography>
                <Typography>
                  <strong>תאריך:</strong> {newLoan.loan_date}
                </Typography>
                <Typography>
                  <strong>תשלום חודשי:</strong> ₪
                  {newLoan.monthly_payment}
                </Typography>
                <Typography>
                  <strong>יום תשלום:</strong> {newLoan.payment_date}
                </Typography>
                <Typography>
                  <strong>ערבויות:</strong> {guarantors.length}
                </Typography>
                {guarantors.map((g, i) => (
                  <Typography key={i}>
                    ערב #{i + 1}: {g.firstName} {g.lastName}
                  </Typography>
                ))}
              </Stack>
            </Card>
          )}

          {/* ניווט */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 3,
            }}
          >
            <Button
              type="button"
              // disabled={activeStep === 0}
              onClick={ activeStep === 0 ? () =>    navigate(-1) : () => setActiveStep((s) => s - 1)}
            >
              חזרה
            </Button>
            <Button
              variant="contained"
              type="submit"
              sx={{
                textTransform: "none",
                bgcolor: GREEN_MAIN,
                "&:hover": { bgcolor: GREEN_DARK },
              }}
            >
              {activeStep === steps.length - 1
                ? "צור הלוואה"
                : "המשך"}
            </Button>
          </Box>
        </Card>
      </Box>
    </>
  );
};

export default NewLoanForm;
