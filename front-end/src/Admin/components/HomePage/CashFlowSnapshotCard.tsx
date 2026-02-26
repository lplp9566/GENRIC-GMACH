import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
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
    { name: "נכנס", value: incomeTotal, color: "#16a34a" },
    { name: "יצא", value: expenseTotal, color: "#dc2626" },
  ];

  return (
    <Card sx={{ mt: 4, borderRadius: 4 }}>
      <CardContent>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight={900}>
            תזרים נכנס/יצא
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant={mode === "month" ? "contained" : "outlined"}
              onClick={() => setMode("month")}
            >
              חודש אחרון
            </Button>
            <Button
              variant={mode === "year" ? "contained" : "outlined"}
              onClick={() => setMode("year")}
            >
              שנה אחרונה
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6} sx={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={84}
                  innerRadius={48}
                  paddingAngle={3}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatILS(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography sx={{ color: "#16a34a", fontWeight: 700 }}>
                נכנס: {formatILS(incomeTotal)}
              </Typography>
              <Typography sx={{ color: "#dc2626", fontWeight: 700 }}>
                יצא: {formatILS(expenseTotal)}
              </Typography>
              <Typography fontWeight={900}>נטו: {formatILS(incomeTotal - expenseTotal)}</Typography>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CashFlowSnapshotCard;
