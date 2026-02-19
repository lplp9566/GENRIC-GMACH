import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
} from "@mui/material";
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
import {
  getBankCurrent,
  createBankCurrent,
  updateBankCurrent,
  deleteBankCurrent,
} from "../../../store/features/admin/adminBankCurrentSlice";
import LoadingIndicator from "../StatusComponents/LoadingIndicator";
import GemachRegulationsModal from "./GemachRegulationsModal";
import { AddPaymentModal } from "../MonthlyPayments/AddMonthlyPayment/AddMonthlyPayment";
import { setMonthlyPaymentModalMode } from "../../../store/features/Main/AppMode";
import NewDepositModal from "../Deposits/newDeposit/newDeposit";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DebtCards from "./DebtCards";
import { getAllUsers } from "../../../store/features/admin/adminUsersSlice";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmModal from "../genricComponents/confirmModal";
import AiChatDialog from "./AiChatDialog";
import { RtlThemeProvider } from "../../../Theme/rtl";

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
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const permission = authUser?.permission ?? authUser?.user?.permission;
  const canWrite = Boolean(authUser?.is_admin || permission === "admin_write");
  useEffect(() => {
    dispatch(getFundsOverview());
    dispatch(getAllUsers({ isAdmin: false }));
    dispatch(getBankCurrent());
  }, [dispatch]);
