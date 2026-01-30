import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import SectionTitle from "./SectionTitle";
import UserStatCard from "./UserStatCard";

type LoanChargeItem = {
  id: number;
  date: Date;
  amount: number;
};

type Props = {
  nextChargeDate: Date | null;
  currentRoleAmount: number | null;
  loanChargeSchedule: LoanChargeItem[];
  formatDate: (value: Date) => string;
  formatDebtILS: (value: number) => string;
  accent: string;
  accentSoft: string;
  surface: string;
  softBorder: string;
  isDark: boolean;
};

const UserNextChargesSection = ({
  nextChargeDate,
  currentRoleAmount,
  loanChargeSchedule,
  formatDate,
  formatDebtILS,
  accent,
  accentSoft,
  surface,
  softBorder,
  isDark,
}: Props) => (
  <>
    <SectionTitle>החיובים הקרובים</SectionTitle>

    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <UserStatCard
          title="דמי חבר – החיוב הבא"
          value={
            nextChargeDate && currentRoleAmount != null
              ? `${formatDate(nextChargeDate)} • ${formatDebtILS(Math.abs(currentRoleAmount))}`
              : "לא מוגדר"
          }
          subtitle="חיוב חודשי לפי הדרגה"
          tone="accent"
          accent={accent}
          accentSoft={accentSoft}
          surface={surface}
          softBorder={softBorder}
          isDark={isDark}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            background: surface,
            border: softBorder,
            backdropFilter: "blur(6px)",
            height: "100%",
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2.5,
                  bgcolor: accentSoft,
                  color: accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                }}
              >
                ₪
              </Box>
              <Typography variant="subtitle2" fontWeight={900}>
                חיובי הלוואות קרובים
              </Typography>
            </Stack>

            {loanChargeSchedule.length > 0 ? (
              <Stack spacing={1}>
                {loanChargeSchedule.map((loan) => (
                  <Box
                    key={loan.id}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                      gap: 0.5,
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      border: softBorder,
                      background: isDark ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={900}>
                      הלוואה #{loan.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(loan.date)} • {formatDebtILS(Math.abs(loan.amount))}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                אין הלוואות פעילות
              </Typography>
            )}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  </>
);

export default UserNextChargesSection;
