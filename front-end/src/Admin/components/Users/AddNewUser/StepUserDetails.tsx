import React from "react";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import SelectRank from "../../SelectRank/SelectRank";
import { UserDetailsStepProps } from "./AddUserStepsProps";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const StepUserDetails: React.FC<UserDetailsStepProps> = ({
  data,
  onUserChange,
  setData,
}) => {
  const [showPassword, setShowPassword] = React.useState(true);
  const toggleShowPassword = () => {
    setShowPassword((s) => !s);
  };

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
        label="תז"
        value={data.userData.id_number}
        onChange={onUserChange("id_number")}
        fullWidth
      />
      {data.userData.membership_type === "MEMBER" && (
        <TextField
          dir="rtl"
          label="תאריך הצטרפות"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={data.userData.join_date}
          onChange={onUserChange("join_date")}
          fullWidth
        />
      )}
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
        value={data.userData.phone_number}
        onChange={onUserChange("phone_number")}
        fullWidth
      />
      <TextField
        dir="rtl"
        label="סיסמה"
        name="password"
        type={showPassword ? "text" : "password"}
        value={data.userData.password}
        onChange={onUserChange("password")}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={toggleShowPassword}
                edge="end"
                aria-label="toggle password visibility"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />{" "}
      {data.userData.membership_type === "MEMBER" && <SelectRank
        onChange={(rankId: any) =>
          setData((d) => ({
            ...d,
            userData: { ...d.userData, current_role: rankId },
          }))
        }
        value={data.userData.current_role!}
      />}
     
    </Box>
  );
};

export default StepUserDetails;