const name = import.meta.env.VITE_NAME 
  const family = import.meta.env.VITE_FAMILY
  const paymentModal = useSelector(
    (state: RootState) => state.mapModeSlice.MonthlyPaymentModalMode
  );
  const depositModal = useSelector(
    (state: RootState) => state.mapModeSlice.AddDepositModal
  );
  const { fundsOverview, status } = useSelector(
    (s: RootState) => s.AdminFundsOverviewReducer
  );
  const { items: bankCurrentItems } = useSelector(
    (s: RootState) => s.AdminBankCurrentSlice
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
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [bankDialogMode, setBankDialogMode] = useState<"create" | "edit">(
    "create"
  );
  const [bankDeleteOpen, setBankDeleteOpen] = useState(false);
  const [bankForm, setBankForm] = useState({
    bank_name: "",
    date: "",
    amount: "",
  });

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
  console.log(quickActions);
  

  const latestBankCurrent = bankCurrentItems[0] ?? null;

  const handleOpenBankDialog = (mode: "create" | "edit") => {
    setBankDialogMode(mode);
    if (mode === "edit" && latestBankCurrent) {
      setBankForm({
        bank_name: latestBankCurrent.bank_name ?? "",
        date: latestBankCurrent.date
          ? latestBankCurrent.date.toString().slice(0, 10)
          : "",
        amount: latestBankCurrent.amount?.toString?.() ?? "",
      });
    } else {
      setBankForm({ bank_name: "", date: "", amount: "" });
    }
    setBankDialogOpen(true);
  };

  const handleSubmitBankDialog = async () => {
    if (!bankForm.bank_name || !bankForm.date || !bankForm.amount) return;
    const payload = {
      bank_name: bankForm.bank_name,
      date: bankForm.date,
      amount: Number(bankForm.amount),
    };

    if (bankDialogMode === "create") {
      await dispatch(createBankCurrent(payload)).unwrap();
    } else if (latestBankCurrent) {
      await dispatch(
        updateBankCurrent({ id: latestBankCurrent.id, data: payload })
      ).unwrap();
    }

    setBankDialogOpen(false);
    dispatch(getBankCurrent());
  };

  const handleDeleteBankCurrent = async () => {
    if (!latestBankCurrent) return;
    await dispatch(deleteBankCurrent(latestBankCurrent.id)).unwrap();
    dispatch(getBankCurrent());
    setBankDeleteOpen(false);
  };

  const stats = [
    {
      label: "סכום זמין",
      value: formatILS(fundsOverview?.available_funds),
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />,
      colorKey: "secondary" as const,
    },
    {
      label: "קרן הגמ״ח",
      value: formatILS(fundsOverview?.fund_principal),
      icon: <AccountBalanceIcon sx={{ fontSize: 40 }} />,
      colorKey: "success" as const,
    },
    {
      label: "הון עצמי",
      value: formatILS(fundsOverview?.own_equity),
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      colorKey: "primary" as const,
    },
    {
      label: latestBankCurrent?.bank_name || "חשבון בנק",
      value: latestBankCurrent
        ? formatILS(latestBankCurrent.amount)
        : "אין נתונים",
      subValue: latestBankCurrent
        ? new Date(latestBankCurrent.date).toLocaleDateString("he-IL")
        : undefined,
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />,
      colorKey: "info" as const,
      isBankCard: true,
    },
  ];

  return (
    <Box
      p={{ xs: 2, sm: 4 }}
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
            py={{ xs: 4, sm: 6 }}
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
            <Typography
              variant="h3"
              fontWeight={800}
              gutterBottom
              sx={{ fontSize: { xs: 22, sm: 28, md: 34 } }}
            >
              ברוכים הבאים למערכת {name} של משפחת {family}
            </Typography>
            {/* <Button
              variant="contained"
              sx={{ mt: 2, borderRadius: 3, fontWeight: 900 }}
              onClick={() => setChatOpen(true)}
            >
              פתח צ׳אט AI
            </Button> */}
          </Box>

          {/* STATS */}
          <Grid
            container
            spacing={{ xs: 2, sm: 4 }}
            mt={{ xs: 2, sm: -6 }}
            justifyContent="center"
          >
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
                          alignItems:"center",
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

                    <Box >
                      <Typography   sx={{textAlign:"center"}}variant="body2" color="text.secondary">
                        {s.label}
                      </Typography>
                      <Typography sx={{textAlign:"center"}} variant="h5" fontWeight={900}>
                        {s.value}
                      </Typography>
                      {"subValue" in s && s.subValue && (
                        <Typography variant="body2" color="text.secondary">
                          {s.subValue}
                        </Typography>
                      )}
                      {"isBankCard" in s && s.isBankCard && canWrite && (
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                          {!latestBankCurrent ? (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleOpenBankDialog("create")}
                            >
                              הוספה
                            </Button>
                          ) : (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenBankDialog("edit")}
                                aria-label="עריכה"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setBankDeleteOpen(true)}
                                aria-label="מחיקה"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {paymentModal && <AddPaymentModal cape={false} />}
          {depositModal && <NewDepositModal />}
          <ConfirmModal
            open={bankDeleteOpen}
            onClose={() => setBankDeleteOpen(false)}
            onSubmit={handleDeleteBankCurrent}
            text="למחוק את חשבון הבנק?"
          />
          <Dialog
            open={bankDialogOpen}
            onClose={() => setBankDialogOpen(false)}
            fullWidth
            maxWidth="sm"
            PaperProps={{
              sx: (theme) => ({
                borderRadius: 6,
                overflow: "hidden",
                bgcolor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 24px 80px rgba(0,0,0,0.7)"
                    : "0 18px 40px rgba(0,0,0,0.15)",
              }),
            }}
          >
            <DialogTitle
              sx={(theme) => ({
                textAlign: "center",
                bgcolor: theme.palette.success.main,
                color: theme.palette.getContrastText(theme.palette.success.main),
                fontWeight: 800,
                fontSize: 22,
                py: 2.5,
              })}
            >
              {bankDialogMode === "create"
                ? "הוספת חשבון בנק"
                : "עריכת חשבון בנק"}
            </DialogTitle>
            <RtlThemeProvider>
            <DialogContent
              sx={(theme) => ({
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: 0,
                direction: "rtl",
                p: 3,
                bgcolor: theme.palette.background.paper,
              })}
            >
              <TextField
                sx={(theme) => ({
                  mt: 1,
                  "& .MuiInputLabel-root": { color: theme.palette.text.secondary },
                  "& .MuiOutlinedInput-root": {
                    color: theme.palette.text.primary,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.common.white, 0.04)
                        : alpha(theme.palette.common.black, 0.02),
                    borderRadius: 3,
                    "& fieldset": { borderColor: alpha(theme.palette.divider, 0.5) },
                    "&:hover fieldset": { borderColor: alpha(theme.palette.divider, 0.9) },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.success.main,
                    },
                  },
                })}
                label="שם הבנק"
                value={bankForm.bank_name}
                onChange={(e) =>
                  setBankForm((p) => ({ ...p, bank_name: e.target.value }))
                }
                fullWidth
              />
              <TextField
                sx={(theme) => ({
                  "& .MuiInputLabel-root": { color: theme.palette.text.secondary },
                  "& .MuiOutlinedInput-root": {
                    color: theme.palette.text.primary,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.common.white, 0.04)
                        : alpha(theme.palette.common.black, 0.02),
                    borderRadius: 3,
                    "& fieldset": { borderColor: alpha(theme.palette.divider, 0.5) },
                    "&:hover fieldset": { borderColor: alpha(theme.palette.divider, 0.9) },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.success.main,
                    },
                  },
                })}
                label="תאריך"
                type="date"
                value={bankForm.date}
                onChange={(e) => setBankForm((p) => ({ ...p, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                sx={(theme) => ({
                  "& .MuiInputLabel-root": { color: theme.palette.text.secondary },
                  "& .MuiOutlinedInput-root": {
                    color: theme.palette.text.primary,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.common.white, 0.04)
                        : alpha(theme.palette.common.black, 0.02),
                    borderRadius: 3,
                    "& fieldset": { borderColor: alpha(theme.palette.divider, 0.5) },
                    "&:hover fieldset": { borderColor: alpha(theme.palette.divider, 0.9) },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.success.main,
                    },
                  },
                })}
                label="סכום"
                inputMode="numeric"
                value={bankForm.amount}
                onChange={(e) => setBankForm((p) => ({ ...p, amount: e.target.value }))}
                fullWidth
              />
            </DialogContent>
            </RtlThemeProvider>
            <DialogActions
              sx={(theme) => ({
                px: 3,
                pb: 3,
                pt: 1,
                bgcolor: theme.palette.background.paper,
                display: "flex",
                justifyContent: "space-between",
              })}
            >

              <Button
                variant="contained"
                onClick={handleSubmitBankDialog}
                sx={(theme) => ({
                  bgcolor: theme.palette.success.main,
                  color: theme.palette.getContrastText(theme.palette.success.main),
                  borderRadius: 3,
                  px: 4,
                  "&:hover": { bgcolor: theme.palette.success.dark },
                })}
              >
                שמירה
              </Button>
                            <Button
                onClick={() => setBankDialogOpen(false)}
                sx={(theme) => ({ color: theme.palette.text.secondary })}
              >
                ביטול
              </Button>
            </DialogActions>
          </Dialog>
          <AiChatDialog open={chatOpen} onClose={() => setChatOpen(false)} />

          {/* QUICK ACTIONS */}
          <Box mt={{ xs: 6, sm: 10 }}>
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

          <Box
            mt={{ xs: 6, sm: 10 }}
            textAlign="center"
            sx={(theme) => ({
              p: { xs: 2, sm: 4 },
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
