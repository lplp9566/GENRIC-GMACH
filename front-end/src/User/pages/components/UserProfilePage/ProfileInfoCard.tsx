import { Box, Paper, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";
import { ProfileRow } from "./types";

type Props = {
  cardSx: object;
  title: string;
  icon: ReactNode;
  rows: ProfileRow[];
  action?: ReactNode;
};

const ProfileInfoCard = ({ cardSx, title, icon, rows, action }: Props) => (
  <Paper elevation={0} sx={cardSx}>
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mb={2}>
      {icon}
      <Typography variant="h6" fontWeight={900} textAlign="center">
        {title}
      </Typography>
    </Stack>
    <Stack spacing={1.2}>
      {rows.map((row) => (
        <Stack direction="row" justifyContent="space-between" alignItems="center" key={row.label}>
          <Typography variant="body2" color="text.secondary">
            {row.label}
          </Typography>
          <Typography variant="subtitle2" fontWeight={800}>
            {row.value}
          </Typography>
        </Stack>
      ))}
    </Stack>
    {action ? <Box mt={2}>{action}</Box> : null}
  </Paper>
);

export default ProfileInfoCard;
