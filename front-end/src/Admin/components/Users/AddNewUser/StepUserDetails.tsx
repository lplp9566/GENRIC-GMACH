import React from "react";
import { Box, TextField } from "@mui/material";
import { UserDetailsStepProps } from "./AddUserStepsProps";

const StepUserDetails: React.FC<UserDetailsStepProps> = ({ data, onUserChange }) => {
  return (
    <Box display="grid" gap={2} mb={2}>
      <TextField
        dir="rtl"
        label="שם פרטי"
        value={data.userData.first_name}
        onChange={onUserChange("first_name")}
        fullWidth
      />
      <TextField
        dir="rtl"
        label="שם משפחה"
        value={data.userData.last_name}
        onChange={onUserChange("last_name")}
        fullWidth
      />
      <TextField
        dir="rtl"
        label="תעודת זהות"
        value={data.userData.id_number}
        onChange={onUserChange("id_number")}
        fullWidth
      />
      <TextField
        dir="rtl"
        label="אימייל"
        type="email"
        value={data.userData.email_address}
        onChange={onUserChange("email_address")}
        fullWidth
      />
    </Box>
  );
};

export default StepUserDetails;
