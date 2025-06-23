// PaymentsPage.tsx
import { useState, useMemo, useEffect } from "react";
import {
  Box,
  Container,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import {  gatAllMonthlyPayments, getMonthlyPaymentsByUserId } from "../store/features/admin/adminMonthlyPayments";
import MonthlyPaymentHeader from "../components/MonthlyPayments/MainMonthlyPayment/MonthlyPaymentHeader";
import MonthlyPaymentsSummaryCard from "../components/MonthlyPayments/MainMonthlyPayment/MonthlyPaymentsSummaryCard";
import MonthlyPaymentTable from "../components/MonthlyPayments/MainMonthlyPayment/MonthlyPaymentTable";
import MonthlyPaymentFiltering from "../components/MonthlyPayments/MainMonthlyPayment/MonthlyPaymentFiltering";
import { AddPaymentModal } from "../components/MonthlyPayments/AddMonthlyPayment/AddMonthlyPayment";

export default function PaymentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const payments = useSelector(
    (s: RootState) => s.AdminMonthlyPaymentsSlice.allPayments
  );
  const selectedUser = useSelector(
    (state: RootState) => state.adminUsers.selectedUser
  );
const paymentModal = useSelector(
    (state: RootState) => state.mapModeSlice.MonthlyPaymentModalMode
  );


  useEffect(() => {
    if (selectedUser) {
      dispatch(getMonthlyPaymentsByUserId(selectedUser.id));
    }
    else{
    dispatch(gatAllMonthlyPayments());
    }

  }, [dispatch, selectedUser, paymentModal]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // שנים קיימות בדאטה
  const years = useMemo(
    () =>
      Array.from(new Set(payments.map((p) => p.year))).sort((a, b) => b - a),
    [payments]
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    years.includes(currentYear) ? currentYear : years[0] ?? currentYear
  );

  // תשלומים לשנה נבחרת
  const paymentsThisYear = useMemo(
    () => payments.filter((p) => p.year === selectedYear),
    [payments, selectedYear]
  );

  // חודשים קיימים בשנה זו
  const months = useMemo(
    () =>
      Array.from(new Set(paymentsThisYear.map((p) => p.month))).sort(
        (a, b) => a - b
      ),
    [paymentsThisYear]
  );
  // selectedMonth === 0 פירושו “כל החודשים”
  const [selectedMonth, setSelectedMonth] = useState<number>(
    months.includes(currentMonth) ? currentMonth : 0
  );

  // אם שנה משתנה ולא קיים החודש הנבחר, נסמן 0
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

  // const sumYear = paymentsThisYear.reduce((sum, p) => sum + p.amount, 0);
  // const countYear = paymentsThisYear.length;


  return (
    
    <Container
      sx={{
        py: 4,
        direction: "rtl",
        bgcolor: "#F9FBFC", 
        fontFamily: 'Heebo, Arial, sans-serif',
      }}
    >
      {paymentModal && (
        <AddPaymentModal/>
      )}
      <MonthlyPaymentHeader />
      <Box
        sx={{
          backgroundColor: "#FFFFFF",
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
            bgcolor: "#FBFDFE", 
            padding: { xs: 2, md: 3 }, 
            borderRadius: 2, 
            mb: 4,

          }}
        >
          <MonthlyPaymentsSummaryCard countMonth={countMonth} sumMonth={sumMonth} />
          <Box
            sx={{
              mb: 4,
              p: { xs: 2, md: 3 }, 
              bgcolor: "#FFFFFF", 
              borderRadius: 2, 
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <MonthlyPaymentFiltering
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              years={years}
              months={months}
            />
            <MonthlyPaymentTable paymentsThisMonth={paymentsThisMonth} />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}