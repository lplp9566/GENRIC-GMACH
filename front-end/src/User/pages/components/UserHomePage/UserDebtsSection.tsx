import { Box, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import SectionTitle from "./SectionTitle";
import UserStatCard from "./UserStatCard";

interface UserDebtsSectionProps {
  totalDebt: number;
  monthlyDebt: number;
  loansDebt: number;
  standingOrdersDebt: number;
  openLoansCount: number;
  formatDebtILS: (value: number) => string;
  accent: string;
  accentSoft: string;
  surface: string;
  softBorder: string;
  isDark: boolean;
}

const debtCardSurface = (isDark: boolean, hasDebt: boolean, surface: string) => {
  if (!hasDebt) return surface;
  return isDark ? "rgba(153,27,27,0.55)" : "#fee2e2";
};

const debtCardBorder = (isDark: boolean, hasDebt: boolean, softBorder: string) => {
  if (!hasDebt) return softBorder;
  return isDark ? "1px solid rgba(248,113,113,0.75)" : "1px solid rgba(220,38,38,0.65)";
};

const UserDebtsSection = ({
  totalDebt,
  monthlyDebt,
  loansDebt,
  standingOrdersDebt,
  openLoansCount,
  formatDebtILS,
  accent,
  accentSoft,
  surface,
  softBorder,
  isDark,
}: UserDebtsSectionProps) => (
  <>
    <SectionTitle align="center">החובות שלך</SectionTitle>

    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 5,
        background: surface,
        border: softBorder,
        backdropFilter: "blur(8px)",
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 3,
              bgcolor: accentSoft,
              color: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WarningAmberRoundedIcon fontSize="small" />
          </Box>

          <Box textAlign="center">
            <Typography variant="subtitle2" fontWeight={900} textAlign="center">
              סה"כ חוב פתוח
            </Typography>

            <Typography
              variant="h4"
              fontWeight={900}
              color={totalDebt > 0 ? "#ef4444" : "text.primary"}
            >
              {formatDebtILS(totalDebt)}
            </Typography>
          </Box>
        </Stack>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          פירוט לפי סוג: דמי חבר, הלוואות והחזרי הוראות קבע.
        </Typography>

        <Divider />

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <UserStatCard
              title="חוב בדמי חבר"
              value={formatDebtILS(monthlyDebt)}
              subtitle='יתרת חיוב חודשית לגמ"ח'
              icon="₪"
              centered
              accent={monthlyDebt > 0 ? "#ef4444" : accent}
              accentSoft={monthlyDebt > 0 ? "rgba(239,68,68,0.2)" : accentSoft}
              surface={debtCardSurface(isDark, monthlyDebt > 0, surface)}
              softBorder={debtCardBorder(isDark, monthlyDebt > 0, softBorder)}
              isDark={isDark}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <UserStatCard
              title="חוב בהלוואות"
              value={formatDebtILS(loansDebt)}
              subtitle={`${openLoansCount} הלוואות פתוחות`}
              icon="₪"
              centered
              accent={loansDebt > 0 ? "#ef4444" : accent}
              accentSoft={loansDebt > 0 ? "rgba(239,68,68,0.2)" : accentSoft}
              surface={debtCardSurface(isDark, loansDebt > 0, surface)}
              softBorder={debtCardBorder(isDark, loansDebt > 0, softBorder)}
              isDark={isDark}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <UserStatCard
              title="חוב בהחזרי הוראות קבע"
              value={formatDebtILS(standingOrdersDebt)}
              subtitle="חיובים שחזרו"
              icon={<CurrencyExchangeIcon fontSize="small" />}
              centered
              accent={standingOrdersDebt > 0 ? "#ef4444" : accent}
              accentSoft={standingOrdersDebt > 0 ? "rgba(239,68,68,0.2)" : accentSoft}
              surface={debtCardSurface(isDark, standingOrdersDebt > 0, surface)}
              softBorder={debtCardBorder(isDark, standingOrdersDebt > 0, softBorder)}
              isDark={isDark}
            />
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  </>
);

export default UserDebtsSection;
