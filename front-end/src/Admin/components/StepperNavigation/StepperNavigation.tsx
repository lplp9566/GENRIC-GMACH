// src/components/Loans/StepperNavigation.tsx
import React from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 10 },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.mode === "dark" ? "#22c55e" : "#0b5e29",
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
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const mainColor = isDark ? "#22c55e" : "#0b5e29";
  const activeColor = isDark ? "#16a34a" : "#094a20";
  const inactiveColor = isDark ? "#64748b" : "#ccc";
  const textSecondary = isDark ? "#94a3b8" : "#666";

  return (
    <Stepper
      alternativeLabel
      activeStep={activeStep}
      connector={<CustomConnector />}
      sx={{ mb: 4, direction: "ltr" }}
    >
      {steps.map((label, idx) => (
        <Step key={idx}>
          <StepLabel
            StepIconProps={{
              sx: {
                color: activeStep >= idx ? mainColor : inactiveColor,
                "&.Mui-active": { color: activeColor },
                "&.Mui-completed": { color: mainColor },
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: activeStep === idx ? 600 : 400,
                color: activeStep === idx ? mainColor : textSecondary,
              }}
            >
              {label}
            </Typography>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default StepperNavigation;
