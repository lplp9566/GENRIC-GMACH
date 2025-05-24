import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';

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
  ThemeProvider
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { getAllLoanActions } from '../../store/features/admin/adminLoanSlice';
import { loanTheme } from './LoanTheme';

export const LoanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const loanId = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // fetch loan and related actions
  const loan = useSelector((state: RootState) => state.adminLoansSlice.allLoans!.find(l => l.id === loanId));
  const actions = useSelector((state: RootState) =>
    state.adminLoansSlice.loanActions!.filter(a => a.loan.id === loanId)
  );

  useEffect(() => {
    if (loanId) {
      dispatch(getAllLoanActions());
    }
  }, [dispatch, loanId]);

  if (!loan) {
    return <Typography variant="h6" sx={{ p: 4 }}>טוען פרטי הלוואה...</Typography>;
  }

  return (
    <ThemeProvider theme={loanTheme}>
      <CssBaseline />
      <Box sx={{ p: 4, minHeight: '100vh', direction: 'rtl' }}>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          חזור
        </Button>

        {/* Loan Info Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              פרטי הלוואה: {loan.user.first_name} {loan.user.last_name}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6} md={4}>
                <Typography>סכום הלוואה:</Typography>
                <Typography fontWeight={600}>₪{loan.loan_amount.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography>תאריך הלוואה:</Typography>
                <Typography fontWeight={600}>{loan.loan_date}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography>יתרה נוכחית:</Typography>
                <Typography fontWeight={600}>₪{loan.remaining_balance.toLocaleString()}</Typography>
              </Grid>
              {/* הוסף כאן פרטים נוספים לפי הצורך */}
            </Grid>

            <Box sx={{ textAlign: 'right', mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => navigate(`/loans/${loanId}/actions/new`)}
              >
                הוסף פעולה
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Actions Table */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          פעולות על הלוואה
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ת"ז משתמש</TableCell>
              <TableCell>סוג פעולה</TableCell>
              <TableCell>תאריך</TableCell>
              <TableCell align="right">סכום</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actions.map(act => (
              <TableRow key={act.id} hover>
                <TableCell>{act.loan.user.first_name}</TableCell>
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
