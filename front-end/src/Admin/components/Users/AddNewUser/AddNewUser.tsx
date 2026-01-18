// NewUserForm.tsx
import React from "react";
import { Box, Card, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import StepBankDetails from "./StepBankDetails";
import StepSummary from "./StepSummary";
import useNewUserForm from "../../../Hooks/UsersHooks/NewUserForm";
import PaymentMethodStep from "./PaymentMethodStep";
import StepUserDetails from "./StepUserDetails";
import StepSpouseDetails from "./StepSpouseDetails";
import StepMembershipDetails from "./StepMembershipDetails";
import StepperNavigation from "../../StepperNavigation/StepperNavigation";
import { MembershipType } from "../UsersDto";
import { RtlThemeProvider } from "../../../../Theme/rtl";
const GREEN_MAIN = "#0b5e29";
const MEMBER_STEPS = [
  "פרטי משתמש",
  "בן/בת זוג",
  "דרגה, הצטרפות וסיסמה",
  "חשבון ואמצעי תשלום",
  "סיכום",
];

const FRIEND_STEPS = [
  "פרטי משתמש",
  "בן/בת זוג",
  "דרגה, הצטרפות וסיסמה",
  "סיכום",
];

const NewUserForm: React.FC = () => {
  const navigate = useNavigate();

  const {
    activeStep,
    data,
    handleUserChange,
    handleBankFieldChange,
    handleSubmit,
    handleBack,
    setData,
    handlePaymentFieldChange,
  } = useNewUserForm(navigate);
  const isFriend = data.userData.membership_type === MembershipType.FRIEND;
  const steps = isFriend ? FRIEND_STEPS : MEMBER_STEPS;

  return (
    <RtlThemeProvider>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Card
          component="form"
          onSubmit={(e) => handleSubmit(e, steps.length)}
          sx={{
            width: { xs: "100%", sm: 600 },
            p: 4,
            borderRadius: 4,
            boxShadow: 6,
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

          <StepperNavigation steps={steps} activeStep={activeStep} />

          {activeStep === 0 && (
            <StepUserDetails
              data={data}
              onUserChange={handleUserChange}
              setData={setData}
            />
          )}
          {activeStep === 1 && (
            <StepSpouseDetails
              data={data}
              onUserChange={handleUserChange}
              setData={setData}
            />
          )}
          {activeStep === 2 && (
            <StepMembershipDetails
              data={data}
              onUserChange={handleUserChange}
              setData={setData}
            />
          )}
          {activeStep === 3 && !isFriend && (
            <>
              <StepBankDetails data={data} onFieldChange={handleBankFieldChange} />
              <PaymentMethodStep data={data} onFieldChange={handlePaymentFieldChange} />
            </>
          )}
          {((isFriend && activeStep === 3) || (!isFriend && activeStep === 4)) && (
            <StepSummary data={data} />
          )}

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
                bgcolor: GREEN_MAIN,
              }}
              variant="contained"
            >
              {activeStep === steps.length - 1 ? "צור משתמש" : "המשך"}
            </Button>
            <Button
              type="button"
              onClick={() =>
                activeStep === 0 ? navigate("/users") : handleBack()
              }
            >
              חזור
            </Button>
          </Box>
        </Card>
      </Box>
    </RtlThemeProvider>
  );
};

export default NewUserForm;
