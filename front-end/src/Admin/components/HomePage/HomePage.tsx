import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography, Button, Paper } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Group,
  MonetizationOn,
  VolunteerActivism,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { getFundsOverview } from "../../../store/features/admin/adminFundsOverviewSlice";
import LoadingIndicator from "../StatusComponents/LoadingIndicator";
import GemachRegulationsModal from "./GemachRegulationsModal";
import { AddPaymentModal } from "../MonthlyPayments/AddMonthlyPayment/AddMonthlyPayment";
import { setMonthlyPaymentModalMode } from "../../../store/features/Main/AppMode";
import NewDepositModal from "../Deposits/newDeposit/newDeposit";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SavingsIcon from "@mui/icons-material/Savings";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DebtCards from "./DebtCards";

export const formatILS = (value?: number | string | null) => {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  if (!Number.isFinite(n)) return "₪0.00";
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(getFundsOverview());
  }, [dispatch]);

  const paymentModal = useSelector(
    (state: RootState) => state.mapModeSlice.MonthlyPaymentModalMode
  );
  const depositModal = useSelector(
    (state: RootState) => state.mapModeSlice.AddDepositModal
  );
  const { fundsOverview, status } = useSelector(
    (s: RootState) => s.AdminFundsOverviewReducer
  );
  // const allLoans = useSelector((state:RootState)=> state.AdminLoansSlice.allLoans)
  const allUsers =
    useSelector((state: RootState) => state.AdminUsers.allUsers) ?? [];

  const totalNegativeBalance = useMemo(() => {
    return allUsers
      .filter((u) => u.payment_details.monthly_balance < 0)
      .reduce((sum, u) => sum + Math.abs(u.payment_details.monthly_balance), 0);
  }, [allUsers]);

  const totalLoansDebt = useMemo(() => {
    return allUsers.reduce((usersSum, user) => {
      const loans = user.payment_details?.loan_balances ?? [];

      const userDebt = loans
        .filter((loan) => loan.balance < 0)
        .reduce((sum, loan) => sum + Math.abs(loan.balance), 0);

      return usersSum + userDebt;
    }, 0);
  }, [allUsers]);

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const quickActions = [
    {
      label: "תשלום דמי חבר",
      description: "רישום תשלום דמי חבר",
      icon: <AccountBalanceWallet />,
      onclick: () => dispatch(setMonthlyPaymentModalMode(true)),
    },
    {
      label: "משתמש",
      description: "הוספת משתמש חדש",
      icon: <Group />,
      onclick: () => navigate("/users/new"),
    },
    {
      label: "תרומה",
      description: "רישום תרומה חדשה",
      icon: <VolunteerActivism />,
    },
    {
      label: "הלוואה",
      description: "יצירת הלוואה חדשה",
      icon: <MonetizationOn />,
      onclick: () => navigate("/loans/new"),
    },
  ];

  const stats = [
    {
      label: "סכום זמין",
      value: formatILS(fundsOverview?.available_funds),
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />,
      colorKey: "secondary" as const,
    },
    {
      label: 'קרן הגמ"ח',
      value: formatILS(fundsOverview?.fund_principal),
      icon: <SavingsIcon sx={{ fontSize: 40 }} />,
      colorKey: "success" as const,
    },
    {
      label: "הון עצמי",
      value: formatILS(fundsOverview?.own_equity),
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      colorKey: "primary" as const,
    },
  ];

  return (
    <Box
      p={4}
      sx={(theme) => ({
        minHeight: "100vh",
        background:
          theme.palette.mode === "dark"
            ? `radial-gradient(1200px 600px at 50% -100px, ${alpha(
                theme.palette.primary.main,
                0.18
              )}, transparent 60%), ${theme.palette.background.default}`
            : theme.palette.background.default,
      })}
    >
      {status === "pending" && <LoadingIndicator />}

      {open && (
        <GemachRegulationsModal open={open} onClose={() => setOpen(false)} />
      )}

      {status === "fulfilled" && (
        <>
          {/* HERO */}
          <Box
            textAlign="center"
            py={6}
            sx={(theme) => ({
              borderRadius: 4,
              color: theme.palette.primary.contrastText,
              background:
                theme.palette.mode === "dark"
                  ? `linear-gradient(135deg,
                      ${alpha(theme.palette.primary.main, 0.35)},
                      ${alpha(theme.palette.success.main, 0.25)})`
                  : `linear-gradient(135deg,
                      ${theme.palette.primary.main},
                      ${theme.palette.success.main})`,
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 18px 40px rgba(0,0,0,0.35)"
                  : "0 18px 40px rgba(0,0,0,0.10)",
            })}
          >
            <Typography variant="h3" fontWeight={800} gutterBottom>
              מערכת ניהול גמ"ח אהבת חסד של משפחת פסיקוב
            </Typography>
          </Box>

          {/* STATS */}
          <Grid container spacing={4} mt={-6} justifyContent="center">
            {stats.map((s, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={(theme) => {
                    const main = theme.palette[s.colorKey].main;
                    return {
                      p: 3,
                      borderRadius: 4,
                      border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                      backgroundColor: theme.palette.background.paper,
                      overflow: "hidden",
                      position: "relative",
                      boxShadow:
                        theme.palette.mode === "dark"
                          ? "0 12px 30px rgba(0,0,0,0.35)"
                          : "0 12px 30px rgba(0,0,0,0.08)",
                      "&:before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        background: `radial-gradient(600px 200px at 0% 0%,
                          ${alpha(
                            main,
                            theme.palette.mode === "dark" ? 0.22 : 0.14
                          )},
                          transparent 60%)`,
                        pointerEvents: "none",
                      },
                    };
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                    sx={{ position: "relative" }}
                  >
                    <Box
                      sx={(theme) => {
                        const main = theme.palette[s.colorKey].main;
                        return {
                          width: 56,
                          height: 56,
                          borderRadius: 3,
                          display: "grid",
                          placeItems: "center",
                          backgroundColor: alpha(
                            main,
                            theme.palette.mode === "dark" ? 0.18 : 0.12
                          ),
                          color: main,
                        };
                      }}
                    >
                      {s.icon}
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {s.label}
                      </Typography>
                      <Typography variant="h5" fontWeight={900}>
                        {s.value}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {paymentModal && <AddPaymentModal cape={false} />}
          {depositModal && <NewDepositModal />}

          {/* QUICK ACTIONS */}
          <Box mt={10}>
            <Typography variant="h5" fontWeight={900} mb={2} textAlign="center">
              פעולות מהירות
            </Typography>
            <DebtCards
              monthlyDebt={totalNegativeBalance}
              loansDebt={totalLoansDebt}
            />

            {/* <Grid container spacing={3} justifyContent="center">
              {quickActions.map((action, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Paper
                    elevation={0}
                    sx={(theme) => ({
                      p: 3,
                      textAlign: "center",
                      borderRadius: 4,
                      border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                      backgroundColor: theme.palette.background.paper,
                      boxShadow:
                        theme.palette.mode === "dark"
                          ? "0 12px 30px rgba(0,0,0,0.35)"
                          : "0 12px 30px rgba(0,0,0,0.08)",
                    })}
                  >
                    <Box
                      sx={(theme) => ({
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        display: "grid",
                        placeItems: "center",
                        mx: "auto",
                        mb: 2,
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === "dark" ? 0.14 : 0.1
                        ),
                        color: theme.palette.primary.main,
                      })}
                    >
                      {action.icon}
                    </Box>

                    <Typography variant="h6" fontWeight={900}>
                      {action.label}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {action.description}
                    </Typography>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={action.onclick}
                      sx={(theme) => ({
                        borderRadius: 3,
                        fontWeight: 900,
                        boxShadow: "none",
                        background:
                          theme.palette.mode === "dark"
                            ? `linear-gradient(135deg,
                                ${alpha(theme.palette.primary.main, 0.85)},
                                ${alpha(theme.palette.success.main, 0.75)})`
                            : `linear-gradient(135deg,
                                ${theme.palette.primary.main},
                                ${theme.palette.success.main})`,
                        "&:hover": { boxShadow: "none" },
                      })}
                    >
                      כניסה
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid> */}
          </Box>

          {/* REGULATIONS */}
          <Box
            mt={10}
            textAlign="center"
            sx={(theme) => ({
              p: 4,
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
              backgroundColor: theme.palette.background.paper,
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 12px 30px rgba(0,0,0,0.35)"
                  : "0 12px 30px rgba(0,0,0,0.08)",
            })}
          >
            <Typography variant="h5" fontWeight={900} gutterBottom>
              תקנון הגמ"ח
            </Typography>
            <Typography variant="body1" color="text.secondary">
              קרא את תקנון הגמ"ח המלא כדי להכיר את כל הכללים והתנאים
            </Typography>

            <Button
              variant="contained"
              sx={{ mt: 2, borderRadius: 3, fontWeight: 900 }}
              onClick={() => setOpen(true)}
            >
              צפיה בתקנון
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default HomePage;
