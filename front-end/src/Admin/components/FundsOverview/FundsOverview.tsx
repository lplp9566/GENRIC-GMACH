import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store";
import { getFundsOverview } from "../../../store/features/admin/adminFundsOverviewSlice";
import { getAllFunds, getAllDonations } from "../../../store/features/admin/adminDonationsSlice";
import { getAllExpenses } from "../../../store/features/admin/adminExpensesSlice";
import { getAllLoanActions } from "../../../store/features/admin/adminLoanSlice";
import { gatAllMonthlyPayments } from "../../../store/features/admin/adminMonthlyPayments";
import { getAllDepositActions } from "../../../store/features/admin/adminDepositsSlice";
import { getAllOrdersReturn } from "../../../store/features/admin/adminStandingOrderReturt";
import { getAllInvestmentTransactions } from "../../../store/features/admin/adminInvestmentsSlice";
import LoadingIndicator from "../StatusComponents/LoadingIndicator";
import FundsOverviewGauge from "./FundsOverviewGauge/FundsOverviewGauge";
import FundsOverviewDefault from "./FundsOverviewDefault/FundsOverviewDefault";
import ErrorMessage from "../StatusComponents/ErrorMessage";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardOffIcon from "@mui/icons-material/CreditCardOff";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import MoneyOutlinedIcon from "@mui/icons-material/MoneyOutlined";
import { DepositActionsType } from "../Deposits/depositsDto";
import { InvestmentTransactionType } from "../Investments/InvestmentDto";
import { LoanPaymentActionType } from "../Loans/LoanDto";
import { MONTHS } from "../../Types";
import { parseDate } from "../../Hooks/genricFunction";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";

const formatILS = (value: number) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(value || 0);

