import { ReactNode } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

type Props = {
  title: string;
  value: string;
  subtitle?: string;
  tone?: "neutral" | "accent";
  icon?: ReactNode;
  centered?: boolean;
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
  centered = false,
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
      borderRadius: 5,
      background: surface,
      border: softBorder,
      backdropFilter: "blur(8px)",
      boxShadow: isDark
        ? "0 14px 36px rgba(2,6,23,0.35)"
        : "0 14px 36px rgba(15,23,42,0.08)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: isDark
          ? "0 18px 44px rgba(2,6,23,0.45)"
          : "0 18px 44px rgba(15,23,42,0.12)",
      },
    }}
  >
    <Stack spacing={0.75} alignItems={centered ? "center" : "stretch"}>
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        justifyContent={centered ? "center" : "flex-start"}
        sx={{ width: "100%" }}
      >
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

        <Typography variant="subtitle2" fontWeight={900} textAlign={centered ? "center" : "inherit"}>
          {title}
        </Typography>
      </Stack>

      <Typography variant="h6" fontWeight={900} textAlign={centered ? "center" : "inherit"}>
        {value}
      </Typography>

      {!!subtitle && (
        <Typography variant="body2" color="text.secondary" textAlign={centered ? "center" : "inherit"}>
          {subtitle}
        </Typography>
      )}
    </Stack>
  </Paper>
);

export default UserStatCard;
