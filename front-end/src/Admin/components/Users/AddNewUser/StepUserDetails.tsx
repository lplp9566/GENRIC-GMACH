import React from "react";
import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
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
      <TextField
        dir="rtl"
        label="טלפון"
        type="tel"
        value={data.userData.phone_number}
        onChange={onUserChange("phone_number")}
        fullWidth
      />
      <FormControl fullWidth dir="rtl">
        <InputLabel id="permission-label">הרשאה</InputLabel>
        <Select
          labelId="permission-label"
          label="הרשאה"
          value={data.userData.permission ?? "user"}
          onChange={(e) =>
            onUserChange("permission")(
              e as unknown as React.ChangeEvent<HTMLInputElement>
            )
          }
        >
          <MenuItem value="user">משתמש</MenuItem>
          <MenuItem value="admin_read">מנהל צפייה</MenuItem>
          <MenuItem value="admin_write">מנהל עריכה</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default StepUserDetails;
