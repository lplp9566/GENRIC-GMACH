import { Box, Paper, Stack, Typography } from "@mui/material";
import SectionTitle from "./SectionTitle";
import { formatILS } from "../../../../Admin/components/HomePage/HomePage";

interface UserContributionsSectionProps {
  totalContributions: number;
  activeLoansRemaining: number;
  loanUsagePercent: number;
  isDark: boolean;
};

const UserContributionsSection = ({
  totalContributions,
  activeLoansRemaining,
  loanUsagePercent,
  isDark,
}: UserContributionsSectionProps) => (
  <>
    <SectionTitle>תרומות והלוואות</SectionTitle>
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        background: isDark
          ? "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(30,41,59,0.90))"
          : "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(220,252,231,0.70))",
        border: isDark
          ? "1px solid rgba(34,197,94,0.30)"
          : "1px solid rgba(34,197,94,0.18)",
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={900}>
            סך תרומות ודמי חבר
          </Typography>
          <Typography variant="h5" fontWeight={900} mt={0.5}>
            {formatILS(totalContributions)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            מתוך זה, {formatILS(activeLoansRemaining)} נמצאים כרגע בהלוואות פעילות
          </Typography>
        </Box>

        <Box
          sx={{
            position: "relative",
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: `conic-gradient(${isDark ? "#38bdf8" : "#2563eb"} ${loanUsagePercent}%, ${
              isDark ? "rgba(148,163,184,0.25)" : "rgba(148,163,184,0.20)"
            } 0)`,
            transition: "background 1.2s ease",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 10,
              borderRadius: "50%",
              background: isDark ? "#0f172a" : "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              textAlign: "center",
              animation: "pulseGlow 2.6s ease-in-out infinite",
              "@keyframes pulseGlow": {
                "0%": { boxShadow: "0 0 0 rgba(56,189,248,0.0)" },
                "50%": { boxShadow: "0 0 22px rgba(56,189,248,0.35)" },
                "100%": { boxShadow: "0 0 0 rgba(56,189,248,0.0)" },
              },
            }}
          >
            <Typography variant="h6" fontWeight={900}>
              {loanUsagePercent}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              מהתרומות בהלוואות
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Paper>
  </>
);

export default UserContributionsSection;
