import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography, Button, Paper } from "@mui/material";
import {
  Group,
  MonetizationOn,
  VolunteerActivism,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { getFundsOverview } from "../../../store/features/admin/adminFundsOverviewSlice";
import { RootState } from "../../../store/store";
import LoadingIndicator from "../StatusComponents/LoadingIndicator";
import GemachRegulationsModal from "./GemachRegulationsModal";
import { AddPaymentModal } from "../MonthlyPayments/AddMonthlyPayment/AddMonthlyPayment";
import { setMonthlyPaymentModalMode } from "../../../store/features/Main/AppMode";
import NewDepositModal from "../Deposits/newDeposit/newDeposit";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SavingsIcon from "@mui/icons-material/Savings";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const formatILS = (value?: number | string | null) => {
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
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { fundsOverview, status } = useSelector(
    (s: RootState) => s.AdminFundsOverviewReducer
  );
  
  const quickActions = [
    {
      label: "תשלום דמי חבר",
      description: "רישום תשלום דמי חבר",
      icon: <AccountBalanceWallet />,
      color: "linear-gradient(to right, #2563eb, #1db954)",
      onclick: () => dispatch(setMonthlyPaymentModalMode(true)),
    },
    {
      label: "משתמש",
      description: "הוספת משתמש חדש",
      icon: <Group />,
      color: "linear-gradient(to right, #00b4db, #0083b0)",
      onclick: () => navigate("/users/new"),
    },
    {
      label: "תרומה",
      description: "רישום תרומה חדשה",
      icon: <VolunteerActivism />,
      color: "linear-gradient(to right, #1db954, #00c853)",
    },
    {
      label: "הלוואה",
      description: "יצירת הלוואה חדשה",
      icon: <MonetizationOn />,
      color: "linear-gradient(to right, #2563eb, #4facfe)",
      onclick: () => navigate("/loans/new"),
    },
  ];
const stats = [
  {
    label: "סכום זמין",
    value: formatILS(fundsOverview?.available_funds),
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />,
    bgColor: "#7c3aed", // סגול עמוק
  },
  {
    label: "קרן הגמ\"ח",
    value: formatILS(fundsOverview?.fund_principal),
    icon: <SavingsIcon sx={{ fontSize: 40 }} />,
    bgColor: "#16a34a", // ירוק
  },
  {
    label: "הון עצמי",
    value: formatILS(fundsOverview?.own_equity),
    icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
    bgColor: "#2563eb", // כחול
  },
];



  return (
    <Box p={4} bgcolor="#e8f5e9">
      {status === "pending" && <LoadingIndicator />}
      {open && (
        <GemachRegulationsModal open={open} onClose={() => setOpen(false)} />
      )}
      {status === "fulfilled" && (
        <>
          <Box
            textAlign="center"
            py={6}
            bgcolor="linear-gradient(to right, #2563eb, #1db954)"
            color="#fff"
          >
            <Typography
              variant="h3"
              fontWeight={700}
              gutterBottom
              color="black"
            >
              מערכת ניהול גמ"ח אהבת חסד של משפחת פסיקוב
            </Typography>
          </Box>

          <Grid container spacing={4} mt={-6} justifyContent="center">
            {stats.map((s, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  sx={{
                    backgroundColor: s.bgColor,
                    color: "white",
                    p: 3,
                    borderRadius: 4,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box fontSize={40}>{s.icon}</Box>
                    <Box>
                      <Typography variant="body1">{s.label}</Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {s.value}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
          {paymentModal && <AddPaymentModal cape ={false} />}
          {depositModal && <NewDepositModal />}
          <Box mt={10}>
            <Typography variant="h5" fontWeight={700} mb={2} textAlign="center">
              פעולות מהירות
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              {quickActions.map((action, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Paper sx={{ p: 3, textAlign: "center", borderRadius: 4 }}>
                    <Box fontSize={40} mb={2}>
                      {action.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      {action.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {action.description}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ background: action.color }}
                      onClick={action.onclick}
                    >
                      כניסה
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box mt={10} textAlign="center">
            <Typography variant="h5" fontWeight={700} gutterBottom>
              תקנון הגמ"ח
            </Typography>
            <Typography variant="body1" color="text.secondary">
              קרא את תקנון הגמ"ח המלא כדי להכיר את כל הכללים והתנאים
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
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
