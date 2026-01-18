import React from "react";
import { Box, TextField } from "@mui/material";
import { UserDetailsStepProps } from "./AddUserStepsProps";

const StepSpouseDetails: React.FC<UserDetailsStepProps> = ({ data, onUserChange }) => {
  return (
    <Box display="grid" gap={2} mb={2}>
      <TextField
        dir="rtl"
        label="שם פרטי בן/בת זוג"
        value={data.userData.spouse_first_name ?? ""}
        onChange={onUserChange("spouse_first_name")}
        fullWidth
      />
      <TextField
        dir="rtl"
        label="שם משפחה בן/בת זוג"
        value={data.userData.spouse_last_name ?? ""}
        onChange={onUserChange("spouse_last_name")}
        fullWidth
      />
      <TextField
        dir="rtl"
        label="תעודת זהות בן/בת זוג"
        value={data.userData.spouse_id_number ?? ""}
        onChange={onUserChange("spouse_id_number")}
        fullWidth
      />
    </Box>
  );
};

export default StepSpouseDetails;
