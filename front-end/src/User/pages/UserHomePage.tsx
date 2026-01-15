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
import { parseDate, formatDate } from "../../Admin/Hooks/genricFunction";
import { AppDispatch, RootState } from "../../store/store";
import { getOrdersReturnByUserId } from "../../store/features/admin/adminStandingOrderReturt";
import { getDonationByUserId } from "../../store/features/admin/adminDonationsSlice";

const HEB_MONTHS = [
  "ינו",
  "פבר",
  "מרץ",
  "אפר",
  "מאי",
  "יונ",
  "יול",
  "אוג",
  "ספט",
  "אוק",
  "נוב",
  "דצמ",
];

const UserHomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const ordersReturn =
    useSelector(
      (s: RootState) => s.AdminStandingOrderReturnSlice.allOrdersReturn
    ) ?? [];
  const donations =
    useSelector((s: RootState) => s.AdminDonationsSlice.allDonations) ?? [];
  const [openRegulations, setOpenRegulations] = useState(false);

  const user = authUser?.user;
  const userName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    if (user?.id != null) {
      dispatch(getOrdersReturnByUserId(user.id));
      dispatch(getDonationByUserId(user.id));
    }
  }, [dispatch, user?.id]);

  const monthlyBalance = user?.payment_details?.monthly_balance ?? 0;
  const monthlyDebt = monthlyBalance < 0 ? Math.abs(monthlyBalance) : 0;

  const loanBalances = user?.payment_details?.loan_balances ?? [];
  const openLoans = loanBalances.filter((loan) => loan.balance < 0);
  const loansDebt = openLoans.reduce(
    (sum, loan) => sum + Math.abs(loan.balance),
    0
  );

  const standingOrdersDebt = useMemo(() => {
    return ordersReturn
      .filter((o) => !o.paid)
      .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  }, [ordersReturn]);

  const last12MonthsDonations = useMemo(() => {
    const now = new Date();
    const since = new Date(now);
    since.setMonth(now.getMonth() - 12);

    let total = 0;
    let count = 0;
    let net = 0;

    donations.forEach((d: any) => {
      const dt = parseDate(d?.date);
      if (!dt || dt < since) return;
      const amount = Number(d?.amount ?? 0) || 0;
      const action = String(d?.action ?? "").toLowerCase();
      if (action === "donation") total += amount;
      if (action === "withdraw") total += 0;
      net += action === "withdraw" ? -amount : amount;
      count += 1;
    });

    return { total, count, net };
  }, [donations]);

  const monthlyDonationSeries = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; value: number }[] = [];
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months.push({
        key,
        label: `${HEB_MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
        value: 0,
      });
    }

    donations.forEach((d: any) => {
      const dt = parseDate(d?.date);
      if (!dt) return;
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      const idx = months.findIndex((m) => m.key === key);
      if (idx === -1) return;
      const amount = Number(d?.amount ?? 0) || 0;
      const action = String(d?.action ?? "").toLowerCase();
      months[idx].value += action === "withdraw" ? -amount : amount;
    });

    return months;
  }, [donations]);

  const maxDonationMonth = Math.max(
    1,
    ...monthlyDonationSeries.map((m) => Math.abs(m.value))
  );

  const repaymentStatus = monthlyDebt === 0 ? "עמידה מלאה" : "חריגה";
  const repaymentHint =
    monthlyDebt === 0
      ? "כל ההחזרים החודשיים מאוזנים."
      : "נדרש טיפול באיזון החודשי.";

  const paymentMethod = String(user?.payment_details?.payment_method ?? "");
  const paymentMethodLabel = {
    direct_debit: "הוראת קבע",
    credit_card: "כרטיס אשראי",
    bank_transfer: "העברה בנקאית",
    cash: "מזומן",
    other: "אחר",
  }[paymentMethod] ?? "לא הוגדר";

  const joinDate = formatDate(parseDate(user?.join_date));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 6 },
        px: { xs: 2, sm: 4, md: 6 },
        direction: "rtl",
        fontFamily: "Heebo, Arial, sans-serif",
        background: isDark
          ? "radial-gradient(circle at 12% 8%, rgba(255,200,87,0.14), transparent 40%), radial-gradient(circle at 90% 12%, rgba(0,150,136,0.18), transparent 35%), linear-gradient(180deg, #0b1120 0%, #0f172a 65%)"
          : "radial-gradient(circle at 12% 8%, rgba(255,200,87,0.18), transparent 40%), radial-gradient(circle at 90% 12%, rgba(0,150,136,0.15), transparent 35%), linear-gradient(180deg, #f7f7fb 0%, #ffffff 65%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background: isDark
            ? "linear-gradient(130deg, rgba(5,46,111,0.95), rgba(10,70,64,0.95))"
            : "linear-gradient(130deg, rgba(13,71,161,0.95), rgba(0,150,136,0.92))",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 320,
            height: 320,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.08)",
            top: -120,
            left: -80,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: 6,
            bgcolor: "rgba(255,255,255,0.12)",
            bottom: -60,
            right: -40,
            transform: "rotate(12deg)",
          }}
        />
        <Stack spacing={1.5} position="relative" zIndex={1}>
          <Chip
            label="איזור אישי"
            color="default"
            sx={{
              alignSelf: "flex-start",
              bgcolor: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontWeight: 700,
            }}
          />
          <Typography variant="h4" fontWeight={800}>
            מרכז שליטה אישי{userName ? `, ${userName}` : ""}
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, maxWidth: 640 }}>
            מסך אחד שמרכז את מצב ההחזרים, תרומות, הלוואות והוראות קבע שלך.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              component="a"
              href="#section-overview"
              variant="contained"
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                bgcolor: "#fff",
                color: "#0d47a1",
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
              }}
            >
              קפיצה לתמונה שנתית
            </Button>
            <Button
              component="a"
              href="#section-loans"
              variant="outlined"
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                borderColor: "rgba(255,255,255,0.6)",
                color: "#fff",
                "&:hover": { borderColor: "#fff" },
              }}
            >
              מצב הלוואות והחזרים
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box id="section-overview" sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight={800} mb={2}>
          תמונת מצב שנתית
        </Typography>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                background: isDark
                  ? "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(30,41,59,0.9))"
                  : "linear-gradient(135deg, rgba(255,196,87,0.18), rgba(255,246,196,0.6))",
                border: isDark
                  ? "1px solid rgba(245,158,11,0.3)"
                  : "1px solid rgba(245,158,11,0.25)",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                תרומות 12 חודשים
              </Typography>
              <Typography variant="h5" fontWeight={800} mt={1}>
                {formatILS(last12MonthsDonations.total)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {last12MonthsDonations.count} פעולות נטו{" "}
                {formatILS(last12MonthsDonations.net)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                background: isDark
                  ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(30,41,59,0.9))"
                  : "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(224,242,254,0.7))",
                border: isDark
                  ? "1px solid rgba(59,130,246,0.35)"
                  : "1px solid rgba(59,130,246,0.2)",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                הלוואות פתוחות
              </Typography>
              <Typography variant="h5" fontWeight={800} mt={1}>
                {openLoans.length} הלוואות
              </Typography>
              <Typography variant="body2" color="text.secondary">
                יתרה כוללת: {formatILS(loansDebt)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                background: isDark
                  ? "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(30,41,59,0.9))"
                  : "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(220,252,231,0.7))",
                border: isDark
                  ? "1px solid rgba(34,197,94,0.35)"
                  : "1px solid rgba(34,197,94,0.2)",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                מצב החזר חודשי
              </Typography>
              <Typography variant="h5" fontWeight={800} mt={1}>
                {repaymentStatus}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {monthlyDebt === 0
                  ? "אין חוב חודשי פתוח"
                  : `יתרת חוב: ${formatILS(monthlyDebt)}`}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                background: isDark
                  ? "linear-gradient(135deg, rgba(244,63,94,0.2), rgba(30,41,59,0.9))"
                  : "linear-gradient(135deg, rgba(244,63,94,0.12), rgba(255,228,230,0.7))",
                border: isDark
                  ? "1px solid rgba(244,63,94,0.35)"
                  : "1px solid rgba(244,63,94,0.2)",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                הוראות קבע פתוחות
              </Typography>
              <Typography variant="h5" fontWeight={800} mt={1}>
                {ordersReturn.filter((o) => !o.paid).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                יתרת חיוב: {formatILS(standingOrdersDebt)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box id="section-donations" sx={{ mt: 4 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              spacing={1.5}
            >
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  תרומות בשנה האחרונה
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  מגמת תרומות לפי חודשים (נטו, כולל משיכות).
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to="/u/donations"
                variant="outlined"
                sx={{ borderRadius: 3, fontWeight: 700 }}
              >
                מעבר לכל התרומות
              </Button>
            </Stack>
            <Divider />
            <Grid container spacing={2}>
              {monthlyDonationSeries.map((m) => {
                const width = Math.round(
                  (Math.abs(m.value) / maxDonationMonth) * 100
                );
                return (
                  <Grid item xs={12} md={6} key={m.key}>
                    <Stack spacing={1}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="subtitle2" fontWeight={700}>
                          {m.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatILS(m.value)}
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          height: 10,
                          borderRadius: 6,
                          bgcolor: isDark
                            ? "rgba(148,163,184,0.25)"
                            : "rgba(15,23,42,0.08)",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            width: `${width}%`,
                            bgcolor:
                              m.value >= 0
                                ? "linear-gradient(90deg, #22c55e, #86efac)"
                                : "linear-gradient(90deg, #f43f5e, #fb7185)",
                          }}
                        />
                      </Box>
                    </Stack>
                  </Grid>
                );
              })}
            </Grid>
          </Stack>
        </Paper>
      </Box>

      <Box id="section-loans" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: "100%" }}>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={800}>
                  הלוואות והחזרים
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  מצב ההחזרים החודשי והלוואות פעילות במקום אחד.
                </Typography>
                <Divider />
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    סטטוס החזר חודשי
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background: isDark
                        ? monthlyDebt === 0
                          ? "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(30,41,59,0.9))"
                          : "linear-gradient(135deg, rgba(244,63,94,0.2), rgba(30,41,59,0.9))"
                        : monthlyDebt === 0
                        ? "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(240,253,244,0.9))"
                        : "linear-gradient(135deg, rgba(244,63,94,0.15), rgba(255,241,242,0.9))",
                      border: isDark
                        ? monthlyDebt === 0
                          ? "1px solid rgba(34,197,94,0.35)"
                          : "1px solid rgba(244,63,94,0.35)"
                        : monthlyDebt === 0
                        ? "1px solid rgba(34,197,94,0.2)"
                        : "1px solid rgba(244,63,94,0.2)",
                    }}
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {repaymentStatus}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {repaymentHint}
                      </Typography>
                      {monthlyDebt > 0 && (
                        <Typography variant="body2" fontWeight={700}>
                          יתרת חוב: {formatILS(monthlyDebt)}
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                </Stack>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    הלוואות פתוחות ({openLoans.length})
                  </Typography>
                  {openLoans.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      אין הלוואות פתוחות כרגע.
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {openLoans.map((loan) => (
                        <Grid item xs={12} md={6} key={loan.loanId}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              border: isDark
                                ? "1px solid rgba(148,163,184,0.25)"
                                : "1px solid rgba(15,23,42,0.08)",
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight={700}>
                              הלוואה #{loan.loanId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              יתרה פתוחה
                            </Typography>
                            <Typography variant="h6" fontWeight={800}>
                              {formatILS(Math.abs(loan.balance))}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Stack>
                <Button
                  component={RouterLink}
                  to="/u/loans"
                  variant="outlined"
                  sx={{ borderRadius: 3, fontWeight: 700, alignSelf: "flex-start" }}
                >
                  פירוט הלוואות מלא
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: "100%" }}>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={800}>
                  פרטי חיוב וניהול קשר
                </Typography>
                <Divider />
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      סוג תשלום
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {paymentMethodLabel}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      מועד חיוב חודשי
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {user?.payment_details?.charge_date ?? "לא הוגדר"}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      סטטוס חברות
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {user?.membership_type ?? "לא ידוע"}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      תאריך הצטרפות
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {joinDate || "לא הוגדר"}
                    </Typography>
                  </Stack>
                </Stack>
                <Divider />
                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    הוראות קבע פתוחות
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ordersReturn.filter((o) => !o.paid).length} הוראות פעילות
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {formatILS(standingOrdersDebt)}
                  </Typography>
                  <Button
                    component={RouterLink}
                    to="/u/standing-orders"
                    variant="outlined"
                    sx={{ borderRadius: 3, fontWeight: 700, alignSelf: "flex-start" }}
                  >
                    פירוט הוראות קבע
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box id="section-actions" sx={{ mt: 4 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={800}>
              פעולות מהירות
            </Typography>
            <Divider />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Button
                  component={RouterLink}
                  to="/u/payments"
                  variant="outlined"
                  fullWidth
                  sx={{ borderRadius: 3, fontWeight: 700, py: 1.5 }}
                >
                  צפייה בתשלומים
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  component={RouterLink}
                  to="/u/deposits"
                  variant="outlined"
                  fullWidth
                  sx={{ borderRadius: 3, fontWeight: 700, py: 1.5 }}
                >
                  הפקדות וחסכונות
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  component={RouterLink}
                  to="/u/statistics"
                  variant="outlined"
                  fullWidth
                  sx={{ borderRadius: 3, fontWeight: 700, py: 1.5 }}
                >
                  סטטיסטיקה שנתית
                </Button>
              </Grid>
            </Grid>
            <Box textAlign={{ xs: "center", md: "left" }}>
              <Button
                variant="contained"
                sx={{ borderRadius: 3, fontWeight: 800 }}
                onClick={() => setOpenRegulations(true)}
              >
                תקנון הגמ״ח
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
