import {
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import StandingOrdersReturnHeader from "./StandingOrdersReturnHeader";
import SummaryCard from "../Loans/LoansDashboard/SummaryCard";
import MonthlyAndYearFiltering from "../MonthlyPayments/MainMonthlyPayment/MonthlyPaymentFiltering";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { getMonthFromDate, getYearFromDate } from "../../Hooks/genricFunction";
import {
  getAllOrdersReturn,
  getOrdersReturnByUserId,
} from "../../../store/features/admin/adminStandingOrderReturt";
import StandingOrderReturnTable from "./StandingOrderReturnTable";

const StandingOrdersReturn = () => {
  const dispatch = useDispatch<AppDispatch>();

  const selectedUser = useSelector(
    (state: RootState) => state.AdminUsers.selectedUser
  );
  const orderReturn =
    useSelector(
      (s: RootState) => s.AdminStandingOrderReturnSlice.allOrdersReturn
    ) ?? [];
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const isAdmin = Boolean(authUser?.is_admin);
  useEffect(() => {
    const authUserId = authUser?.user?.id;

    // User-side view: always limit to the logged-in user's records,
    // regardless of extra permissions (as long as not system admin).
    if (!isAdmin) {
      if (authUserId != null) {
        dispatch(getOrdersReturnByUserId(authUserId));
      }
      return;
    }

    // Admin-side view: can filter by selected user, or see all.
    if (selectedUser) {
      dispatch(getOrdersReturnByUserId(selectedUser.id));
      return;
    }

    dispatch(getAllOrdersReturn());
  }, [dispatch, selectedUser, isAdmin, authUser?.user?.id]);
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const years = useMemo(
    () =>
      Array.from(new Set(orderReturn.map((p) => getYearFromDate(p.date)))).sort(
        (a, b) => b - a
      ),
    [orderReturn]
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    years.includes(currentYear) ? currentYear : years[0] ?? currentYear
  );
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">(
    "all"
  );
  const [rowsLimit, setRowsLimit] = useState<"10" | "30" | "all">("10");
  const paymentsThisYear = useMemo(
    () =>
      orderReturn.filter(
        (p) => selectedYear === 0 || getYearFromDate(p.date) === selectedYear
      ),
    [orderReturn, selectedYear]
  );

  const months = useMemo(
    () =>
      Array.from(
        new Set(paymentsThisYear.map((p) => getMonthFromDate(p.date)))
      ).sort((a, b) => a - b),
    [paymentsThisYear]
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    months.includes(currentMonth) ? currentMonth : 0
  );

  useEffect(() => {
    if (selectedMonth !== 0 && !months.includes(selectedMonth)) {
      setSelectedMonth(0);
    }
  }, [months, selectedMonth]);
  useEffect(() => {
    if (!years.length) return;

    setSelectedYear((prev) => {
      if (prev && years.includes(prev)) return prev;
      return years.includes(currentYear) ? currentYear : years[0];
    });
  }, [years, currentYear]);

  const paymentsThisMonth = useMemo(
    () =>
      selectedMonth === 0
        ? paymentsThisYear
        : paymentsThisYear.filter(
            (p) => getMonthFromDate(p.date) === selectedMonth
          ),
    [paymentsThisYear, selectedMonth]
  );
  const filteredPayments = useMemo(() => {
    if (statusFilter === "paid") {
      return paymentsThisMonth.filter((p) => p.paid);
    }
    if (statusFilter === "unpaid") {
      return paymentsThisMonth.filter((p) => !p.paid);
    }
    return paymentsThisMonth;
  }, [paymentsThisMonth, statusFilter]);
  const displayedPayments = useMemo(() => {
    if (rowsLimit === "all") return filteredPayments;
    return filteredPayments.slice(0, Number(rowsLimit));
  }, [filteredPayments, rowsLimit]);
  const sumMonthPaid = filteredPayments
    .filter((p) => p.paid)
    .reduce((sum, p) => sum + p.amount, 0);
  const sumMonthNotPaid = filteredPayments
    .filter((p) => !p.paid)
    .reduce((sum, p) => sum + p.amount, 0);

  const countMonth = filteredPayments.length;

  return (
    <Container
      sx={{
        py: 4,
        direction: "rtl",
        // bgcolor: "#F9FBFC",
        fontFamily: "Heebo, Arial, sans-serif",
      }}
    >
      <StandingOrdersReturnHeader
      />
      <Box
        sx={{
          minHeight: "100vh",
          pt: 4,
          direction: "rtl",
          borderRadius: 3,
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
          mt: 4,
        }}
      >
        <Box
          sx={{
            // bgcolor: "#FBFDFE",
            padding: { xs: 2, md: 3 },
            borderRadius: 2,
            mb: 4,
          }}
        >
          <Box
            display="flex"
            justifyContent="center"
            gap={3}
            mb={4}
            flexWrap="wrap"
          >
            <SummaryCard label="סה״כ החזרי הוראות קבע" value={countMonth} />
            <SummaryCard
              label="סכום הוראות קבע ששולמו"
              value={`₪ ${sumMonthPaid.toLocaleString()}`}
            />
            <SummaryCard
              label="סכום החזרי הוראות קבע שלא שולמו"
              value={`₪ ${sumMonthNotPaid.toLocaleString()}`}
            />
          </Box>

      <MonthlyAndYearFiltering
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        years={years}
        months={months}
        extraFilters={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="return-status-label">סטטוס</InputLabel>
              <Select
                labelId="return-status-label"
                value={statusFilter}
                label="סטטוס"
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | "paid" | "unpaid")
                }
              >
                <MenuItem value="all">הכל</MenuItem>
                <MenuItem value="paid">שולם</MenuItem>
                <MenuItem value="unpaid">לא שולם</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="return-limit-label">תצוגה</InputLabel>
              <Select
                labelId="return-limit-label"
                value={rowsLimit}
                label="תצוגה"
                onChange={(e) =>
                  setRowsLimit(e.target.value as "10" | "30" | "all")
                }
              >
                <MenuItem value="10">10</MenuItem>
                <MenuItem value="30">30</MenuItem>
                <MenuItem value="all">הכל</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        }
      />
          <StandingOrderReturnTable payments={displayedPayments} />
        </Box>
      </Box>
    </Container>
  );
};

export default StandingOrdersReturn;

