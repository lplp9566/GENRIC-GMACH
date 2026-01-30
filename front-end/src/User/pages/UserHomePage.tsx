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
  const userFinancials = useSelector((s: RootState) => s.UserFinancialSlice.data);

  const [openRegulations, setOpenRegulations] = useState(false);

  const user = authUser?.user;
  const userName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

  useEffect(() => {
    if (user?.id != null) {
      dispatch(getUserFinancialsByUserGuard());
      dispatch(
        getAllLoans({
          status: StatusGeneric.ALL,
          userId: user.id,
        })
      );
      dispatch(getAllMonthlyRanks());
    }
  }, [dispatch, user?.id]);

  // ===== Helpers =====
  const formatDebtILS = (value: number) => (value > 0 ? `-${formatILS(value)}` : formatILS(0));

  // ===== Membership / Monthly debt =====
  const monthlyBalance = user?.payment_details?.monthly_balance ?? 0;
  const monthlyDebt = monthlyBalance < 0 ? Math.abs(monthlyBalance) : 0;

  // ===== Loans debt from balances =====
  const loanBalances = user?.payment_details?.loan_balances ?? [];
  const openLoansBalances = loanBalances.filter((loan) => loan.balance < 0);
  const loansDebt = openLoansBalances.reduce((sum, loan) => sum + Math.abs(loan.balance), 0);

  // ===== Standing orders =====
  const totalStandingOrderReturn = userFinancials?.total_standing_order_return ?? 0;
  const standingOrdersDebt = totalStandingOrderReturn;

  // ===== Next membership charge =====
  const nextChargeDate = useMemo(() => {
    const chargeDay = Number(user?.payment_details?.charge_date ?? 0);
    if (!chargeDay || chargeDay < 1 || chargeDay > 31) return null;
    const now = new Date();
    const candidate = new Date(now.getFullYear(), now.getMonth(), chargeDay);
    if (candidate < now) candidate.setMonth(candidate.getMonth() + 1);
    return candidate;
  }, [user?.payment_details?.charge_date]);

  // ===== Next loan charge =====
  const nextLoanCharge = useMemo(() => {
    if (!allLoans || allLoans.length === 0) return null;
    const now = new Date();
    const candidates = allLoans
      .filter((loan) => loan?.isActive)
      .map((loan) => {
        const day = Number(loan?.payment_date ?? 0);
        if (day < 1 || day > 31) return null;
        const candidate = new Date(now.getFullYear(), now.getMonth(), day);
        if (candidate < now) candidate.setMonth(candidate.getMonth() + 1);
        return {
          date: candidate,
          amount: Number(loan?.monthly_payment ?? 0),
        };
      })
      .filter(Boolean) as Array<{ date: Date; amount: number }>;

    if (candidates.length === 0) return null;
    candidates.sort((a, b) => a.date.getTime() - b.date.getTime());
    return candidates[0];
  }, [allLoans]);

  // ===== Current role and rate =====
  const currentRoleId = user?.current_role?.id ?? null;

  const currentRole = useMemo(() => {
    if (!currentRoleId || !Array.isArray(monthlyRanks)) return null;
    return monthlyRanks.find((r) => r.id === currentRoleId) ?? null;
  }, [currentRoleId, monthlyRanks]);

  const currentRoleRate = useMemo(() => {
    if (!currentRole?.monthlyRates?.length) return null;
    const now = new Date();
    const sorted = [...currentRole.monthlyRates].sort(
      (a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
    );
    const active = sorted.find((r) => new Date(r.effective_from) <= now);
    return active ?? sorted[0];
  }, [currentRole]);

  // ===== Full stats =====
  const totalDonations = userFinancials?.total_donations ?? 0;
  const totalLoansTaken = userFinancials?.total_loans_taken_amount ?? 0;
  const totalLoansRepaid = userFinancials?.total_loans_repaid ?? 0;
  const totalEquityDonations = userFinancials?.total_equity_donations ?? 0;
  const totalSpecialFundDonations = userFinancials?.total_special_fund_donations ?? 0;
  const totalMemberFees = userFinancials?.total_monthly_deposits ?? 0;
  const totalLoansCount = userFinancials?.total_loans_taken ?? 0;
  const totalFixedDepositsDeposited = userFinancials?.total_fixed_deposits_deposited ?? 0;
  const totalFixedDepositsWithdrawn = userFinancials?.total_fixed_deposits_withdrawn ?? 0;
  const totalCashHoldings = userFinancials?.total_cash_holdings ?? 0;

  const activeLoans = (allLoans ?? []).filter((loan) => loan.isActive);
  const hasActiveLoans = activeLoans.length > 0;

  const totalDebt = loansDebt + monthlyDebt + standingOrdersDebt;

  // ===== UI Small Components =====
  const SectionTitle = ({ children }: { children: string }) => (
    <Typography variant="h5" fontWeight={800} mb={2}>
      {children}
    </Typography>
  );

  const Card = ({
    title,
    value,
    subtitle,
    tone = "neutral",
  }: {
    title: string;
    value: string;
    subtitle?: string;
    tone?: "neutral" | "accent";
  }) => (
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
              bgcolor: tone === "accent" ? accentSoft : isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.06)",
              color: tone === "accent" ? accent : isDark ? "#fff" : "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
            }}
          >
            ₪
          </Box>
          <Typography variant="subtitle2" fontWeight={800}>
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
      {/* ===== 1) HERO ===== */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 5,
          background: isDark
            ? "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.96))"
            : "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(241,245,249,0.96))",
          color: isDark ? "#f8fafc" : "#0f172a",
          position: "relative",
          overflow: "hidden",
          border: softBorder,
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
            sx={{
              alignSelf: "flex-start",
              bgcolor: isDark ? "rgba(255,255,255,0.16)" : "rgba(15,23,42,0.06)",
              color: isDark ? "#fff" : "#0f172a",
              fontWeight: 800,
            }}
          />
          <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: "-0.5px" }}>
            ברוך הבא{userName ? `, ${userName}` : ""}
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, maxWidth: 720 }}>
            כאן תראה את הדרגה שלך, החיובים הקרובים, החובות והנתונים המלאים — בצורה מסודרת.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              component={RouterLink}
              to="/u/profile"
              variant="contained"
              sx={{
                borderRadius: 3,
                fontWeight: 800,
                bgcolor: accent,
                color: "#fff",
                "&:hover": { bgcolor: accent },
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
                fontWeight: 800,
                borderColor: accent,
                color: accent,
                "&:hover": { borderColor: accent },
              }}
            >
              סקירה מלאה
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* ===== 2) CURRENT ROLE ===== */}
      <Box sx={{ mt: 4, ...sectionSx }}>
        <SectionTitle>הדרגה שלך</SectionTitle>
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
            <Typography variant="subtitle2" fontWeight={800}>
              הדרגה הנוכחית
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {currentRole?.name ?? "לא הוגדרה דרגה"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentRoleRate?.amount != null
                ? `תשלום חודשי לפי דרגה: ${formatILS(currentRoleRate.amount)}`
                : "תשלום חודשי לפי דרגה: לא הוגדר"}
            </Typography>
          </Stack>
        </Paper>
      </Box>

      {/* ===== 3) NEXT CHARGES ===== */}
      <Box sx={{ mt: 4, ...sectionSx }}>
        <SectionTitle>החיובים הקרובים</SectionTitle>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card
              title="דמי חבר – החיוב הבא"
              value={
                nextChargeDate && currentRoleRate
                  ? `${formatDate(nextChargeDate)} • ${formatDebtILS(Math.abs(currentRoleRate.amount))}`
                  : "לא מוגדר"
              }
              subtitle="חיוב חודשי לפי הדרגה"
              tone="accent"
            />
          </Grid>

          {hasActiveLoans && (
            <Grid item xs={12} md={6}>
              <Card
                title="הלוואה – החיוב הבא"
                value={
                  nextLoanCharge
                    ? `${formatDate(nextLoanCharge.date)} • ${formatDebtILS(Math.abs(nextLoanCharge.amount))}`
                    : "לא נמצא מועד חיוב"
                }
                subtitle="מוצג רק אם יש הלוואות פעילות"
                tone="accent"
              />
            </Grid>
          )}
        </Grid>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mt={2}>
          <Button
            component={RouterLink}
            to="/u/loans"
            variant="contained"
            sx={{
              borderRadius: 3,
              fontWeight: 800,
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
              fontWeight: 800,
              borderColor: accent,
              color: accent,
              "&:hover": { borderColor: accent },
            }}
          >
            לסקירה פיננסית
          </Button>
        </Stack>
      </Box>

      {/* ===== 4) DEPOSITS PLACEHOLDER ===== */}
      <Box sx={{ mt: 4, ...sectionSx }}>
        <SectionTitle>הפקדות</SectionTitle>
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
          <Typography variant="body2" color="text.secondary">
            כאן יהיה אזור להפקדות. (אתה אמרת שתוסיף לבד – השארתי מקום נקי ומוכן)
          </Typography>
        </Paper>
      </Box>

      {/* ===== 5) DEBTS ===== */}
      <Box sx={{ mt: 4, ...sectionSx }}>
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
                <Typography variant="subtitle2" fontWeight={800}>
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
                <Card
                  title='חוב דמי חבר'
                  value={formatDebtILS(monthlyDebt)}
                  subtitle='יתרת חיוב חודשית לגמ"ח'
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  title="חוב הלוואות"
                  value={formatDebtILS(loansDebt)}
                  subtitle={`${openLoansBalances.length} הלוואות פתוחות`}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  title="חוב החזרי הוראות קבע"
                  value={formatDebtILS(standingOrdersDebt)}
                  subtitle="חיובים שחזרו"
                />
              </Grid>
            </Grid>
          </Stack>
        </Paper>
      </Box>

      {/* ===== 6) FULL STATS ===== */}
      <Box sx={{ mt: 4, ...sectionSx }}>
        <SectionTitle>הנתונים המלאים</SectionTitle>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {[
            { title: 'סה"כ תרומות', value: totalDonations, detail: "מצטבר לכל התקופה", kind: "money" },
            { title: "תרומות רגילות", value: totalEquityDonations, detail: "תרומות רגילות מצטברות", kind: "money" },
            { title: "תרומות לקרנות מיוחדות", value: totalSpecialFundDonations, detail: "קרנות ייעודיות", kind: "money" },
            { title: "דמי חבר", value: totalMemberFees, detail: 'סה"כ דמי חבר', kind: "money" },
            { title: "סכום הלוואות שנלקחו", value: totalLoansTaken, detail: "סכום הלוואות לאורך זמן", kind: "money" },
            { title: "כמות הלוואות", value: totalLoansCount, detail: "מספר הלוואות מצטבר", kind: "count" },
            { title: "סכום הלוואות שנפרעו", value: totalLoansRepaid, detail: "החזרים מצטברים", kind: "money" },
            { title: "הפקדות קבועות", value: totalFixedDepositsDeposited, detail: 'סה"כ הפקדות', kind: "money" },
            { title: "משיכות מהפקדות", value: totalFixedDepositsWithdrawn, detail: 'סה"כ משיכות', kind: "money" },
            { title: "החזרים בהוראות קבע", value: totalStandingOrderReturn, detail: "חיובים שחזרו", kind: "money" },
            { title: "אחזקה במזומן", value: totalCashHoldings, detail: "יתרה נוכחית", kind: "money" },
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
                  <Typography variant="subtitle2" fontWeight={800}>
                    {card.title}
                  </Typography>

                  <Typography variant="h6" fontWeight={900}>
                    {card.value == null
                      ? "לא הוגדר"
                      : card.kind === "count"
                      ? Number(card.value ?? 0).toLocaleString("he-IL")
                      : formatILS(card.value)}
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

      {/* ===== 7) REGULATIONS ===== */}
      <Box sx={{ mt: 4, ...sectionSx }}>
        <SectionTitle>תקנון ונהלים</SectionTitle>

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
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
              <Box flex={1}>
                <Typography variant="h6" fontWeight={900}>
                  רגולציה ונהלים
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  כללי הגמ"ח מוצגים כאן וניתן לצפות בתקנון.
                </Typography>
              </Box>

              <Button
                variant="contained"
                disabled
                sx={{ borderRadius: 3, fontWeight: 800, height: 44 }}
              >
                בקרוב: מסמכים
              </Button>
            </Stack>

            <Divider />

            <Box textAlign={{ xs: "center", md: "left" }}>
              <Button
                variant="contained"
                sx={{
                  borderRadius: 3,
                  fontWeight: 900,
                  bgcolor: accent,
                  "&:hover": { bgcolor: accent },
                }}
                onClick={() => setOpenRegulations(true)}
              >
                תקנון הגמ"ח
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {openRegulations && (
        <GemachRegulationsModal open={openRegulations} onClose={() => setOpenRegulations(false)} />
      )}
    </Box>
  );
};

export default UserHomePage;
