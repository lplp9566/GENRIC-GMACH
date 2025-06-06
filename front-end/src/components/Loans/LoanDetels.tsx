// LoanDetails.tsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";

import {
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Chip,
  Divider,
  ThemeProvider,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { loanTheme } from "./LoanTheme";
import { getAllLoanActions } from "../../store/features/admin/adminLoanSlice";

export const LoanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const loanId = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // בוחרים את ההלוואה עצמה ואת הפעולות שמשויכות אליה
  const loan = useSelector((state: RootState) =>
    state.adminLoansSlice.allLoans!.find((l) => l.id === loanId)
  );
  const actions = useSelector((state: RootState) =>
    state.adminLoansSlice.loanActions!.filter((a) => a.loan.id === loanId)
  );

  useEffect(() => {
    if (loanId) {
      dispatch(getAllLoanActions());
    }
  }, [dispatch, loanId]);

  if (!loan) {
    return (
      <Typography variant="h6" sx={{ p: 4, textAlign: "center" }}>
        טוען פרטי הלוואה...
      </Typography>
    );
  }

  return (
    <ThemeProvider theme={loanTheme}>
      <CssBaseline />
      <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", direction: "rtl" }}>
        {/* כפתור חזרה */}
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          חזור
        </Button>

        {/* כותרת ראשית */}
        <Typography variant="h4" gutterBottom>
          פרטי הלוואה עבור: {loan.user.first_name} {loan.user.last_name}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* פרטי הלוואה */}
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              {/* סכום הלוואה */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  סכום הלוואה
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ₪{loan.loan_amount.toLocaleString()}
                </Typography>
              </Grid>

              {/* תאריך הלוואה */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  תאריך הלוואה
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {loan.loan_date}
                </Typography>
              </Grid>

              {/* מטרה */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  מטרה
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {loan.purpose}
                </Typography>
              </Grid>

              {/* תשלום חודשי */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  תשלום חודשי
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ₪{loan.monthly_payment.toLocaleString()}
                </Typography>
              </Grid>

              {/* יום תשלום */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  יום תשלום בחודש
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {loan.payment_date}
                </Typography>
              </Grid>

              {/* סטטוס פעילות */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  סטטוס
                </Typography>
                <Chip
                  label={loan.isActive ? "פעיל" : "סגור"}
                  color={loan.isActive ? "success" : "default"}
                  sx={{ fontWeight: 600, mt: 0.5 }}
                />
              </Grid>

              {/* יתרה נוכחית */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  יתרה נוכחית
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#D35400" }}>
                  ₪{loan.remaining_balance.toLocaleString()}
                </Typography>
              </Grid>

              {/* תשלום חודשי התחלתי */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  תשלום חודשי התחלתי
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ₪{loan.initialMonthlyPayment.toLocaleString()}
                </Typography>
              </Grid>

              {/* סה"כ תשלומים */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  סה"כ תשלומים
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {loan.total_installments}
                </Typography>
              </Grid>

              {/* בלאנס */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  בלאנס
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ₪{loan.balance.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>

            {/* כפתור הוספת פעולה */}
            <Box sx={{ textAlign: "right", mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => navigate(`/loans/${loanId}/actions/new`)}
                sx={{ borderRadius: 2, px: 2, py: 1.2 }}
              >
                הוסף פעולה
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* טבלת פעולות */}
        <Typography variant="h6" gutterBottom>
          פעולות על הלוואה
        </Typography>
        <Table size="small" sx={{ borderCollapse: "separate", borderSpacing: "0 8px" }}>
          <TableHead>
            <TableRow>
              <TableCell>שם מלא</TableCell>
              <TableCell>סוג פעולה</TableCell>
              <TableCell>תאריך</TableCell>
              <TableCell align="right">סכום</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actions.map((act) => (
              <TableRow
                key={act.id}
                hover
                sx={{
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                  backgroundColor: "#FFFFFF",
                  borderRadius: 2,
                  mb: 1,
                }}
              >
                <TableCell>
                  {act.loan.user.first_name} {act.loan.user.last_name}
                </TableCell>
                <TableCell>{act.action_type}</TableCell>
                <TableCell>{act.date}</TableCell>
                <TableCell align="right">₪{act.value.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </ThemeProvider>
  );
};

export default LoanDetails;
