// PaymentsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import {
  Add as AddIcon,
  SettingsOutlined as SettingsIcon,
  CreditCardOutlined as CardIcon,
  TrendingUpOutlined as TrendingUpIcon,
  CalendarTodayOutlined as CalendarIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { gatAllMonthlyPayments } from '../store/features/admin/adminMonthlyPayments';
import { paymentMethod } from '../components/MonthlyPayments/MunthlyPaymentsDto';

// מחזיר את השם העברי של חודש (1–12)
const hebrewMonthNames = [
  'ינואר','פברואר','מרץ','אפריל','מאי','יוני',
  'יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר',
];
const getHebrewMonthName = (m: number) => hebrewMonthNames[m - 1] || String(m);

export default function PaymentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const payments = useSelector((s: RootState) => s.AdminMonthlyPaymentsSlice.allPayments);

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
    () => Array.from(new Set(payments.map(p => p.year))).sort((a, b) => b - a),
    [payments]
  );
  const [selectedYear, setSelectedYear] = useState(
    years.includes(currentYear) ? currentYear : years[0] ?? currentYear
  );

  // תשלומים לשנה נבחרת
  const paymentsThisYear = useMemo(
    () => payments.filter(p => p.year === selectedYear),
    [payments, selectedYear]
  );
  const sumYear = paymentsThisYear.reduce((sum, p) => sum + p.amount, 0);
  const countYear = paymentsThisYear.length;

  // חודשים קיימים בשנה זו
  const months = useMemo(
    () => Array.from(new Set(paymentsThisYear.map(p => p.month))).sort((a, b) => b - a),
    [paymentsThisYear]
  );
  // selectedMonth === 0 פירושו “כל החודשים”
  const [selectedMonth, setSelectedMonth] = useState(
    months.includes(currentMonth) ? currentMonth : 0
  );

  // אם שנה משתנה ולא קיים החודש הנבחר, נסמן 0
  useEffect(() => {
    if (selectedMonth !== 0 && !months.includes(selectedMonth)) {
      setSelectedMonth(0);
    }
  }, [months, selectedMonth]);

  // קבע תשלומים על פי חודש (או כל החודשים)
  const paymentsThisMonth = useMemo(
    () => selectedMonth === 0
      ? paymentsThisYear
      : paymentsThisYear.filter(p => p.month === selectedMonth),
    [paymentsThisYear, selectedMonth]
  );
  const sumMonth = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);
  const countMonth = paymentsThisMonth.length;

  return (
    <Container maxWidth="lg" sx={{ py: 4, direction: 'rtl' }}>
      {/* כותרת עליונה + פעולות */}
      <Grid container alignItems="center" justifyContent="space-between" spacing={2} mb={4}>
        <Grid item>
          <Box display="flex" alignItems="center">
            <CardIcon sx={{ fontSize: 32, color: '#1976d2', ml: 1 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>הוראות קבע</Typography>
              <Typography variant="body2" color="text.secondary">
                ניהול ומעקב אחר כל הוראות הקבע במערכת
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
            >
              הוספת תשלום
            </Button>
            <Button variant="outlined" startIcon={<SettingsIcon />}>
              ניהול דרגות
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* כרטיסי סיכום */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#e8f5e9',
            borderRadius: 2
          }}>
            <TrendingUpIcon sx={{ fontSize: 48, color: '#2e7d32', ml: 2 }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                סה"כ הוראות קבע שנתיות
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                ₪{sumYear.toLocaleString()}
              </Typography>
              <Typography variant="caption">
                {countYear} הוראות קבע בשנת {selectedYear}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#e3f2fd',
            borderRadius: 2
          }}>
            <CalendarIcon sx={{ fontSize: 48, color: '#1976d2', ml: 2 }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                סה"כ הוראות קבע חודשיות
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                ₪{sumMonth.toLocaleString()}
              </Typography>
              <Typography variant="caption">
                {countMonth} הוראות קבע ב
                {selectedMonth === 0
                  ? 'כל החודשים'
                  : `חודש ${getHebrewMonthName(selectedMonth)}`}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* סינון */}
      <Box mb={2}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>הוראות קבע</Typography>
          </Grid>
          <Grid item xs>
            <Grid container spacing={1} justifyContent="flex-end">
              <Grid item xs={6} sm="auto">
                <FormControl fullWidth size="small">
                  <InputLabel id="year-select-label">שנה</InputLabel>
                  <Select
                    labelId="year-select-label"
                    value={selectedYear}
                    label="שנה"
                    onChange={e => setSelectedYear(Number(e.target.value))}
                  >
                    {years.map(y => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
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
                    onChange={e => setSelectedMonth(Number(e.target.value))}
                  >
                    <MenuItem value={0}>כל החודשים</MenuItem>
                    {months.map(m => (
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

      {/* טבלה */}
      <Paper sx={{ borderRadius: 2, overflow: 'auto' }}>
        <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell align="right">משתמש</TableCell>
              <TableCell align="right">סכום</TableCell>
              <TableCell align="right">תאריך</TableCell>
              <TableCell align="right">אמצעי תשלום</TableCell>
              <TableCell align="right">הערות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentsThisMonth.length > 0 ? (
              paymentsThisMonth.map(p => (
                <TableRow key={p.id} hover>
                  <TableCell align="right">
                    {p.user.first_name} {p.user.last_name}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                    ₪{p.amount.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">{p.deposit_date}</TableCell>
                  <TableCell align="right">{ paymentMethod.find(pm => pm.value == p.payment_method)?.label}</TableCell>
                  <TableCell align="right">{p.description}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  אין הוראות קבע לתקופה זו
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
