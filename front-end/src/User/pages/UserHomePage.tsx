import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import GemachRegulationsModal from "../../Admin/components/HomePage/GemachRegulationsModal";
import { formatILS } from "../../Admin/components/HomePage/HomePage";
import { formatDate } from "../../Admin/Hooks/genricFunction";
import { AppDispatch, RootState } from "../../store/store";
import { getUserFinancialsByUserGuard } from "../../store/features/user/userFinancialSlice";
import { getAllLoans } from "../../store/features/admin/adminLoanSlice";
import { StatusGeneric } from "../../common/indexTypes";
import { getAllMonthlyRanks } from "../../store/features/admin/adminRankSlice";

const UserHomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const accent = isDark ? "#fbbf24" : "#0f766e";
  const accentSoft = isDark ? "rgba(251,191,36,0.12)" : "rgba(15,118,110,0.12)";
  const surface = isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.9)";
  const softBorder = isDark
    ? "1px solid rgba(148,163,184,0.2)"
    : "1px solid rgba(15,23,42,0.08)";
  const sectionSx = {
    animation: "fadeUp 0.6s ease both",
    "@keyframes fadeUp": {
      from: { opacity: 0, transform: "translateY(12px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    },
  };
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const { allLoans } = useSelector((s: RootState) => s.AdminLoansSlice);
  const { monthlyRanks } = useSelector((s: RootState) => s.AdminRankSlice);
  const userFinancials = useSelector(
    (s: RootState) => s.UserFinancialSlice.data
  );
  const [openRegulations, setOpenRegulations] = useState(false);

  const user = authUser?.user;
  const userName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

  useEffect(() => {
    if (user?.id != null) {
      dispatch(getUserFinancialsByUserGuard());
      dispatch(
        getAllLoans({
          status: StatusGeneric.ACTIVE,
          userId: user.id,
        })
      );
      dispatch(getAllMonthlyRanks());
    }
  }, [dispatch, user?.id]);

  const monthlyBalance = user?.payment_details?.monthly_balance ?? 0;
  const monthlyDebt = monthlyBalance < 0 ? Math.abs(monthlyBalance) : 0;

  const loanBalances = user?.payment_details?.loan_balances ?? [];
  const openLoans = loanBalances.filter((loan) => loan.balance < 0);
  const loansDebt = loanBalances.reduce(
    (sum, loan) => sum + Math.abs(loan.balance),
    0
  );

  const nextChargeDate = useMemo(() => {
    const chargeDay = Number(user?.payment_details?.charge_date ?? 0);
    if (!chargeDay || chargeDay < 1 || chargeDay > 31) return null;
    const now = new Date();
    const candidate = new Date(now.getFullYear(), now.getMonth(), chargeDay);
    if (candidate < now) {
      candidate.setMonth(candidate.getMonth() + 1);
    }
    return candidate;
  }, [user?.payment_details?.charge_date]);
  const nextLoanCharge = useMemo(() => {
    if (!allLoans || allLoans.length === 0) return null;
    const now = new Date();
    const candidates = allLoans
      .filter((loan) => loan?.isActive)
      .map((loan) => {
        const day = Number(loan?.payment_date ?? 0);
        if (day < 1 || day > 31) return null;
        const candidate = new Date(now.getFullYear(), now.getMonth(), day);
        if (candidate < now) {
          candidate.setMonth(candidate.getMonth() + 1);
        }
        return {
          date: candidate,
          amount: Number(loan?.monthly_payment ?? 0),
        };
      })
      .filter(Boolean);
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => a!.date.getTime() - b!.date.getTime());
    return candidates[0];
  }, [allLoans]);
  const currentRoleId = user?.current_role?.id ?? null;
  const currentRole = useMemo(() => {
    if (!currentRoleId || !Array.isArray(monthlyRanks)) return null;
    return monthlyRanks.find((r) => r.id === currentRoleId) ?? null;
  }, [currentRoleId, monthlyRanks]);
  const currentRoleRate = useMemo(() => {
    if (!currentRole?.monthlyRates?.length) return null;
    const now = new Date();
    const sorted = [...currentRole.monthlyRates].sort(
      (a, b) =>
        new Date(b.effective_from).getTime() -
        new Date(a.effective_from).getTime()
    );
    const active = sorted.find((r) => new Date(r.effective_from) <= now);
    return active ?? sorted[0];
  }, [currentRole]);
  const totalDonations = userFinancials?.total_donations ?? 0;
  const totalLoansTaken = userFinancials?.total_loans_taken_amount ?? 0;
  const totalLoansRepaid = userFinancials?.total_loans_repaid ?? 0;
  const totalStandingOrderReturn =
    userFinancials?.total_standing_order_return ?? 0;
  const standingOrdersDebt = totalStandingOrderReturn;
  const totalFixedDeposits =
    (userFinancials?.total_fixed_deposits_deposited ?? 0) -
    (userFinancials?.total_fixed_deposits_withdrawn ?? 0);
  const totalMonthlyDeposits = userFinancials?.total_monthly_deposits ?? 0;
  const formatDebtILS = (value: number) =>
    value > 0 ? `-${formatILS(value)}` : formatILS(0);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 6 },
        px: { xs: 2, sm: 4, md: 6 },
        direction: "rtl",
        fontFamily: '"Assistant", "Heebo", Arial, sans-serif',
        background: isDark
          ? "radial-gradient(circle at 12% 8%, rgba(251,191,36,0.18), transparent 45%), radial-gradient(circle at 88% 10%, rgba(20,184,166,0.18), transparent 35%), linear-gradient(180deg, #0b1120 0%, #0f172a 70%)"
          : "radial-gradient(circle at 12% 8%, rgba(251,191,36,0.22), transparent 45%), radial-gradient(circle at 88% 10%, rgba(20,184,166,0.18), transparent 35%), linear-gradient(180deg, #f8fafc 0%, #ffffff 70%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 5,
          background: isDark
            ? "linear-gradient(135deg, rgba(13,71,161,0.9), rgba(15,23,42,0.96))"
            : "linear-gradient(135deg, rgba(14,116,144,0.95), rgba(13,71,161,0.9))",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          border: isDark
            ? "1px solid rgba(59,130,246,0.35)"
            : "1px solid rgba(14,116,144,0.35)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 360,
            height: 360,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.08)",
            top: -140,
            left: -100,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 240,
            height: 240,
            borderRadius: 80,
            bgcolor: "rgba(255,255,255,0.12)",
            bottom: -80,
            right: -40,
            transform: "rotate(12deg)",
          }}
        />
                <Stack spacing={1.5} position="relative" zIndex={1}>
          <Chip
            label='גמ"ח דיגיטלי'
            color="default"
            sx={{
              alignSelf: "flex-start",
              bgcolor: "rgba(255,255,255,0.24)",
              color: "#fff",
              fontWeight: 700,
            }}
          />
          <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>
            ברוך הבא{userName ? `, ${userName}` : ""}
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, maxWidth: 640 }}>
            כאן אפשר לראות את המצב הפיננסי שלך ולהמשיך בקלות לפעולות החשובות.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              component={RouterLink}
              to="/u/profile"
              variant="contained"
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                bgcolor: "#fff",
                color: "#0f172a",
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
              }}
            >
              פרופיל אישי
            </Button>
            <Button
              component={RouterLink}
              to="/u/overview"
              variant="outlined"
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                borderColor: "rgba(255,255,255,0.6)",
                color: "#fff",
                "&:hover": { borderColor: "#fff" },
              }}
            >
              לסקירה מלאה
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box sx={{ mt: 4, ...sectionSx }}>
        <Typography variant="h5" fontWeight={800} mb={2}>
          מצב החוב שלך
        </Typography>
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
                  fontWeight: 800,
                  fontSize: 18,
                }}
              >
                ₪
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  סה"כ חובות פתוחים
                </Typography>
                <Typography variant="h4" fontWeight={800}>
                  {formatDebtILS(loansDebt + monthlyDebt)}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              פירוט החוב לפי סוג: דמי חבר, הלוואות והחזרי הוראות קבע.
            </Typography>
            <Divider />
            <Grid container spacing={2}>
              {[
                {
                  title: "חוב דמי חבר",
                  value: monthlyDebt,
                  detail: "יתרת חיוב חודשית לגמ\"ח",
                },
                {
                  title: "חוב הלוואות",
                  value: loansDebt,
                  detail: `${openLoans.length} הלוואות פתוחות`,
                },
                {
                  title: "חוב החזרי הוראות קבע",
                  value: standingOrdersDebt,
                  detail: "חיובים שחזרו",
                },
              ].map((card) => (
                <Grid item xs={12} md={4} key={card.title}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      background: surface,
                      border: softBorder,
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 2,
                          bgcolor: accentSoft,
                          color: accent,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                        }}
                      >
                        ₪
                      </Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {card.title}
                      </Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight={800} mt={1.5}>
                      {formatDebtILS(card.value)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.detail}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Stack spacing={1}>
              <Typography variant="subtitle2" fontWeight={700}>
                מועד החיוב הבא להלוואה
              </Typography>
              <Typography variant="body1" fontWeight={800}>
                {nextLoanCharge
                  ? `${formatDate(nextLoanCharge.date)} • ${formatDebtILS(
                      Math.abs(nextLoanCharge.amount)
                    )}`
                  : "אין הלוואות פעילות"}
              </Typography>
              <Typography variant="subtitle2" fontWeight={700}>
                דמי חבר – החיוב הבא
              </Typography>
              <Typography variant="body1" fontWeight={800}>
                {nextChargeDate && currentRoleRate
                  ? `${formatDate(nextChargeDate)} • ${formatDebtILS(
                      Math.abs(currentRoleRate.amount)
                    )}`
                  : "לא מוגדר"}
              </Typography>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                component={RouterLink}
                to="/u/loans"
                variant="contained"
                sx={{
                  borderRadius: 3,
                  fontWeight: 700,
                  bgcolor: accent,
                  "&:hover": { bgcolor: accent },
                }}
              >
                לצפייה בהלוואות
              </Button>
              <Button
                component={RouterLink}
                to="/u/overview"
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  fontWeight: 700,
                  borderColor: accent,
                  color: accent,
                  "&:hover": { borderColor: accent },
                }}
              >
                לסקירה פיננסית
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      <Box sx={{ mt: 4, ...sectionSx }}>
        <Typography variant="h5" fontWeight={800} mb={2}>
          נתונים קצרים עבורך
        </Typography>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {[
            {
              title: "סה\"כ תרומות",
              value: totalDonations,
              detail: "מצטבר לכל התקופה",
            },
            {
              title: "הלוואות שנלקחו",
              value: totalLoansTaken,
              detail: "סה\"כ הלוואות לאורך זמן",
            },
            {
              title: "הלוואות שהוחזרו",
              value: totalLoansRepaid,
              detail: "החזרי הלוואות מצטברים",
            },
            {
              title: "פיקדונות נטו",
              value: totalFixedDeposits + totalMonthlyDeposits,
              detail: "פיקדונות קבועים וחודשיים",
            },
            {
              title: "הוראות קבע שחזרו",
              value: totalStandingOrderReturn,
              detail: "סה\"כ חיובים חוזרים",
            },
          ].map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.title}>
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
                  <Typography variant="subtitle2" fontWeight={700}>
                    {card.title}
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {card.value == null ? "לא הוגדר" : formatILS(card.value)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.detail}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mt: 4, ...sectionSx }}>
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
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Box flex={1}>
                <Typography variant="h6" fontWeight={800}>
                  רגולציה ונהלים
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  כללי הגמ\"ח מוצגים כאן וניתן לצפות במסמכי הנהלים.
                </Typography>
              </Box>
              <Button
                variant="contained"
                disabled
                sx={{ borderRadius: 3, fontWeight: 700, height: 44 }}
              >
                בקרוב: מסמכים
              </Button>
            </Stack>
            <Divider />
            <Box textAlign={{ xs: "center", md: "left" }}>
              <Button
                variant="contained"
                sx={{ borderRadius: 3, fontWeight: 800 }}
                onClick={() => setOpenRegulations(true)}
              >
                תקנון הגמ\"ח
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>


      {openRegulations && (
        <GemachRegulationsModal
          open={openRegulations}
          onClose={() => setOpenRegulations(false)}
        />
      )}
    </Box>
  );
};

export default UserHomePage;

































