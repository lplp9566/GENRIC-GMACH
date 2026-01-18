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
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

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
            כאן תוכל לראות את מצב ההלוואות, ההפקדות והתרומות, ולנהל את הפעילות שלך במהירות.
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
              לסקירה פיננסית
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box sx={{ mt: 4, ...sectionSx }}>
        <Typography variant="h5" fontWeight={800} mb={2}>
          התחייבויות פתוחות
        </Typography>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {[
            {
              title: "חוב הלוואות",
              value: loansDebt,
              detail: `${openLoans.length} הלוואות פתוחות`,
            },
            {
              title: "חיוב חודשי",
              value: monthlyDebt,
              detail: "חיוב חודשי לגמ\"ח",
            },
            {
              title: "הוראות קבע",
              value: standingOrdersDebt,
              detail: `${ordersReturn.filter((o) => !o.paid).length} הוראות קבע בהמתנה`,
            },
          ].map((card) => (
            <Grid item xs={12} md={4} key={card.title}>
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
                <Stack direction="row" spacing={1.5} alignItems="center">
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
                      fontWeight: 800,
                    }}
                  >
                    ₪
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {card.title}
                  </Typography>
                </Stack>
                <Typography variant="h5" fontWeight={800} mt={2}>
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

      <Box id="section-good" sx={{ mt: 4, ...sectionSx }}>
        <Typography variant="h5" fontWeight={800} mb={2}>
          תמונה כללית
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                height: "100%",
                background: surface,
                border: softBorder,
                backdropFilter: "blur(6px)",
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={800}>
                  סטטוס התחייבויות
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
                    מועד חיוב הבא
                  </Typography>
                  <Typography variant="body1" fontWeight={800}>
                    {nextChargeDate
                      ? `${formatDate(nextChargeDate)} • ${formatILS(
                          Math.abs(monthlyBalance)
                        )}`
                      : "אין מועד חיוב מוגדר"}
                  </Typography>
                </Stack>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    פיקדון פעיל
                  </Typography>
                  {activeDeposit ? (
                    <Typography variant="body1" fontWeight={800}>
                      {formatILS(activeDeposit.current_balance)} • סיום
                      {" "}
                      {formatDate(parseDate(activeDeposit.end_date))}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      אין פיקדון פעיל כרגע.
                    </Typography>
                  )}
                </Stack>
                <Button
                  component={RouterLink}
                  to="/u/deposits"
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    fontWeight: 700,
                    alignSelf: "flex-start",
                    borderColor: accent,
                    color: accent,
                    "&:hover": { borderColor: accent },
                  }}
                >
                  לצפייה בהפקדות
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                height: "100%",
                background: surface,
                border: softBorder,
                backdropFilter: "blur(6px)",
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={800}>
                  תרומות ב-12 חודשים אחרונים
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  סה"כ 12 חודשים: {formatILS(last12MonthsDonations)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  סה"כ כללי לתרומות: {formatILS(userFinancials?.total_donations ?? 0)}
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
                                background:
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
                  כללי הגמ"ח מוצגים כאן וניתן לצפות במסמכי הנהלים.
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
                תקנון הגמ"ח
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
