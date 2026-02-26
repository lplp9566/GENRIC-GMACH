import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { getAllDonations } from "../../store/features/admin/adminDonationsSlice";
import { getAllExpenses } from "../../store/features/admin/adminExpensesSlice";
import { getAllLoanActions } from "../../store/features/admin/adminLoanSlice";
import { gatAllMonthlyPayments } from "../../store/features/admin/adminMonthlyPayments";
import { getAllDepositActions } from "../../store/features/admin/adminDepositsSlice";
import { getAllOrdersReturn } from "../../store/features/admin/adminStandingOrderReturt";
import { getAllInvestmentTransactions } from "../../store/features/admin/adminInvestmentsSlice";
import { MONTHS } from "../Types";
import { parseDate } from "../Hooks/genricFunction";
import { LoanPaymentActionType } from "../components/Loans/LoanDto";
import { DepositActionsType } from "../components/Deposits/depositsDto";
import { InvestmentTransactionType } from "../components/Investments/InvestmentDto";

type FilterValue = "all" | number;

const formatILS = (value: number) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (raw: string | Date | null | undefined) => {
  const date = parseDate(raw);
  if (!date) return "—";
  return date.toLocaleDateString("he-IL");
};

const IncomeVsExpensesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [yearFilter, setYearFilter] = useState<FilterValue>("all");
  const [monthFilter, setMonthFilter] = useState<FilterValue>("all");

  const {
    allDonations,
    status: donationsStatus,
    error: donationsError,
  } = useSelector((s: RootState) => s.AdminDonationsSlice);
  const {
    allExpenses,
    getAllExpensesStatus: expensesStatus,
    error: expensesError,
  } = useSelector((s: RootState) => s.AdminExpensesSlice);
  const { loanActions, status: loansStatus, error: loansError } = useSelector(
    (s: RootState) => s.AdminLoansSlice
  );
  const { allPayments, GetPaymentsStatus, error: monthlyPaymentsError } = useSelector(
    (s: RootState) => s.AdminMonthlyPaymentsSlice
  );
  const { allDepositActions, depositActionsStatus, error: depositsError } = useSelector(
    (s: RootState) => s.AdminDepositsSlice
  );
  const { allOrdersReturn, status: standingOrdersStatus, error: standingOrdersError } =
    useSelector((s: RootState) => s.AdminStandingOrderReturnSlice);
  const {
    allInvestmentTransactions,
    getAllInvestmentTransactionsStatus,
    error: investmentsError,
  } = useSelector((s: RootState) => s.AdminInvestmentsSlice);

  useEffect(() => {
    if (donationsStatus === "idle") {
      dispatch(getAllDonations());
    }
    if (expensesStatus === "idle") {
      dispatch(getAllExpenses());
    }
    if (!loanActions?.length) {
      dispatch(getAllLoanActions());
    }
    if (!allPayments?.length) {
      dispatch(gatAllMonthlyPayments());
    }
    if (!allDepositActions?.length) {
      dispatch(getAllDepositActions());
    }
    if (!allOrdersReturn?.length) {
      dispatch(getAllOrdersReturn());
    }
    if (!allInvestmentTransactions?.length) {
      dispatch(getAllInvestmentTransactions());
    }
  }, [
    dispatch,
    donationsStatus,
    expensesStatus,
    loanActions?.length,
    allPayments?.length,
    allDepositActions?.length,
    allOrdersReturn?.length,
    allInvestmentTransactions?.length,
  ]);

  const incomeRows = useMemo(() => {
    const source = Array.isArray(allDonations) ? allDonations : [];
    const donationsIncomeRows = source
      .filter((d: any) => String(d?.action ?? "").toLowerCase() === "donation")
      .map((d: any) => ({
        id: `donation-${d?.id}`,
        amount: Number(d?.amount ?? 0) || 0,
        date: d?.date,
        details:
          `${d?.user?.first_name ?? ""} ${d?.user?.last_name ?? ""}`.trim() ||
          "—",
        source: "תרומה",
      }));

    const loansIncomeRows = (Array.isArray(loanActions) ? loanActions : [])
      .filter((a: any) => a?.action_type === LoanPaymentActionType.PAYMENT)
      .map((a: any) => ({
        id: `loan-payment-${a?.id}`,
        amount: Number(a?.value ?? 0) || 0,
        date: a?.date,
        details: `תשלום הלוואה #${a?.loan?.id ?? "—"}`,
        source: "הלוואה",
      }));

    const monthlyPaymentsIncomeRows = (Array.isArray(allPayments) ? allPayments : []).map(
      (p: any) => ({
        id: `monthly-payment-${p?.id}`,
        amount: Number(p?.amount ?? 0) || 0,
        date: p?.deposit_date,
        details:
          `${p?.user?.first_name ?? ""} ${p?.user?.last_name ?? ""}`.trim() || "דמי חבר",
        source: "דמי חבר",
      })
    );

    const depositIncomeRows = (Array.isArray(allDepositActions) ? allDepositActions : [])
      .filter((a: any) => {
        const type = (a?.action_type ?? a?.actionType) as DepositActionsType;
        return (
          type === DepositActionsType.InitialDeposit ||
          type === DepositActionsType.AddToDeposit
        );
      })
      .map((a: any) => ({
        id: `deposit-income-${a?.id}`,
        amount: Number(a?.amount ?? 0) || 0,
        date: a?.date,
        details: `הפקדה #${a?.deposit?.id ?? "—"}`,
        source: "הפקדות",
      }));

    const paidStandingOrderIncomeRows = (
      Array.isArray(allOrdersReturn) ? allOrdersReturn : []
    )
      .filter((r: any) => Boolean(r?.paid))
      .map((r: any) => ({
        id: `standing-paid-${r?.id}`,
        amount: Number(r?.amount ?? 0) || 0,
        date: r?.paid_at ?? r?.date,
        details: `הו״ק #${r?.id ?? "—"}`,
        source: "החזר הו״ק (שולם)",
      }));

    const investmentsIncomeRows = (
      Array.isArray(allInvestmentTransactions) ? allInvestmentTransactions : []
    )
      .filter((t: any) => t?.transaction_type === InvestmentTransactionType.WITHDRAWAL)
      .map((t: any) => ({
        id: `inv-income-${t?.id}`,
        amount: Number(t?.amount ?? 0) || 0,
        date: t?.transaction_date,
        details: `השקעה #${t?.investment?.id ?? "—"}`,
        source: "החזרה מהשקעה",
      }));

    return [
      ...donationsIncomeRows,
      ...monthlyPaymentsIncomeRows,
      ...loansIncomeRows,
      ...depositIncomeRows,
      ...paidStandingOrderIncomeRows,
      ...investmentsIncomeRows,
    ];
  }, [
    allDonations,
    loanActions,
    allPayments,
    allDepositActions,
    allOrdersReturn,
    allInvestmentTransactions,
  ]);

  const expenseRows = useMemo(() => {
    const source = Array.isArray(allExpenses) ? allExpenses : [];
    const regularExpenseRows = source.map((e: any) => ({
      id: `expense-${e?.id}`,
      amount: Number(e?.amount ?? 0) || 0,
      date: e?.expenseDate,
      details: e?.category?.name ?? "ללא קטגוריה",
      source: "הוצאה",
    }));

    const loanExpenseRows = (Array.isArray(loanActions) ? loanActions : [])
      .filter(
        (a: any) =>
          a?.action_type === LoanPaymentActionType.LOAN_CREATED ||
          a?.action_type === LoanPaymentActionType.AMOUNT_CHANGE
      )
      .map((a: any) => ({
        id: `loan-out-${a?.id}`,
        amount: Number(a?.value ?? 0) || 0,
        date: a?.date,
        details:
          a?.action_type === LoanPaymentActionType.LOAN_CREATED
            ? `פתיחת הלוואה #${a?.loan?.id ?? "—"}`
            : `הוספה להלוואה #${a?.loan?.id ?? "—"}`,
        source: "הלוואה",
      }));

    const depositExpenseRows = (Array.isArray(allDepositActions) ? allDepositActions : [])
      .filter((a: any) => {
        const type = (a?.action_type ?? a?.actionType) as DepositActionsType;
        return type === DepositActionsType.RemoveFromDeposit;
      })
      .map((a: any) => ({
        id: `deposit-expense-${a?.id}`,
        amount: Number(a?.amount ?? 0) || 0,
        date: a?.date,
        details: `משיכה מהפקדה #${a?.deposit?.id ?? "—"}`,
        source: "משיכה מהפקדה",
      }));

    const unpaidStandingOrderExpenseRows = (
      Array.isArray(allOrdersReturn) ? allOrdersReturn : []
    )
      .filter((r: any) => !Boolean(r?.paid))
      .map((r: any) => ({
        id: `standing-unpaid-${r?.id}`,
        amount: Number(r?.amount ?? 0) || 0,
        date: r?.date,
        details: `הו״ק #${r?.id ?? "—"}`,
        source: "החזר הו״ק (לא שולם)",
      }));

    const investmentsExpenseRows = (
      Array.isArray(allInvestmentTransactions) ? allInvestmentTransactions : []
    )
      .filter(
        (t: any) =>
          t?.transaction_type === InvestmentTransactionType.INITIAL_INVESTMENT ||
          t?.transaction_type === InvestmentTransactionType.ADDITIONAL_INVESTMENT ||
          t?.transaction_type === InvestmentTransactionType.MANAGEMENT_FEE
      )
      .map((t: any) => ({
        id: `inv-expense-${t?.id}`,
        amount: Number(t?.amount ?? 0) || 0,
        date: t?.transaction_date,
        details:
          t?.transaction_type === InvestmentTransactionType.INITIAL_INVESTMENT
            ? `פתיחת השקעה #${t?.investment?.id ?? "—"}`
            : t?.transaction_type === InvestmentTransactionType.ADDITIONAL_INVESTMENT
            ? `הוספה להשקעה #${t?.investment?.id ?? "—"}`
            : `דמי ניהול השקעה #${t?.investment?.id ?? "—"}`,
        source: "השקעות",
      }));

    return [
      ...regularExpenseRows,
      ...loanExpenseRows,
      ...depositExpenseRows,
      ...unpaidStandingOrderExpenseRows,
      ...investmentsExpenseRows,
    ];
  }, [allExpenses, loanActions, allDepositActions, allOrdersReturn, allInvestmentTransactions]);

  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    [...incomeRows, ...expenseRows].forEach((row) => {
      const dt = parseDate(row.date);
      if (dt) years.add(dt.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [incomeRows, expenseRows]);

  const monthOptions = useMemo(() => {
    const months = new Set<number>();
    [...incomeRows, ...expenseRows].forEach((row) => {
      const dt = parseDate(row.date);
      if (!dt) return;
      if (yearFilter !== "all" && dt.getFullYear() !== yearFilter) return;
      months.add(dt.getMonth());
    });
    return Array.from(months).sort((a, b) => a - b);
  }, [incomeRows, expenseRows, yearFilter]);

  useEffect(() => {
    if (monthFilter !== "all" && !monthOptions.includes(monthFilter)) {
      setMonthFilter("all");
    }
  }, [monthFilter, monthOptions]);

  const matchesFilter = (rawDate: string | Date | null | undefined) => {
    const dt = parseDate(rawDate);
    if (!dt) return false;
    if (yearFilter !== "all" && dt.getFullYear() !== yearFilter) return false;
    if (monthFilter !== "all" && dt.getMonth() !== monthFilter) return false;
    return true;
  };

  const filteredIncomeRows = useMemo(
    () =>
      [...incomeRows]
        .filter((row) => matchesFilter(row.date))
        .sort(
          (a, b) =>
            (parseDate(b.date)?.getTime() ?? 0) -
            (parseDate(a.date)?.getTime() ?? 0)
        ),
    [incomeRows, yearFilter, monthFilter]
  );

  const filteredExpenseRows = useMemo(
    () =>
      [...expenseRows]
        .filter((row) => matchesFilter(row.date))
        .sort(
          (a, b) =>
            (parseDate(b.date)?.getTime() ?? 0) -
            (parseDate(a.date)?.getTime() ?? 0)
        ),
    [expenseRows, yearFilter, monthFilter]
  );

  const totalIncome = useMemo(
    () => filteredIncomeRows.reduce((sum, row) => sum + row.amount, 0),
    [filteredIncomeRows]
  );
  const totalExpenses = useMemo(
    () => filteredExpenseRows.reduce((sum, row) => sum + row.amount, 0),
    [filteredExpenseRows]
  );
  const net = totalIncome - totalExpenses;

  const isLoading =
    donationsStatus === "pending" ||
    expensesStatus === "pending" ||
    loansStatus === "pending" ||
    GetPaymentsStatus === "pending" ||
    depositActionsStatus === "pending" ||
    standingOrdersStatus === "pending" ||
    getAllInvestmentTransactionsStatus === "pending";
  const hasError =
    donationsStatus === "rejected" ||
    expensesStatus === "rejected" ||
    loansStatus === "rejected" ||
    GetPaymentsStatus === "rejected" ||
    depositActionsStatus === "rejected" ||
    standingOrdersStatus === "rejected" ||
    getAllInvestmentTransactionsStatus === "rejected";

  return (
    <Container maxWidth={false} sx={{ py: 3, px: { xs: 1.5, md: 3 } }}>
      <Stack spacing={2.5}>
        <Typography variant="h5" fontWeight={800}>
          הכנסות מול הוצאות
        </Typography>

        {hasError && (
          <Alert severity="error">
            {donationsError ||
              expensesError ||
              loansError ||
              monthlyPaymentsError ||
              depositsError ||
              standingOrdersError ||
              investmentsError ||
              "שגיאה בטעינת הנתונים"}
          </Alert>
        )}

        <Card variant="outlined">
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="income-expenses-year-filter">שנה</InputLabel>
                  <Select
                    labelId="income-expenses-year-filter"
                    label="שנה"
                    value={yearFilter === "all" ? "all" : String(yearFilter)}
                    onChange={(e) => {
                      const next =
                        e.target.value === "all" ? "all" : Number(e.target.value);
                      setYearFilter(next);
                    }}
                  >
                    <MenuItem value="all">הכל</MenuItem>
                    {yearOptions.map((year) => (
                      <MenuItem key={year} value={String(year)}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="income-expenses-month-filter">חודש</InputLabel>
                  <Select
                    labelId="income-expenses-month-filter"
                    label="חודש"
                    value={monthFilter === "all" ? "all" : String(monthFilter)}
                    onChange={(e) => {
                      const next =
                        e.target.value === "all" ? "all" : Number(e.target.value);
                      setMonthFilter(next);
                    }}
                  >
                    <MenuItem value="all">הכל</MenuItem>
                    {monthOptions.map((month) => (
                      <MenuItem key={month} value={String(month)}>
                        {MONTHS[month]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4} md={2}>
                <Card sx={{ height: "100%", background: "#e8f5e9" }}>
                  <CardContent>
                    <Typography variant="body2">סה״כ הכנסות</Typography>
                    <Typography variant="h6" fontWeight={800} color="#1b5e20">
                      {formatILS(totalIncome)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={4} md={2}>
                <Card sx={{ height: "100%", background: "#ffebee" }}>
                  <CardContent>
                    <Typography variant="body2">סה״כ הוצאות</Typography>
                    <Typography variant="h6" fontWeight={800} color="#b71c1c">
                      {formatILS(totalExpenses)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={4} md={2}>
                <Card
                  sx={{
                    height: "100%",
                    background: net >= 0 ? "#e3f2fd" : "#fff8e1",
                  }}
                >
                  <CardContent>
                    <Typography variant="body2">נטו</Typography>
                    <Typography
                      variant="h6"
                      fontWeight={800}
                      color={net >= 0 ? "#0d47a1" : "#e65100"}
                    >
                      {formatILS(net)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                  הכנסות ({filteredIncomeRows.length})
                </Typography>

                <Box sx={{ maxHeight: 460, overflowY: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>תאריך</TableCell>
                        <TableCell>פירוט</TableCell>
                        <TableCell>מקור</TableCell>
                        <TableCell align="right">סכום</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredIncomeRows.map((row) => (
                        <TableRow key={`inc-${row.id}`}>
                          <TableCell>{formatDate(row.date)}</TableCell>
                          <TableCell>{row.details}</TableCell>
                          <TableCell>{row.source}</TableCell>
                          <TableCell align="right">{formatILS(row.amount)}</TableCell>
                        </TableRow>
                      ))}
                      {!isLoading && filteredIncomeRows.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            אין נתוני הכנסות לתצוגה
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                  הוצאות ({filteredExpenseRows.length})
                </Typography>

                <Box sx={{ maxHeight: 460, overflowY: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>תאריך</TableCell>
                        <TableCell>פירוט</TableCell>
                        <TableCell>מקור</TableCell>
                        <TableCell align="right">סכום</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredExpenseRows.map((row) => (
                        <TableRow key={`exp-${row.id}`}>
                          <TableCell>{formatDate(row.date)}</TableCell>
                          <TableCell>{row.details}</TableCell>
                          <TableCell>{row.source}</TableCell>
                          <TableCell align="right">{formatILS(row.amount)}</TableCell>
                        </TableRow>
                      ))}
                      {!isLoading && filteredExpenseRows.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            אין נתוני הוצאות לתצוגה
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default IncomeVsExpensesPage;
