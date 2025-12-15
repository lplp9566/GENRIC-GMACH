// src/components/Loans/StepGuarantors.tsx
import React from "react";
import { Stack, Button } from "@mui/material";
import SelectAllUsers from "../../SelectUsers/SelectAllUsers";

const GREEN_MAIN = "#0b5e29";
const GREEN_LIGHT = "#e8f5e9";

interface StepGuarantorsProps {
  guarantors: { id: number; firstName: string; lastName: string }[];
  allUsers: { id: number; first_name: string; last_name: string }[];
  addGuarantor: () => void;
  onGuarantorChange: (idx: number, userId: number) => void;
}

const StepGuarantors: React.FC<StepGuarantorsProps> = ({
  guarantors,
  addGuarantor,
  onGuarantorChange,
}) => (
  <Stack spacing={2}>
    <Button
      variant="outlined"
      onClick={addGuarantor}
      disabled={guarantors.length >= 2}
      sx={{
        borderColor: GREEN_MAIN,
        color: GREEN_MAIN,
        "&:hover": { backgroundColor: GREEN_LIGHT },
      }}
    >
      + הוסף ערב
    </Button>
    {guarantors.map((g, i) => (
      <SelectAllUsers
        filter="members"
        key={i}
        label={`ערב #${i + 1}`}
        value={g.id}
        onChange={(id) => onGuarantorChange(i, id)}
      />
    ))}
  </Stack>
);

export default StepGuarantors;
