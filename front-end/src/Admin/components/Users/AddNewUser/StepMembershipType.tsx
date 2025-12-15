import React from "react";
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
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
        <FormLabel sx={{ mb: 1 }}>בחרי סוג משתמש</FormLabel>

        <RadioGroup
          value={value}
          onChange={(e) => {
            const nextValue = e.target.value as MembershipType;
            setData((prev) => ({
              ...prev,
              userData: { ...prev.userData, membership_type: nextValue },
            }));
          }}
        >
          <FormControlLabel
            value={MembershipType.MEMBER}
            control={<Radio />}
            label="חבר גמ״ח"
          />
          <FormControlLabel
            value={MembershipType.FRIEND}
            control={<Radio />}
            label="ידיד גמ״ח"
          />
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default StepMembershipType;
