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
import { formatDate, parseDate } from "../../Admin/Hooks/genricFunction";
import { AppDispatch, RootState } from "../../store/store";
import { getOrdersReturnByUserId } from "../../store/features/admin/adminStandingOrderReturt";
import { getDonationByUserId } from "../../store/features/admin/adminDonationsSlice";
import { getAllDeposits } from "../../store/features/admin/adminDepositsSlice";
import { StatusGeneric } from "../../common/indexTypes";
import { getUserFinancialsByUserGuard } from "../../store/features/user/userFinancialSlice";

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
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const ordersReturn =
    useSelector(
      (s: RootState) => s.AdminStandingOrderReturnSlice.allOrdersReturn
    ) ?? [];
  const donations =
    useSelector((s: RootState) => s.AdminDonationsSlice.allDonations) ?? [];
  const deposits =
    useSelector((s: RootState) => s.AdminDepositsSlice.allDeposits) ?? [];
  const userFinancials = useSelector(
    (s: RootState) => s.UserFinancialSlice.data
  );
  const [openRegulations, setOpenRegulations] = useState(false);

  const user = authUser?.user;
  const userName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

  useEffect(() => {
    if (user?.id != null) {
      dispatch(getOrdersReturnByUserId(user.id));
      dispatch(getDonationByUserId(user.id));
      dispatch(getUserFinancialsByUserGuard());
      dispatch(
        getAllDeposits({
          page: 1,
          limit: 50,
          status: StatusGeneric.ACTIVE,
          userId: user.id,
        })
      );
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
    donations.forEach((d: any) => {
      const dt = parseDate(d?.date);
      if (!dt || dt < since) return;
      const amount = Number(d?.amount ?? 0) || 0;
      const action = String(d?.action ?? "").toLowerCase();
      total += action === "withdraw" ? -amount : amount;
    });

    return total;
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

  const activeDeposit = useMemo(() => {
    const active = deposits.filter((d) => d?.isActive);
    if (active.length === 0) return null;
    return active[0];
  }, [deposits]);

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
        <Stack spacing={1.5} position="relative" zIndex={1}>
          <Chip
            label="דף הבית"
            color="default"
            sx={{
              alignSelf: "flex-start",
              bgcolor: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontWeight: 700,
            }}
          />
          <Typography variant="h4" fontWeight={800}>
            ברוך הבא{userName ? `, ${userName}` : ""}
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, maxWidth: 640 }}>
            ריכוז מהיר של החובות, ההחזרים והדברים הטובים במקום אחד.
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
                color: "#0d47a1",
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
              }}
            >
              לאיזור אישי
            </Button>
            <Button
              component="a"
              href="#section-good"
              variant="outlined"
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                borderColor: "rgba(255,255,255,0.6)",
                color: "#fff",
                "&:hover": { borderColor: "#fff" },
              }}
            >
              הדברים הטובים
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight={800} mb={2}>
          חובות והחזרים
        </Typography>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {[
            {
              title: "חוב הלוואות",
              value: loansDebt,
              detail: `${openLoans.length} הלוואות פעילות`,
            },
            {
              title: "חוב חודשי",
              value: monthlyDebt,
              detail: "דמי חבר/החזר חודשי",
            },
            {
              title: "חוב הוראות קבע",
              value: standingOrdersDebt,
              detail: `${ordersReturn.filter((o) => !o.paid).length} הוראות פתוחות`,
            },
          ].map((card) => (
            <Grid item xs={12} md={4} key={card.title}>
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
                  {card.title}
                </Typography>
                <Typography variant="h5" fontWeight={800} mt={1}>
                  {formatILS(card.value)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.detail}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box id="section-good" sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight={800} mb={2}>
          הדברים הטובים
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: "100%" }}>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={800}>
                  סטטוס חיובי ומה צפוי
                </Typography>
                <Divider />
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    יש לך הלוואות פתוחות?
                  </Typography>
                  <Typography variant="body1" fontWeight={800}>
                    {openLoans.length > 0
                      ? `כן, ${openLoans.length} הלוואות בסך ${formatILS(
                          loansDebt
                        )}`
                      : "אין הלוואות פתוחות"}
                  </Typography>
                </Stack>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    החיוב הבא
                  </Typography>
                  <Typography variant="body1" fontWeight={800}>
                    {nextChargeDate
                      ? `${formatDate(nextChargeDate)} • ${formatILS(
                          Math.abs(monthlyBalance)
                        )}`
                      : "לא הוגדר מועד חיוב"}
                  </Typography>
                </Stack>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    הפקדה פעילה
                  </Typography>
                  {activeDeposit ? (
                    <Typography variant="body1" fontWeight={800}>
                      {formatILS(activeDeposit.current_balance)} • החזר צפוי{" "}
                      {formatDate(parseDate(activeDeposit.end_date))}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      אין הפקדה פעילה כרגע.
                    </Typography>
                  )}
                </Stack>
                <Button
                  component={RouterLink}
                  to="/u/deposits"
                  variant="outlined"
                  sx={{ borderRadius: 3, fontWeight: 700, alignSelf: "flex-start" }}
                >
                  פירוט הפקדות
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: "100%" }}>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={800}>
                  תרומות ב-12 חודשים
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  סך נטו: {formatILS(last12MonthsDonations)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  סה״כ מאז הקמה:{" "}
                  {formatILS(userFinancials?.total_donations ?? 0)}
                </Typography>
                <Divider />
                <Grid container spacing={2}>
                  {monthlyDonationSeries.map((m) => {
                    const width = Math.round(
                      (Math.abs(m.value) / maxDonationMonth) * 100
                    );
                    return (
                      <Grid item xs={12} key={m.key}>
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
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Box flex={1}>
                <Typography variant="h6" fontWeight={800}>
                  שליחת הודעה
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  בקרוב נפתח כאן טופס פנייה מסודר אל הגמ״ח.
                </Typography>
              </Box>
              <Button
                variant="contained"
                disabled
                sx={{ borderRadius: 3, fontWeight: 700, height: 44 }}
              >
                טופס פנייה בקרוב
              </Button>
            </Stack>
            <Divider />
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
