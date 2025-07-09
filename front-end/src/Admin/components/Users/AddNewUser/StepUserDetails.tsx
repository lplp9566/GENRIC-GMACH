import React from "react";
import { Box, TextField } from "@mui/material";
import SelectRank from "../../SelectRank/SelectRank";
import { UserDetailsStepProps } from "./AddUserStepsProps";

const StepUserDetails: React.FC<UserDetailsStepProps> = ({ data, onUserChange, setData }) => (
  <Box display="grid" gap={2} mb={2}>
    <TextField dir="rtl" label="שם פרטי" value={data.userData.first_name} onChange={onUserChange("first_name")} fullWidth />
    <TextField dir="rtl" label="שם משפחה" value={data.userData.last_name} onChange={onUserChange("last_name")} fullWidth />
    <TextField dir="rtl" label="תז" value={data.userData.id_number} onChange={onUserChange("id_number")} fullWidth />
    <TextField
    dir="rtl"
      label="תאריך הצטרפות"
      type="date"
      InputLabelProps={{ shrink: true }}
      value={data.userData.join_date}
      onChange={onUserChange("join_date")}
      fullWidth
    />
    <TextField dir="rtl" label="אימייל" type="email" value={data.userData.email_address} onChange={onUserChange("email_address")} fullWidth />
    <TextField dir="rtl" label="טלפון" value={data.userData.phone_number} onChange={onUserChange("phone_number")} fullWidth />
    <TextField  dir="rtl" label="סיסמה" type="password" value={data.userData.password} onChange={onUserChange("password")} fullWidth />
    <SelectRank
      onChange={(rankId:any) => setData((d) => ({ ...d, userData: { ...d.userData, current_role: rankId } }))}
      value={data.userData.current_role}
      
    />
  </Box>
);

export default StepUserDetails;
