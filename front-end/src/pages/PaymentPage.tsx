// PaymentsPage.tsx
import { useState, useMemo, useEffect } from "react";
import {
  Container,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,

} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { gatAllMonthlyPayments } from "../store/features/admin/adminMonthlyPayments";
import MonthlyPaymentHeader from "../components/MonthlyPayments/MonthlyPaymentHeader";
import MonthlyPaymentTable from "../components/MonthlyPayments/MonthlyPaymentTable";
import SummaryCard from "../components/Loans/LoansDashboard/SummaryCard";

// מחזיר את השם העברי של חודש (1–12)
const hebrewMonthNames = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];
const getHebrewMonthName = (m: number) => hebrewMonthNames[m - 1] || String(m);

export default function PaymentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const payments = useSelector(
    (s: RootState) => s.AdminMonthlyPaymentsSlice.allPayments
  );

  // טען את כל התשלומים כשנכנסים
  useEffect(() => {
    dispatch(gatAllMonthlyPayments());
  }, [dispatch]);

  // תאריך נוכחי
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
        (a, b) => b - a
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
          <Box display="flex" justifyContent="center" gap={3} mb={4} flexWrap="wrap">
            <SummaryCard label="מספר הוראות קבע" value={countMonth} />
            <SummaryCard
              label="סה״כ הוראות קבע"
              value={`₪${sumMonth.toLocaleString()}`}
            />
          </Box>

          <Box
            sx={{
              mb: 4,
              p: { xs: 2, md: 3 }, 
              bgcolor: "#FFFFFF", 
              borderRadius: 2, 
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <Box mb={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                  <Grid container spacing={2} justifyContent="flex-end"> 
                    <Grid item xs={6} sm="auto">
                      <FormControl fullWidth size="small">
                        <InputLabel id="year-select-label">שנה</InputLabel>
                        <Select
                          labelId="year-select-label"
                          value={selectedYear}
                          label="שנה"
                          onChange={(e) =>
                            setSelectedYear(Number(e.target.value))
                          }
                        >
                          {years.map((y) => (
                            <MenuItem key={y} value={y}>
                              {y}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm="auto">
                      <FormControl fullWidth size="small">
                        <InputLabel id="month-select-label">חודש</InputLabel>
                        <Select
                          labelId="month-select-label"
                          value={selectedMonth}
                          label="חודש"
                          onChange={(e) =>
                            setSelectedMonth(Number(e.target.value))
                          }
                        >
                          <MenuItem value={0}>כל החודשים</MenuItem>
                          {months.map((m) => (
                            <MenuItem key={m} value={m}>
                              {getHebrewMonthName(m)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            <MonthlyPaymentTable paymentsThisMonth={paymentsThisMonth} />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}