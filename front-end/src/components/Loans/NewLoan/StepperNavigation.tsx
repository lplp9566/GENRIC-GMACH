// src/components/Loans/StepperNavigation.tsx
import React from "react";
import { Stepper, Step, StepLabel, Typography, styled } from "@mui/material";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";

const GREEN_MAIN = "#0b5e29";
// const GREEN_LIGHT = "#e8f5e9";
const GREEN_DARK = "#094a20";
const TEXT_SECONDARY = "#666";

const CustomConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 10 },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: GREEN_MAIN,
    borderTopWidth: 2,
  },
}));

interface StepperNavigationProps {
  steps: string[];
  activeStep: number;
}

const StepperNavigation: React.FC<StepperNavigationProps> = ({
  steps,
  activeStep,
}) => (
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
              color: activeStep >= idx ? GREEN_MAIN : "#ccc",
              "&.Mui-active": { color: GREEN_DARK },
              "&.Mui-completed": { color: GREEN_MAIN },
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: activeStep === idx ? 600 : 400,
              color: activeStep === idx ? GREEN_MAIN : TEXT_SECONDARY,
            }}
          >
            {label}
          </Typography>
        </StepLabel>
      </Step>
    ))}
  </Stepper>
);

export default StepperNavigation;
