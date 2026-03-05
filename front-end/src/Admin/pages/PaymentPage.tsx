// PaymentsPage.tsx
import { useState, useMemo, useEffect } from "react";
import { Box, Container, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

import { useDispatch, useSelector } from "react-redux";
import MonthlyPaymentHeader from "../components/MonthlyPayments/MainMonthlyPayment/MonthlyPaymentHeader";
import MonthlyPaymentsSummaryCard from "../components/MonthlyPayments/MainMonthlyPayment/MonthlyPaymentsSummaryCard";
import MonthlyPaymentTable from "../components/MonthlyPayments/MainMonthlyPayment/MonthlyPaymentTable";
import MonthlyAndYearFiltering from "../components/MonthlyPayments/MainMonthlyPayment/MonthlyPaymentFiltering";
import { AddPaymentModal } from "../components/MonthlyPayments/AddMonthlyPayment/AddMonthlyPayment";
import { AppDispatch, RootState } from "../../store/store";
import {
  gatAllMonthlyPayments,
  getMonthlyPaymentsByUserId,
} from "../../store/features/admin/adminMonthlyPayments";

export default function PaymentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const payments = useSelector(
    (s: RootState) => s.AdminMonthlyPaymentsSlice.allPayments
  );
  const authUser = useSelector((s: RootState) => s.authslice.user);

  const isAdmin = Boolean(authUser?.is_admin);
  const selectedUser = useSelector(
    (state: RootState) => state.AdminUsers.selectedUser
  );
  const paymentModal = useSelector(
    (state: RootState) => state.mapModeSlice.MonthlyPaymentModalMode
  );

  useEffect(() => {
    // לא אדמין – תמיד רק של עצמו
    if (!isAdmin) {
      const myId = authUser?.user?.id;
      if (myId != null) {
        dispatch(getMonthlyPaymentsByUserId(myId));
      }
      return;
    }

    // אדמין + משתמש נבחר
    if (selectedUser?.id != null) {
      dispatch(getMonthlyPaymentsByUserId(selectedUser.id));
      return;
    }

    // אדמין בלי משתמש נבחר
    dispatch(gatAllMonthlyPayments());
  }, [dispatch, isAdmin, selectedUser?.id, paymentModal]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const years = useMemo(
    () =>
      Array.from(new Set(payments.map((p) => p.year))).sort((a, b) => b - a),
    [payments]
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    years.includes(currentYear) ? currentYear : years[0] ?? currentYear
  );
  const paymentsThisYear = useMemo(
    () => payments.filter((p) => selectedYear === 0 || p.year === selectedYear),
    [payments, selectedYear]
  );

  const months = useMemo(
    () =>
      Array.from(new Set(paymentsThisYear.map((p) => p.month))).sort(
        (a, b) => a - b
      ),
    [paymentsThisYear]
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    months.includes(currentMonth) ? currentMonth : 0
  );
  const [rowsLimit, setRowsLimit] = useState<"10" | "30" | "all">("10");

  useEffect(() => {
    if (selectedMonth !== 0 && !months.includes(selectedMonth)) {
      setSelectedMonth(0);
    }
  }, [months, selectedMonth]);

  const paymentsThisMonth = useMemo(
    () =>
      selectedMonth === 0
        ? paymentsThisYear
        : paymentsThisYear.filter((p) => p.month === selectedMonth),
    [paymentsThisYear, selectedMonth]
  );
  const sumMonth = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);
  const countMonth = paymentsThisMonth.length;

  return (
    <Container
      sx={{
        py: 4,
        direction: "rtl",
        // bgcolor: "#F9FBFC",
        fontFamily: "Heebo, Arial, sans-serif",
      }}
    >
      {paymentModal && <AddPaymentModal cape={false} />}
      <MonthlyPaymentHeader />
      <Box
        sx={{
          // backgroundColor: "#FFFFFF",
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
          <MonthlyPaymentsSummaryCard
            countMonth={countMonth}
            sumMonth={sumMonth}
          />
          <Box
            sx={{
              mb: 4,
              p: { xs: 2, md: 3 },
              // bgcolor: "#FFFFFF",
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <MonthlyAndYearFiltering
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              years={years}
              months={months}
              extraFilters={
                <FormControl fullWidth size="small">
                  <InputLabel id="monthly-payments-limit-label">תצוגה</InputLabel>
                  <Select
                    labelId="monthly-payments-limit-label"
                    label="תצוגה"
                    value={rowsLimit}
                    onChange={(e: SelectChangeEvent) =>
                      setRowsLimit(e.target.value as "10" | "30" | "all")
                    }
                  >
                    <MenuItem value="10">10</MenuItem>
                    <MenuItem value="30">30</MenuItem>
                    <MenuItem value="all">הכל</MenuItem>
                  </Select>
                </FormControl>
              }
            />
            <MonthlyPaymentTable
              paymentsThisMonth={paymentsThisMonth}
              rowsLimit={rowsLimit}
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
