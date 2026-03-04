import { Button, Paper, Stack, Typography } from "@mui/material";

type Props = {
  isDark: boolean;
  softBorder: string;
  fullDisplayName: string;
  onSendYearSummary: () => void;
  onOpenEdit: () => void;
};

const ProfileHeaderCard = ({
  isDark,
  softBorder,
  fullDisplayName,
  onSendYearSummary,
  onOpenEdit,
}: Props) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2.5, md: 3.5 },
      borderRadius: 5,
      background: isDark
        ? "linear-gradient(135deg, rgba(15,23,42,0.94), rgba(30,41,59,0.92))"
        : "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(241,245,249,0.92))",
      border: softBorder,
      boxShadow: isDark
        ? "0 20px 42px rgba(2,6,23,0.35)"
        : "0 20px 42px rgba(15,23,42,0.08)",
    }}
  >
    <Stack spacing={1.1} alignItems="center" textAlign="center">
      <Typography variant="h4" fontWeight={900}>
        אזור אישי
      </Typography>
      <Typography variant="h5" fontWeight={800}>
        {fullDisplayName}
      </Typography>
    </Stack>

    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.2}
      justifyContent="center"
      alignItems={{ xs: "stretch", sm: "center" }}
      sx={{ mt: 2 }}
    >
      <Button
        variant="contained"
        onClick={onSendYearSummary}
        sx={{
          borderRadius: 3,
          fontWeight: 800,
          px: 2.5,
          bgcolor: "#16a34a",
          color: "#fff",
          "&:hover": { bgcolor: "#15803d" },
        }}
      >
        שליחת סיכום שנה אחרונה
      </Button>
      <Button
        variant="outlined"
        onClick={onOpenEdit}
        sx={{
          borderRadius: 3,
          fontWeight: 800,
          px: 2.5,
          color: "#16a34a",
          borderColor: "rgba(22,163,74,0.7)",
          "&:hover": { borderColor: "#16a34a", bgcolor: "rgba(22,163,74,0.08)" },
        }}
      >
        עריכת פרטים
      </Button>
    </Stack>
  </Paper>
);

export default ProfileHeaderCard;
