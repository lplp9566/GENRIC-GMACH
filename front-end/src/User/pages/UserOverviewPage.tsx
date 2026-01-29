import { useEffect } from "react";
import { Box, Grid, Paper, Stack, Typography, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { formatILS } from "../../Admin/components/HomePage/HomePage";
import LoadingIndicator from "../../Admin/components/StatusComponents/LoadingIndicator";
import ErrorMessage from "../../Admin/components/StatusComponents/ErrorMessage";
import { AppDispatch, RootState } from "../../store/store";
import { getAllMonthlyRanks } from "../../store/features/admin/adminRankSlice";
import { getUserFinancialsByUserGuard } from "../../store/features/user/userFinancialSlice";

const UserOverviewPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { data, status, error } = useSelector(
    (s: RootState) => s.UserFinancialSlice
  );
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const { monthlyRanks } = useSelector((s: RootState) => s.AdminRankSlice);

  useEffect(() => {
    dispatch(getUserFinancialsByUserGuard());
    dispatch(getAllMonthlyRanks());
  }, [dispatch]);
  const currentRoleId = authUser?.user?.current_role?.id ?? null;
  const currentRole = Array.isArray(monthlyRanks)
    ? monthlyRanks.find((r) => r.id === currentRoleId) ?? null
    : null;
  const currentRoleRate = (() => {
    if (!currentRole?.monthlyRates?.length) return null;
    const now = new Date();
    const sorted = [...currentRole.monthlyRates].sort(
      (a, b) =>
        new Date(b.effective_from).getTime() -
        new Date(a.effective_from).getTime()
    );
    const active = sorted.find((r) => new Date(r.effective_from) <= now);
    return active ?? sorted[0];
  })();
  if (status === "pending") {
    return <LoadingIndicator />;
  }

  if (status === "rejected") {
    return <ErrorMessage errorMessage={error || "שגיאה בטעינת הנתונים"} />;
  }

  const cards = [
    {
      label: `דרגה נוכחית (${currentRole?.name ?? "לא הוגדרה"})`,
      value: currentRoleRate?.amount ?? null,
      kind: "money",
    },
    { label: "סה\"כ תרומות", value: data?.total_donations ?? 0, kind: "money" },
    {
      label: "תרומות רגילות",
      value: data?.total_equity_donations ?? 0,
      kind: "money",
    },
    {
      label: "תרומות לקרנות מיוחדות",
      value: data?.total_special_fund_donations ?? 0,
      kind: "money",
    },
    {
      label: "דמי חבר",
      value: data?.total_monthly_deposits ?? 0,
      kind: "money",
    },
    {
      label: "סכום הלוואות שנלקחו",
      value: data?.total_loans_taken_amount ?? 0,
      kind: "money",
    },
    {
      label: "כמות הלוואות",
      value: data?.total_loans_taken ?? 0,
      kind: "count",
    },
    {
      label: "סכום הלוואות שנפרעו",
      value: data?.total_loans_repaid ?? 0,
      kind: "money",
    },
    {
      label: "הפקדות קבועות",
      value: data?.total_fixed_deposits_deposited ?? 0,
      kind: "money",
    },
    {
      label: "משיכות מהפקדות",
      value: data?.total_fixed_deposits_withdrawn ?? 0,
      kind: "money",
    },
    {
      label: "החזרים בהוראות קבע",
      value: data?.total_standing_order_return ?? 0,
      kind: "money",
    },
    {
      label: "אחזקה במזומן",
      value: data?.total_cash_holdings ?? 0,
      kind: "money",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
        direction: "rtl",
        fontFamily: "Heebo, Arial, sans-serif",
        background: isDark
          ? "linear-gradient(180deg, #0b1120 0%, #0f172a 70%)"
          : "linear-gradient(180deg, #f8fafc 0%, #ffffff 70%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: 4,
          background: isDark
            ? "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.85))"
            : "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(226,232,240,0.6))",
          border: isDark
            ? "1px solid rgba(148,163,184,0.2)"
            : "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={800} textAlign="center">
            ׳ ׳×׳•׳ ׳™׳ ׳›׳׳׳™׳™׳
          </Typography>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.label}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: isDark
                  ? "1px solid rgba(148,163,184,0.2)"
                  : "1px solid rgba(15,23,42,0.08)",
                background: isDark
                  ? "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.9))"
                  : "linear-gradient(135deg, rgba(226,232,240,0.6), rgba(255,255,255,0.9))",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} textAlign={"center"}>
                {card.label}
              </Typography>
              <Typography variant="h5" fontWeight={800} mt={1} textAlign={"center"}>
                {card.kind === "count"
                  ? Number(card.value ?? 0).toLocaleString("he-IL")
                   : (card.value == null ? "לא הוגדר" : formatILS(card.value))}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default UserOverviewPage;










