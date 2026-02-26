import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Card, CardContent, Grid, Stack, Typography, alpha } from "@mui/material";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store";
import { getAllDonations } from "../../../store/features/admin/adminDonationsSlice";
import { getAllExpenses } from "../../../store/features/admin/adminExpensesSlice";
import { getAllLoanActions } from "../../../store/features/admin/adminLoanSlice";
import { gatAllMonthlyPayments } from "../../../store/features/admin/adminMonthlyPayments";
import { getAllDepositActions } from "../../../store/features/admin/adminDepositsSlice";
import { getAllOrdersReturn } from "../../../store/features/admin/adminStandingOrderReturt";
import { getAllInvestmentTransactions } from "../../../store/features/admin/adminInvestmentsSlice";
import { DepositActionsType } from "../Deposits/depositsDto";
import { LoanPaymentActionType } from "../Loans/LoanDto";
import { InvestmentTransactionType } from "../Investments/InvestmentDto";
import { parseDate } from "../../Hooks/genricFunction";

type RangeMode = "month" | "year";

const formatILS = (value: number) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(value || 0);

const CashFlowSnapshotCard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [mode, setMode] = useState<RangeMode>("month");

  const donations = useSelector((s: RootState) => s.AdminDonationsSlice.allDonations);
  const expenses = useSelector((s: RootState) => s.AdminExpensesSlice.allExpenses);
  const loanActions = useSelector((s: RootState) => s.AdminLoansSlice.loanActions);
  const monthlyPayments = useSelector((s: RootState) => s.AdminMonthlyPaymentsSlice.allPayments);
  const depositActions = useSelector((s: RootState) => s.AdminDepositsSlice.allDepositActions);
  const standingOrders = useSelector(
    (s: RootState) => s.AdminStandingOrderReturnSlice.allOrdersReturn
  );
  const investmentTransactions = useSelector(
    (s: RootState) => s.AdminInvestmentsSlice.allInvestmentTransactions
  );

  useEffect(() => {
    dispatch(getAllDonations());
    dispatch(getAllExpenses());
    dispatch(getAllLoanActions());
    dispatch(gatAllMonthlyPayments());
    dispatch(getAllDepositActions());
    dispatch(getAllOrdersReturn());
    dispatch(getAllInvestmentTransactions());
  }, [dispatch]);

  const cutoffDate = useMemo(() => {
    const now = new Date();
    const d = new Date(now);
    if (mode === "month") d.setMonth(d.getMonth() - 1);
    else d.setFullYear(d.getFullYear() - 1);
    return d;
  }, [mode]);

  const inRange = (rawDate: unknown) => {
    const d = parseDate(rawDate);
    if (!d) return false;
    return d >= cutoffDate;
  };

  const incomeTotal = useMemo(() => {
    const donationsIn = (Array.isArray(donations) ? donations : []).reduce((sum, d: any) => {
      if (String(d?.action ?? "").toLowerCase() !== "donation") return sum;
      if (!inRange(d?.date)) return sum;
      return sum + (Number(d?.amount ?? 0) || 0);
    }, 0);

    const monthlyIn = (Array.isArray(monthlyPayments) ? monthlyPayments : []).reduce(
      (sum, p: any) => {
        if (!inRange(p?.deposit_date)) return sum;
        return sum + (Number(p?.amount ?? 0) || 0);
      },
      0
    );

    const loansIn = (Array.isArray(loanActions) ? loanActions : []).reduce((sum, a: any) => {
      if (a?.action_type !== LoanPaymentActionType.PAYMENT) return sum;
      if (!inRange(a?.date)) return sum;
      return sum + (Number(a?.value ?? 0) || 0);
    }, 0);

    const depositsIn = (Array.isArray(depositActions) ? depositActions : []).reduce(
      (sum, a: any) => {
        const type = (a?.action_type ?? a?.actionType) as DepositActionsType;
        if (type !== DepositActionsType.InitialDeposit && type !== DepositActionsType.AddToDeposit) {
          return sum;
        }
        if (!inRange(a?.date)) return sum;
        return sum + (Number(a?.amount ?? 0) || 0);
      },
      0
    );

    const standingPaid = (Array.isArray(standingOrders) ? standingOrders : []).reduce(
      (sum, r: any) => {
        if (!r?.paid) return sum;
        if (!inRange(r?.paid_at ?? r?.date)) return sum;
        return sum + (Number(r?.amount ?? 0) || 0);
      },
      0
    );

    const investmentsIn = (
      Array.isArray(investmentTransactions) ? investmentTransactions : []
    ).reduce((sum, t: any) => {
      if (t?.transaction_type !== InvestmentTransactionType.WITHDRAWAL) return sum;
      if (!inRange(t?.transaction_date)) return sum;
      return sum + (Number(t?.amount ?? 0) || 0);
    }, 0);

    return donationsIn + monthlyIn + loansIn + depositsIn + standingPaid + investmentsIn;
  }, [
    donations,
    monthlyPayments,
    loanActions,
    depositActions,
    standingOrders,
    investmentTransactions,
    cutoffDate,
  ]);

  const expenseTotal = useMemo(() => {
    const donationsOut = (Array.isArray(donations) ? donations : []).reduce((sum, d: any) => {
      if (String(d?.action ?? "").toLowerCase() !== "withdraw") return sum;
      if (!inRange(d?.date)) return sum;
      return sum + (Number(d?.amount ?? 0) || 0);
    }, 0);

    const expensesOut = (Array.isArray(expenses) ? expenses : []).reduce((sum, e: any) => {
      if (!inRange(e?.expenseDate)) return sum;
      return sum + (Number(e?.amount ?? 0) || 0);
    }, 0);

    const loansOut = (Array.isArray(loanActions) ? loanActions : []).reduce((sum, a: any) => {
      if (
        a?.action_type !== LoanPaymentActionType.LOAN_CREATED &&
        a?.action_type !== LoanPaymentActionType.AMOUNT_CHANGE
      ) {
        return sum;
      }
      if (!inRange(a?.date)) return sum;
      return sum + (Number(a?.value ?? 0) || 0);
    }, 0);

    const depositsOut = (Array.isArray(depositActions) ? depositActions : []).reduce(
      (sum, a: any) => {
        const type = (a?.action_type ?? a?.actionType) as DepositActionsType;
        if (type !== DepositActionsType.RemoveFromDeposit) return sum;
        if (!inRange(a?.date)) return sum;
        return sum + (Number(a?.amount ?? 0) || 0);
      },
      0
    );

    const standingUnpaid = (Array.isArray(standingOrders) ? standingOrders : []).reduce(
      (sum, r: any) => {
        if (r?.paid) return sum;
        if (!inRange(r?.date)) return sum;
        return sum + (Number(r?.amount ?? 0) || 0);
      },
      0
    );

    const investmentsOut = (
      Array.isArray(investmentTransactions) ? investmentTransactions : []
    ).reduce((sum, t: any) => {
      if (
        t?.transaction_type !== InvestmentTransactionType.INITIAL_INVESTMENT &&
        t?.transaction_type !== InvestmentTransactionType.ADDITIONAL_INVESTMENT
      ) {
        return sum;
      }
      if (!inRange(t?.transaction_date)) return sum;
      return sum + (Number(t?.amount ?? 0) || 0);
    }, 0);

    return donationsOut + expensesOut + loansOut + depositsOut + standingUnpaid + investmentsOut;
  }, [donations, expenses, loanActions, depositActions, standingOrders, investmentTransactions, cutoffDate]);

  const pieData = [
    { name: "נכנס", value: incomeTotal, color: "#18a957" },
    { name: "יצא", value: expenseTotal, color: "#e02424" },
  ];

  const net = incomeTotal - expenseTotal;

  return (
    <Card
      sx={(theme) => ({
        mt: 4,
        borderRadius: 6,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 18px 48px rgba(0,0,0,0.38)"
            : "0 18px 48px rgba(15,23,42,0.12)",
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(
                theme.palette.background.paper,
                0.78
              )})`
            : "linear-gradient(180deg, #ffffff, #f9fbff)",
      })}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack alignItems="center" spacing={1.2} sx={{ mb: 2.5 }}>
          <Typography variant="h6" fontWeight={900} textAlign="center">
            תזרים נכנס/יצא
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {mode === "month" ? "סיכום חודש אחרון" : "סיכום שנה אחרונה"}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            sx={(theme) => ({
              p: 0.6,
              borderRadius: 999,
              border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
              bgcolor: alpha(theme.palette.background.default, 0.5),
            })}
          >
            <Button
              size="small"
              variant={mode === "month" ? "contained" : "text"}
              onClick={() => setMode("month")}
              sx={{ borderRadius: 999, px: 2.5, fontWeight: 800 }}
            >
              חודש אחרון
            </Button>
            <Button
              size="small"
              variant={mode === "year" ? "contained" : "text"}
              onClick={() => setMode("year")}
              sx={{ borderRadius: 999, px: 2.5, fontWeight: 800 }}
            >
              שנה אחרונה
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2.5} alignItems="center" sx={{ direction: "ltr" }}>
          <Grid item xs={12} md={6}>
            <Grid container spacing={1.5} sx={{ direction: "rtl" }}>
              <Grid item xs={12}>
                <Box
                  sx={(theme) => ({
                    p: 2,
                    borderRadius: 3,
                    background: alpha("#18a957", theme.palette.mode === "dark" ? 0.16 : 0.1),
                  })}
                >
                  <Typography variant="body2" color="text.secondary">
                    נכנס
                  </Typography>
                  <Typography variant="h6" fontWeight={900} sx={{ color: "#18a957" }}>
                    {formatILS(incomeTotal)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={(theme) => ({
                    p: 2,
                    borderRadius: 3,
                    background: alpha("#e02424", theme.palette.mode === "dark" ? 0.18 : 0.09),
                  })}
                >
                  <Typography variant="body2" color="text.secondary">
                    יצא
                  </Typography>
                  <Typography variant="h6" fontWeight={900} sx={{ color: "#e02424" }}>
                    {formatILS(expenseTotal)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={(theme) => ({
                    p: 2,
                    borderRadius: 3,
                    border: `1px dashed ${alpha(theme.palette.divider, 0.9)}`,
                    bgcolor: alpha(theme.palette.background.default, 0.45),
                  })}
                >
                  <Typography variant="body2" color="text.secondary">
                    נטו תזרימי
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    sx={{ color: net >= 0 ? "#18a957" : "#e02424" }}
                  >
                    {formatILS(net)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6} sx={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={52}
                  paddingAngle={4}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatILS(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CashFlowSnapshotCard;
