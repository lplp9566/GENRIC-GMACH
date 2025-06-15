// src/components/Loans/NewLoanForm.tsx
import React from "react";
import { Box, Card, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CheckLoanModal from "../CheckLoanModal";

import StepperNavigation from "./StepperNavigation";
import StepBasicDetails from "./StepBasicDetails";
import StepGuarantors from "./StepGuarantors";
import StepSummary from "./StepSummary";

import {
  useNewLoanForm,
  NEW_LOAN_STEPS,
} from "../../../Hooks/LoanHooks/useNewLoanForm"

const GREEN_MAIN = "#0b5e29";
const GREEN_LIGHT = "#e8f5e9";
const GREEN_DARK = "#094a20";

const NewLoanForm: React.FC = () => {
  const navigate = useNavigate();

  // שולפים מה-hook את כל ה-state וה handlers
  const {
    activeStep,
    newLoan,
    guarantors,
    openModal,
    allUsers,

    handleFieldChange,
    handleUserChange,
    addGuarantor,
    onGuarantorChange,
    handleSubmit,
    closeModal,
    handleBack,

    borrowerName,
    modalLoan,
  } = useNewLoanForm();

  return (
    <>
      {openModal && (
        <CheckLoanModal
          onClose={closeModal}
          loan={modalLoan}
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

          <StepperNavigation
            steps={NEW_LOAN_STEPS}
            activeStep={activeStep}
          />

          {activeStep === 0 && (
            <StepBasicDetails
              newLoan={newLoan}
              selectedUserId={newLoan.user}
              allUsers={allUsers}
              onFieldChange={handleFieldChange}
              onUserChange={handleUserChange}
            />
          )}

          {activeStep === 1 && (
            <StepGuarantors
              guarantors={guarantors}
              allUsers={allUsers}
              addGuarantor={addGuarantor}
              onGuarantorChange={onGuarantorChange}
            />
          )}

          {activeStep === 2 && (
            <StepSummary
              newLoan={newLoan}
              borrowerName={borrowerName}
              guarantors={guarantors}
            />
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 3,
            }}
          >
            <Button
              type="button"
              onClick={() =>
                activeStep === 0
                  ? navigate(-1)
                  : handleBack()
              }
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
              {activeStep === NEW_LOAN_STEPS.length - 1
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
