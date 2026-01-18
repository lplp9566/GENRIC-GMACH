import React from "react";
import { Box, FormControl, FormLabel, Select, MenuItem } from "@mui/material";
import { IAddUserFormData, MembershipType } from "../UsersDto";

type Props = {
  data: IAddUserFormData;
  setData: React.Dispatch<React.SetStateAction<IAddUserFormData>>;
};

const StepMembershipType: React.FC<Props> = ({ data, setData }) => {
  const value = data.userData.membership_type ?? MembershipType.MEMBER;

  return (
    <Box sx={{ mt: 2 }}>
      <FormControl>
        <FormLabel sx={{ mb: 1 }}>סוג משתמש</FormLabel>
        <Select
          value={value}
          onChange={(e) => {
            const nextValue = e.target.value as MembershipType;
            setData((prev) => ({
              ...prev,
              userData: { ...prev.userData, membership_type: nextValue },
            }));
          }}
          size="small"
          sx={{ minWidth: 220 }}
        >
          <MenuItem value={MembershipType.MEMBER}>חבר</MenuItem>
          <MenuItem value={MembershipType.FRIEND}>ידיד</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default StepMembershipType;
