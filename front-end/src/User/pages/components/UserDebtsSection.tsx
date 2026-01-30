import { Box, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import SectionTitle from "./SectionTitle";
import UserStatCard from "./UserStatCard";

type Props = {
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
}: Props) => (
  <>
    <SectionTitle>החובות שלך</SectionTitle>

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
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
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
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            ₪
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={900}>
              סה"כ חוב פתוח
            </Typography>

            <Typography variant="h4" fontWeight={900}>
              {formatDebtILS(totalDebt)}
            </Typography>
          </Box>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          פירוט לפי סוג: דמי חבר, הלוואות והחזרי הוראות קבע.
        </Typography>

        <Divider />

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <UserStatCard
              title="חוב דמי חבר"
              value={formatDebtILS(monthlyDebt)}
              subtitle='יתרת חיוב חודשית לגמ"ח'
              accent={accent}
              accentSoft={accentSoft}
              surface={surface}
              softBorder={softBorder}
              isDark={isDark}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <UserStatCard
              title="חוב הלוואות"
              value={formatDebtILS(loansDebt)}
              subtitle={`${openLoansCount} הלוואות פתוחות`}
              accent={accent}
              accentSoft={accentSoft}
              surface={surface}
              softBorder={softBorder}
              isDark={isDark}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <UserStatCard
              title="חוב החזרי הוראות קבע"
              value={formatDebtILS(standingOrdersDebt)}
              subtitle="חיובים שחזרו"
              accent={accent}
              accentSoft={accentSoft}
              surface={surface}
              softBorder={softBorder}
              isDark={isDark}
            />
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  </>
);

export default UserDebtsSection;
