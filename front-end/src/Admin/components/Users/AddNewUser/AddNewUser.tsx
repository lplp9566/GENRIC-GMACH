// NewUserForm.tsx
import React from "react";
import { Box, Card, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { RtlProvider } from "../../../../Theme/rtl";
import StepBankDetails from "./StepBankDetails";
import StepSummary from "./StepSummary";
import useNewUserForm from "../../../Hooks/UsersHooks/NewUserForm";
import PaymentMethodStep from "./PaymentMethodStep";
import StepUserDetails from "./StepUserDetails";
import StepperNavigation from "../../StepperNavigation/StepperNavigation";
const GREEN_MAIN = "#0b5e29";
const GREEN_LIGHT = "#e8f5e9";
export const NEW_USER_STEPS = [
  "פרטים אישיים",
  "פרטי חשבון",
  "אופן תשלום",
  "סיכום ואישור",
];
const NewUserForm: React.FC = () => {
  const navigate = useNavigate();

  const {
    activeStep,
    data,
    handleUserChange,
    handlePaymentChange,
    handleSubmit,
    handleBack,
    setData,
    
  } = useNewUserForm(navigate);


  return (
    <RtlProvider>
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
            הוספת משתמש חדש
          </Typography>

          <StepperNavigation steps={NEW_USER_STEPS} activeStep={activeStep} />

          {activeStep === 0 && (
            <StepUserDetails
              data={data}
              onUserChange={handleUserChange}
              setData={setData}
            />
          )}
          {activeStep === 1 && (
            <StepBankDetails
              data={data}
              onPaymentChange={handlePaymentChange}
            />
          )}
          {activeStep === 2 && (
            <PaymentMethodStep
              data={data}
              onPaymentChange={handlePaymentChange}
            />
          )}
          {activeStep === 3 && <StepSummary data={data} />}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 3,
            }}
          >


            <Button
            type="submit"
            sx={{
              
              bgcolor: GREEN_MAIN,}}
              variant="contained"

            >
              {activeStep === NEW_USER_STEPS.length - 1 ? "צור משתמש" : "המשך"}
            </Button>
                        <Button
              type="button"
              onClick={() =>
                activeStep === 0 ? navigate("/users") : handleBack()
              }
            >
              חזרה
            </Button>
          </Box>
        </Card>
      </Box>
    </RtlProvider>
  );
};

export default NewUserForm;
