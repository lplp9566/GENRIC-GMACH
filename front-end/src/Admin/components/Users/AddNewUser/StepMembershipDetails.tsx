import React from "react";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import SelectRank from "../../SelectRank/SelectRank";
import StepMembershipType from "./StepMembershipType";
import { MembershipType } from "../UsersDto";
import { UserDetailsStepProps } from "./AddUserStepsProps";

const StepMembershipDetails: React.FC<UserDetailsStepProps> = ({
  data,
  onUserChange,
  setData,
}) => {
  const [showPassword, setShowPassword] = React.useState(true);
  const toggleShowPassword = () => setShowPassword((s) => !s);

  return (
    <Box display="grid" gap={2} mb={2}>
      <StepMembershipType data={data} setData={setData} />

      {data.userData.membership_type === MembershipType.MEMBER && (
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
      />

      {data.userData.membership_type === MembershipType.MEMBER && (
        <SelectRank
          onChange={(rankId: any) =>
            setData((d) => ({
              ...d,
              userData: { ...d.userData, current_role: rankId },
            }))
          }
          value={data.userData.current_role!}
        />
      )}
    </Box>
  );
};

export default StepMembershipDetails;
