import { useEffect, useMemo, useState } from "react";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import GemachRegulationsModal from "../../Admin/components/HomePage/GemachRegulationsModal";
import { formatILS } from "../../Admin/components/HomePage/HomePage";
import { AppDispatch, RootState } from "../../store/store";
import { getOrdersReturnByUserId } from "../../store/features/admin/adminStandingOrderReturt";

const UserHomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const ordersReturn =
    useSelector(
      (s: RootState) => s.AdminStandingOrderReturnSlice.allOrdersReturn
    ) ?? [];
  const [openRegulations, setOpenRegulations] = useState(false);

  const user = authUser?.user;
  const userName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

  useEffect(() => {
    if (user?.id != null) {
      dispatch(getOrdersReturnByUserId(user.id));
    }
  }, [dispatch, user?.id]);

  const monthlyDebt = useMemo(() => {
    const balance = user?.payment_details?.monthly_balance ?? 0;
    return balance < 0 ? Math.abs(balance) : 0;
  }, [user?.payment_details?.monthly_balance]);

  const loansDebt = useMemo(() => {
    const loans = user?.payment_details?.loan_balances ?? [];
    return loans
      .filter((loan) => loan.balance < 0)
      .reduce((sum, loan) => sum + Math.abs(loan.balance), 0);
  }, [user?.payment_details?.loan_balances]);

  const standingOrdersDebt = useMemo(() => {
    return ordersReturn
      .filter((o) => !o.paid)
      .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  }, [ordersReturn]);

  const cards = [
    { title: "חובות דמי חבר", value: monthlyDebt },
    { title: "חובות בהלוואות", value: loansDebt },
    { title: "חובות של החזרי הוראת קבע", value: standingOrdersDebt },
  ];

  return (
    <Box sx={{ minHeight: "100vh", py: 4, px: { xs: 2, sm: 4 } }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          ברוכים הבאים{userName ? `, ${userName}` : ""}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          סיכום חובות אישי ותצוגת תקנות הגמח
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
        {cards.map((card) => {
          const hasDebt = card.value > 0;
          return (
            <Grid item xs={12} sm={6} md={4} key={card.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  color: "#fff",
                  textAlign: "center",
                  background: hasDebt
                    ? "linear-gradient(135deg, #ff3b5c, #ff7a59)"
                    : "linear-gradient(135deg, #1dbf73, #6ee7b7)",
                  boxShadow: "0 14px 32px rgba(0,0,0,0.2)",
                }}
              >
                <Typography variant="subtitle1" fontWeight={800}>
                  {card.title}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={900}
                  sx={{ mt: 1, letterSpacing: 0.2 }}
                >
                  {hasDebt ? formatILS(card.value) : "אין חוב"}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Box textAlign="center" mt={5}>
        <Button
          variant="contained"
          sx={{ borderRadius: 3, fontWeight: 800 }}
          onClick={() => setOpenRegulations(true)}
        >
          הצגת תקנות הגמח
        </Button>
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
