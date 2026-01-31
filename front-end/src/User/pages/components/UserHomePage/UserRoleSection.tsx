import { Paper, Stack, Typography } from "@mui/material";
import SectionTitle from "./SectionTitle";

type Props = {
  title: string;
  currentRoleName: string | null;
  currentRoleAmount: number | null;
  surface: string;
  softBorder: string;
  formatILS: (value?: number | string | null) => string;
};

const UserRoleSection = ({
  title,
  currentRoleName,
  currentRoleAmount,
  surface,
  softBorder,
  formatILS,
}: Props) => (
  <>
    <SectionTitle>{title}</SectionTitle>
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        background: surface,
        border: softBorder,
        backdropFilter: "blur(6px)",
      }}
    >
      <Stack spacing={1}>
        <Typography variant="subtitle2" fontWeight={900}>
          הדרגה הנוכחית
        </Typography>
        <Typography variant="h6" fontWeight={900}>
          {currentRoleName ?? "לא הוגדרה דרגה"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {currentRoleAmount != null
            ? `תשלום חודשי לפי דרגה: ${formatILS(currentRoleAmount)}`
            : "תשלום חודשי לפי דרגה: לא הוגדר"}
        </Typography>
      </Stack>
    </Paper>
  </>
);

export default UserRoleSection;
