import { useEffect, useMemo, useState } from "react";
import { Box, Grid, Paper, Stack, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import GemachRegulationsModal from "../../Admin/components/HomePage/GemachRegulationsModal";
import { formatILS } from "../../Admin/components/HomePage/HomePage";
import { formatDate } from "../../Admin/Hooks/genricFunction";
import { AppDispatch, RootState } from "../../store/store";
import { getUserFinancialsByUserGuard } from "../../store/features/user/userFinancialSlice";
import { getAllLoans } from "../../store/features/admin/adminLoanSlice";
import { StatusGeneric } from "../../common/indexTypes";
import { getAllMonthlyRanks } from "../../store/features/admin/adminRankSlice";
import UserHomeHero from "./components/UserHomePage/UserHomeHero";
import UserNextChargesSection from "./components/UserHomePage/UserNextChargesSection";
import UserDepositsLoansSection from "./components/UserHomePage/UserDepositsLoansSection";
import UserFullStatsSection from "./components/UserHomePage/UserFullStatsSection";
import UserRoleSection from "./components/UserHomePage/UserRoleSection";
import UserDebtsSection from "./components/UserHomePage/UserDebtsSection";

const UserHomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
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
  const primaryFirstName = (user?.first_name ?? "").trim();
  const primaryLastName = (user?.last_name ?? "").trim();
  const spouseFirstName = (user?.spouse_first_name ?? "").trim();
  const spouseLastName = (user?.spouse_last_name ?? "").trim();

  const userName = useMemo(() => {
    if (!spouseFirstName) {
      return `${primaryFirstName} ${primaryLastName}`.trim();
    }

    if (spouseLastName && spouseLastName !== primaryLastName) {
      return `${primaryFirstName} ו${spouseFirstName} ${primaryLastName}/${spouseLastName}`.trim();
    }

    return `${primaryFirstName} ו${spouseFirstName} ${primaryLastName}`.trim();
  }, [primaryFirstName, primaryLastName, spouseFirstName, spouseLastName]);

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

  const formatDebtILS = (value: number) => (value > 0 ? `-${formatILS(value)}` : formatILS(0));

  const monthlyBalance = user?.payment_details?.monthly_balance ?? 0;
  const monthlyDebt = monthlyBalance < 0 ? Math.abs(monthlyBalance) : 0;

  const loanBalances = user?.payment_details?.loan_balances ?? [];
  const openLoansBalances = loanBalances.filter((loan) => loan.balance < 0);
  const loansDebt = openLoansBalances.reduce((sum, loan) => sum + Math.abs(loan.balance), 0);

  const totalStandingOrderReturn = userFinancials?.total_standing_order_return_unpaid ?? 0;
  const standingOrdersDebt = totalStandingOrderReturn;

  const totalDebt = loansDebt + monthlyDebt + standingOrdersDebt;

  const nextChargeDate = useMemo(() => {
    const chargeDay = Number(user?.payment_details?.charge_date ?? 0);
    if (!chargeDay || chargeDay < 1 || chargeDay > 31) return null;
    const now = new Date();
    const candidate = new Date(now.getFullYear(), now.getMonth(), chargeDay);
    if (candidate < now) candidate.setMonth(candidate.getMonth() + 1);
    return candidate;
  }, [user?.payment_details?.charge_date]);

  const loanChargeSchedule = useMemo(() => {
    if (!allLoans || allLoans.length === 0) return [];
    const now = new Date();
    return allLoans
      .filter((loan) => loan?.isActive)
      .map((loan) => {
        const day = Number(loan?.payment_date ?? 0);
        if (day < 1 || day > 31) return null;
        const candidate = new Date(now.getFullYear(), now.getMonth(), day);
        if (candidate < now) candidate.setMonth(candidate.getMonth() + 1);
        return {
          id: loan.id,
          date: candidate,
          amount: Number(loan?.monthly_payment ?? 0),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a!.date.getTime() - b!.date.getTime())
      .map((item) => item!);
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
      (a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
    );
    const active = sorted.find((r) => new Date(r.effective_from) <= now);
    return active ?? sorted[0];
  }, [currentRole]);

  const totalDonations = userFinancials?.total_donations ?? 0;
  const totalEquityDonations = userFinancials?.total_equity_donations ?? 0;
  const totalSpecialFundDonations = userFinancials?.total_special_fund_donations ?? 0;
  const totalMemberFees = userFinancials?.total_monthly_deposits ?? 0;

  const totalLoansTaken = userFinancials?.total_loans_taken_amount ?? 0;
  const totalLoansRepaid = userFinancials?.total_loans_repaid ?? 0;
  const totalLoansCount = userFinancials?.total_loans_taken ?? 0;

  const totalFixedDepositsDeposited = userFinancials?.total_fixed_deposits_deposited ?? 0;
  const totalFixedDepositsWithdrawn = userFinancials?.total_fixed_deposits_withdrawn ?? 0;

  const totalCashHoldings = userFinancials?.total_cash_holdings ?? 0;

  const totalContributions = totalDonations + totalMemberFees;
  const activeLoansRemaining = (allLoans ?? [])
    .filter((loan) => loan.isActive)
    .reduce((sum, loan) => sum + (loan.remaining_balance ?? 0), 0);
  const loanUsagePercent =
    totalContributions > 0
      ? Math.min(100, Math.round((activeLoansRemaining / totalContributions) * 100))
      : 0;

  const depositsNowAmount = Math.max(0, totalFixedDepositsDeposited - totalFixedDepositsWithdrawn);
  const loansNowByTakenMinusRepaid = Math.max(0, totalLoansTaken - totalLoansRepaid);
  const donationExternalUrl = import.meta.env.VITE_DONATIONS_EXTERNAL_URL as
    | string
    | undefined;

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
      <UserHomeHero
        userName={userName}
        isDark={isDark}
        accent={accent}
        softBorder={softBorder}
        onLoanRequest={() => navigate("/u/loan-requests")}
        onDonate={() => {
          if (donationExternalUrl) {
            window.open(donationExternalUrl, "_blank", "noopener,noreferrer");
            return;
          }
          navigate("/u/donations");
        }}
        onOpenRegulations={() => setOpenRegulations(true)}
      />

      <Box sx={{ mt: 4, ...sectionSx }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <UserRoleSection
              title="הדרגה שלך"
              currentRoleName={currentRole?.name ?? null}
              currentRoleAmount={currentRoleRate?.amount ?? null}
              surface={surface}
              softBorder={softBorder}
              formatILS={formatILS}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={800} mb={1.2}>
              סך תרומות ודמי חבר
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
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={900}>
                    {formatILS(totalContributions)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    סה"כ תרומות: {formatILS(totalDonations)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    סה"כ דמי חבר: {formatILS(totalMemberFees)}
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    position: "relative",
                    width: 122,
                    height: 122,
                    borderRadius: "50%",
                    background: `conic-gradient(#22c55e ${loanUsagePercent}%, ${
                      isDark ? "rgba(148,163,184,0.28)" : "rgba(148,163,184,0.2)"
                    } 0)`,
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 9,
                      borderRadius: "50%",
                      background: isDark ? "#0f172a" : "#ffffff",
                      display: "grid",
                      placeItems: "center",
                      textAlign: "center",
                    }}
                    >
                    <Typography variant="h6" fontWeight={900}>
                      {loanUsagePercent}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      בהלוואות
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 4, ...sectionSx }}>
        <UserNextChargesSection
          nextChargeDate={nextChargeDate}
          currentRoleAmount={currentRoleRate?.amount ?? null}
          loanChargeSchedule={loanChargeSchedule}
          formatDate={formatDate}
          formatDebtILS={formatDebtILS}
          accent={accent}
          accentSoft={accentSoft}
          surface={surface}
          softBorder={softBorder}
          isDark={isDark}
        />
      </Box>

      <Box sx={{ mt: 4, ...sectionSx }}>
        <UserDepositsLoansSection
          depositsNowAmount={depositsNowAmount}
          totalFixedDepositsDeposited={totalFixedDepositsDeposited}
          totalFixedDepositsWithdrawn={totalFixedDepositsWithdrawn}
          loansNowByTakenMinusRepaid={loansNowByTakenMinusRepaid}
          totalLoansTaken={totalLoansTaken}
          totalLoansRepaid={totalLoansRepaid}
          accent={accent}
          accentSoft={accentSoft}
          surface={surface}
          softBorder={softBorder}
          isDark={isDark}
        />
      </Box>

      <Box sx={{ mt: 4, ...sectionSx }}>
        <UserDebtsSection
          totalDebt={totalDebt}
          monthlyDebt={monthlyDebt}
          loansDebt={loansDebt}
          standingOrdersDebt={standingOrdersDebt}
          openLoansCount={openLoansBalances.length}
          formatDebtILS={formatDebtILS}
          accent={accent}
          accentSoft={accentSoft}
          surface={surface}
          softBorder={softBorder}
          isDark={isDark}
        />
      </Box>

      <Box sx={{ mt: 4, ...sectionSx }}>
        <UserFullStatsSection
          surface={surface}
          softBorder={softBorder}
          cards={[
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
          ]}
        />
      </Box>

      {openRegulations && (
        <GemachRegulationsModal open={openRegulations} onClose={() => setOpenRegulations(false)} />
      )}
    </Box>
  );
};

export default UserHomePage;