const FundsOverview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [displayMode, setDisplayMode] = useState<"gauge" | "default">("default");
  const [yearFilter, setYearFilter] = useState<number[]>([]);
  const [monthFilter, setMonthFilter] = useState<number[]>([]);

  const { fundsOverview, status, error } = useSelector(
    (s: RootState) => s.AdminFundsOverviewReducer
  );

  const funds = useSelector((s: RootState) => s.AdminDonationsSlice.fundDonation);
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
    dispatch(getFundsOverview());
    dispatch(getAllFunds());
    dispatch(getAllDonations());
    dispatch(getAllExpenses());
    dispatch(getAllLoanActions());
    dispatch(gatAllMonthlyPayments());
    dispatch(getAllDepositActions());
    dispatch(getAllOrdersReturn());
    dispatch(getAllInvestmentTransactions());
  }, [dispatch]);

  const handleDisplayModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayMode(event.target.checked ? "gauge" : "default");
  };

  const matchesFilter = (dateLike: unknown) => {
    const d = parseDate(dateLike);
    if (!d) return false;
    if (yearFilter.length > 0 && !yearFilter.includes(d.getFullYear())) return false;
    if (monthFilter.length > 0 && !monthFilter.includes(d.getMonth())) return false;
    return true;
  };

  const allDates = useMemo(() => {
    const arr: unknown[] = [];
    (Array.isArray(donations) ? donations : []).forEach((x: any) => arr.push(x?.date));
    (Array.isArray(expenses) ? expenses : []).forEach((x: any) => arr.push(x?.expenseDate));
    (Array.isArray(loanActions) ? loanActions : []).forEach((x: any) => arr.push(x?.date));
    (Array.isArray(monthlyPayments) ? monthlyPayments : []).forEach((x: any) => arr.push(x?.deposit_date));
    (Array.isArray(depositActions) ? depositActions : []).forEach((x: any) => arr.push(x?.date));
    (Array.isArray(standingOrders) ? standingOrders : []).forEach((x: any) => {
      arr.push(x?.date);
      arr.push(x?.paid_at);
    });
    (Array.isArray(investmentTransactions) ? investmentTransactions : []).forEach((x: any) =>
      arr.push(x?.transaction_date)
    );
    return arr;
  }, [
    donations,
    expenses,
    loanActions,
    monthlyPayments,
    depositActions,
    standingOrders,
    investmentTransactions,
  ]);

  const years = useMemo(() => {
    const set = new Set<number>();
    allDates.forEach((raw) => {
      const d = parseDate(raw);
      if (d) set.add(d.getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [allDates]);

  const months = useMemo(() => {
    const set = new Set<number>();
    allDates.forEach((raw) => {
      const d = parseDate(raw);
      if (!d) return;
      if (yearFilter.length > 0 && !yearFilter.includes(d.getFullYear())) return;
      set.add(d.getMonth());
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [allDates, yearFilter]);

  useEffect(() => {
    setMonthFilter((prev) => {
      const next = prev.filter((m) => months.includes(m));
      if (next.length === prev.length && next.every((m, i) => m === prev[i])) {
        return prev;
      }
      return next;
    });
  }, [months]);

  const incomeTotal = useMemo(() => {
    const donationsIn = (Array.isArray(donations) ? donations : []).reduce((sum, d: any) => {
      if (String(d?.action ?? "").toLowerCase() !== "donation") return sum;
      if (!matchesFilter(d?.date)) return sum;
      return sum + (Number(d?.amount ?? 0) || 0);
    }, 0);

    const monthlyIn = (Array.isArray(monthlyPayments) ? monthlyPayments : []).reduce(
      (sum, p: any) => {
        if (!matchesFilter(p?.deposit_date)) return sum;
        return sum + (Number(p?.amount ?? 0) || 0);
      },
      0
    );

    const loansIn = (Array.isArray(loanActions) ? loanActions : []).reduce((sum, a: any) => {
      if (a?.action_type !== LoanPaymentActionType.PAYMENT) return sum;
      if (!matchesFilter(a?.date)) return sum;
      return sum + (Number(a?.value ?? 0) || 0);
    }, 0);

    const depositsIn = (Array.isArray(depositActions) ? depositActions : []).reduce(
      (sum, a: any) => {
        const type = (a?.action_type ?? a?.actionType) as DepositActionsType;
        if (type !== DepositActionsType.InitialDeposit && type !== DepositActionsType.AddToDeposit)
          return sum;
        if (!matchesFilter(a?.date)) return sum;
        return sum + (Number(a?.amount ?? 0) || 0);
      },
      0
    );

    const standingPaid = (Array.isArray(standingOrders) ? standingOrders : []).reduce(
      (sum, r: any) => {
        if (!r?.paid) return sum;
        const dateToUse = r?.paid_at ?? r?.date;
        if (!matchesFilter(dateToUse)) return sum;
        return sum + (Number(r?.amount ?? 0) || 0);
      },
      0
    );

    const investmentsIn = (
      Array.isArray(investmentTransactions) ? investmentTransactions : []
    ).reduce((sum, t: any) => {
      if (t?.transaction_type !== InvestmentTransactionType.WITHDRAWAL) return sum;
      if (!matchesFilter(t?.transaction_date)) return sum;
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
    yearFilter,
    monthFilter,
  ]);

  const expenseTotal = useMemo(() => {
    const donationsOut = (Array.isArray(donations) ? donations : []).reduce((sum, d: any) => {
      if (String(d?.action ?? "").toLowerCase() !== "withdraw") return sum;
      if (!matchesFilter(d?.date)) return sum;
      return sum + (Number(d?.amount ?? 0) || 0);
    }, 0);

    const expensesOut = (Array.isArray(expenses) ? expenses : []).reduce((sum, e: any) => {
      if (!matchesFilter(e?.expenseDate)) return sum;
      return sum + (Number(e?.amount ?? 0) || 0);
    }, 0);

    const loansOut = (Array.isArray(loanActions) ? loanActions : []).reduce((sum, a: any) => {
      if (
        a?.action_type !== LoanPaymentActionType.LOAN_CREATED &&
        a?.action_type !== LoanPaymentActionType.AMOUNT_CHANGE
      )
        return sum;
      if (!matchesFilter(a?.date)) return sum;
      return sum + (Number(a?.value ?? 0) || 0);
    }, 0);

    const depositsOut = (Array.isArray(depositActions) ? depositActions : []).reduce(
      (sum, a: any) => {
        const type = (a?.action_type ?? a?.actionType) as DepositActionsType;
        if (type !== DepositActionsType.RemoveFromDeposit) return sum;
        if (!matchesFilter(a?.date)) return sum;
        return sum + (Number(a?.amount ?? 0) || 0);
      },
      0
    );

    const standingUnpaid = (Array.isArray(standingOrders) ? standingOrders : []).reduce(
      (sum, r: any) => {
        if (r?.paid) return sum;
        if (!matchesFilter(r?.date)) return sum;
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
      )
        return sum;
      if (!matchesFilter(t?.transaction_date)) return sum;
      return sum + (Number(t?.amount ?? 0) || 0);
    }, 0);

    return donationsOut + expensesOut + loansOut + depositsOut + standingUnpaid + investmentsOut;
  }, [
    donations,
    expenses,
    loanActions,
    depositActions,
    standingOrders,
    investmentTransactions,
    yearFilter,
    monthFilter,
  ]);

  if (status === "pending" || !fundsOverview) {
    return <LoadingIndicator />;
  }

  if (status === "rejected" || error) {
    return <ErrorMessage errorMessage={error} />;
  }

  const items = [
    { label: "הון עצמי", value: fundsOverview.own_equity, Icon: AccountBalanceWalletIcon },
    { label: 'קרן הגמ"ח', value: fundsOverview.fund_principal, Icon: AccountBalanceWalletIcon },
    { label: "כסף נזיל", value: fundsOverview.available_funds, Icon: AttachMoneyIcon },
    { label: "בהלוואות", value: fundsOverview.total_loaned_out, Icon: AccountBalanceIcon },
    { label: "בהשקעות", value: fundsOverview.total_invested, Icon: AccountBalanceIcon },
    { label: "רווחי השקעות", value: fundsOverview.Investment_profits, Icon: AttachMoneyIcon },
    { label: "קרנות מיוחדות ברוטו", value: fundsOverview.special_funds_gross, Icon: PriceChangeIcon },
    { label: "קרנות מיוחדות נטו", value: fundsOverview.special_funds_net, Icon: PriceChangeIcon },
    { label: "דמי חבר", value: fundsOverview.monthly_deposits, Icon: AccountBalanceIcon },
    { label: "סך התרומות", value: fundsOverview.total_donations, Icon: AccountBalanceIcon },
    { label: "תרומות רגילות", value: fundsOverview.total_equity_donations, Icon: AccountBalanceIcon },
    { label: "פיקדונות", value: fundsOverview.total_user_deposits, Icon: AccountBalanceIcon },
    { label: 'החזרי הו"ק', value: fundsOverview.standing_order_return, Icon: MoneyOutlinedIcon },
    { label: "מזומן", value: fundsOverview.cash_holdings, Icon: AttachMoneyIcon },
    { label: "הוצאות", value: fundsOverview.total_expenses, Icon: CreditCardOffIcon },
  ];
  const max = fundsOverview.own_equity;
  const COLORS = ["#FF6B6B", "#4ECDC4", "#556270", "#C7F464", "#FFCC5C", "#96CEB4"];

  const pieData = [
    { name: "נכנס", value: incomeTotal, color: "#16a34a" },
    { name: "יצא", value: expenseTotal, color: "#dc2626" },
  ];

  return (
    <Box
      p={4}
      dir="rtl"
      fontFamily="Heebo, Arial, sans-serif"
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        padding: 0,
        overflowY: "auto",
        pb: 4,
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        fontWeight="bold"
        sx={{ textAlign: "center", justifyContent: "start", margin: 0, padding: 0 }}
      >
        מצב כולל של הגמ"ח
      </Typography>

      <Grid container justifyContent="center" alignItems="center" spacing={2} sx={{ mb: 3, margin: 0 }}>
        <Grid item>
          <Typography variant="body1" color={displayMode === "default" ? "primary.main" : "text.secondary"}>
            מצב רגיל
          </Typography>
        </Grid>

        <Grid item>
          <FormControlLabel
            control={
              <Switch
                checked={displayMode === "gauge"}
                onChange={handleDisplayModeChange}
                name="displayModeToggle"
                color="success"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: COLORS[1] },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: COLORS[1],
                  },
                }}
              />
            }
            label=""
            labelPlacement="start"
          />
        </Grid>

        <Grid item>
          <Typography variant="body1" color={displayMode === "gauge" ? "primary.main" : "text.secondary"}>
            מצב אחוזים
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ mb: 4 }}>
        {displayMode === "gauge" ? (
          <FundsOverviewGauge COLORS={COLORS} items={items} max={max} />
        ) : (
          <FundsOverviewDefault items={items} funds={funds} />
        )}
      </Box>

      <Card sx={{ mt: 6, mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={800}>
              הכנסות מול הוצאות
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="funds-income-year">שנה</InputLabel>
                <Select
                  multiple
                  labelId="funds-income-year"
                  label="שנה"
                  value={yearFilter.map(String)}
                  renderValue={(selected) => {
                    const vals = selected as string[];
                    if (vals.length === 0) return "הכל";
                    return vals.join(", ");
                  }}
                  onChange={(e) => {
                    const raw = e.target.value as string[];
                    if (raw.includes("all")) {
                      setYearFilter([]);
                      return;
                    }
                    setYearFilter(raw.map(Number));
                  }}
                >
                  <MenuItem value="all">
                    <Checkbox checked={yearFilter.length === 0} />
                    <ListItemText primary="הכל" />
                  </MenuItem>
                  {years.map((y) => (
                    <MenuItem key={y} value={String(y)}>
                      <Checkbox checked={yearFilter.includes(y)} />
                      <ListItemText primary={String(y)} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="funds-income-month">חודש</InputLabel>
                <Select
                  multiple
                  labelId="funds-income-month"
                  label="חודש"
                  value={monthFilter.map(String)}
                  renderValue={(selected) => {
                    const vals = (selected as string[]).map(Number);
                    if (vals.length === 0) return "הכל";
                    return vals.map((m) => MONTHS[m]).join(", ");
                  }}
                  onChange={(e) => {
                    const raw = e.target.value as string[];
                    if (raw.includes("all")) {
                      setMonthFilter([]);
                      return;
                    }
                    setMonthFilter(raw.map(Number));
                  }}
                >
                  <MenuItem value="all">
                    <Checkbox checked={monthFilter.length === 0} />
                    <ListItemText primary="הכל" />
                  </MenuItem>
                  {months.map((m) => (
                    <MenuItem key={m} value={String(m)}>
                      <Checkbox checked={monthFilter.includes(m)} />
                      <ListItemText primary={MONTHS[m]} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6} sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
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
              <Stack spacing={1.2}>
                <Typography fontWeight={700} sx={{ color: "#16a34a" }}>
                  נכנס: {formatILS(incomeTotal)}
                </Typography>
                <Typography fontWeight={700} sx={{ color: "#dc2626" }}>
                  יצא: {formatILS(expenseTotal)}
                </Typography>
                <Typography fontWeight={800}>נטו: {formatILS(incomeTotal - expenseTotal)}</Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FundsOverview;
