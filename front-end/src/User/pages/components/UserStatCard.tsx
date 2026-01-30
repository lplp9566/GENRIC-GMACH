import { Box, Paper, Stack, Typography } from "@mui/material";

type Props = {
  title: string;
  value: string;
  subtitle?: string;
  tone?: "neutral" | "accent";
  icon?: string;
  accent: string;
  accentSoft: string;
  surface: string;
  softBorder: string;
  isDark: boolean;
};

const UserStatCard = ({
  title,
  value,
  subtitle,
  tone = "neutral",
  icon = "₪",
  accent,
  accentSoft,
  surface,
  softBorder,
  isDark,
}: Props) => (
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
    <Stack spacing={0.75}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2.5,
            bgcolor:
              tone === "accent"
                ? accentSoft
                : isDark
                ? "rgba(255,255,255,0.10)"
                : "rgba(15,23,42,0.06)",
            color: tone === "accent" ? accent : isDark ? "#fff" : "#0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle2" fontWeight={900}>
          {title}
        </Typography>
      </Stack>

      <Typography variant="h6" fontWeight={900}>
        {value}
      </Typography>

      {!!subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Stack>
  </Paper>
);

export default UserStatCard;
