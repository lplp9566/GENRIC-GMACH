import { useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, Button, ThemeProvider, CssBaseline } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { getAllUsers } from '../store/features/admin/adminUsersSlice';

// Icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // עבור תאריך הלוואה/תשלום
import TrendingDownIcon from '@mui/icons-material/TrendingDown'; // עבור יתרה שנותרה
import PaymentsIcon from '@mui/icons-material/Payments'; // עבור תשלום חודשי
import { loanTheme } from '../components/Loans/LoanTheme';

// ממשק חדש לנתוני הלוואה
interface Loan {
  id: number;
  borrower: string; // נשאיר את זה זמנית, או נקשר למשתמש אמיתי
  loan_amount: number;
  loan_date: string; // YYYY-MM-DD
  monthly_payment: number;
  payment_date: number; // יום בחודש
  isActive: boolean;
  remaining_balance: number;
  initialMonthlyPayment?: number; // אופציונלי, כפי שהיה בקוד שלך
  total_instalments: number;
}


// נתוני הלוואות מעודכנים (נתוני דמה)
const loansData: Loan[] = [
  {
    id: 1,
    borrower: 'משה כהן',
    loan_amount: 12000,
    loan_date: '2024-03-15',
    monthly_payment: 250,
    payment_date: 10,
    isActive: true,
    remaining_balance: 7500,
    total_instalments: 36,
  },
  {
    id: 2,
    borrower: 'יוסף לוי',
    loan_amount: 8000,
    loan_date: '2023-01-01',
    monthly_payment: 150,
    payment_date: 5,
    isActive: false, // הלוואה שולמה
    remaining_balance: 0,
    total_instalments: 24,
  },
  {
    id: 3,
    borrower: 'רבקה ישראלי',
    loan_amount: 15000,
    loan_date: '2024-05-20',
    monthly_payment: 500,
    payment_date: 1,
    isActive: true,
    remaining_balance: 14500,
    total_instalments: 30,
  },
  {
    id: 4,
    borrower: 'דוד כץ',
    loan_amount: 5001,
    loan_date: '2025-05-05',
    monthly_payment: 100,
    payment_date: 5,
    isActive: true,
    remaining_balance: 4800,
    initialMonthlyPayment: 1,
    total_instalments: 48
  },
];

// Helper function for status colors
const getStatusColor = (isActive: boolean, remainingBalance: number) => {
  if (!isActive && remainingBalance === 0) {
    return '#4CAF50'; // ירוק - שולמה
  } else if (!isActive && remainingBalance > 0) {
    return '#FF9800'; // כתום - בוטלה עם יתרה (או משהו כזה)
  } else if (isActive && remainingBalance > 0) {
    return '#2196F3'; // כחול - פעילה
  }
  return '#616161'; // אפור - ברירת מחדל
};

// Helper function for status text
const getStatusText = (isActive: boolean, remainingBalance: number) => {
  if (!isActive && remainingBalance === 0) {
    return 'שולמה';
  } else if (!isActive && remainingBalance > 0) {
    return 'בוטלה (יתרה קיימת)'; // או סטטוס אחר אם רלוונטי
  } else if (isActive && remainingBalance > 0) {
    return 'פעילה';
  }
  return 'לא ידוע';
};

// Helper function for status icons
const getStatusIcon = (isActive: boolean, remainingBalance: number) => {
  if (!isActive && remainingBalance === 0) {
    return <DoneAllIcon sx={{ color: '#4CAF50' }} fontSize="small" />; // שולמה
  } else if (!isActive && remainingBalance > 0) {
    return <ErrorOutlineIcon sx={{ color: '#FF9800' }} fontSize="small" />; // בוטלה/בעיה
  } else if (isActive && remainingBalance > 0) {
    return <CheckCircleOutlineIcon sx={{ color: '#2196F3' }} fontSize="small" />; // פעילה
  }
  return null;
};


// הגדרת Theme מותאם אישית (כמו בקוד הקודם, ללא שינוי מהותי כאן)


const Loans = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allUsers } = useSelector(
    (state: RootState) => state.adminUsers
  );

  useEffect(() => {
    dispatch(getAllUsers() as any);
  }, [dispatch]);

  useEffect(() => {
    console.log("📦 allUsers:", allUsers);
  }, [allUsers]);

  return (
    <ThemeProvider theme={loanTheme}>
      <CssBaseline />
      <Box sx={{ p: 4, backgroundColor: loanTheme.palette.background.default, minHeight: '100vh', direction: 'rtl' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleOutlineIcon sx={{ fontSize: 40, color: loanTheme.palette.primary.main }} />
            <Typography variant="h4" component="h1" sx={{ color: loanTheme.palette.text.primary, fontWeight: 700 }}>
              סה"כ הלוואות: {loansData.length}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/loans/new')}
            color="primary"
          >
            הלוואה חדשה
          </Button>
        </Box>

        <Grid container spacing={4}>
          {loansData.map((loan) => (
            <Grid item xs={12} sm={6} md={4} key={loan.id}>
              <Card onClick={() => navigate(`/loans/${loan.id}`)}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: loanTheme.palette.text.primary, mb: 2 }}>
                    פרטי הלוואה: {loan.borrower}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AttachMoneyIcon sx={{ color: loanTheme.palette.text.secondary }} />
                    <Typography variant="body1" sx={{ color: loanTheme.palette.text.secondary }}>
                      סכום הלוואה: <Typography component="span" variant="body1" sx={{ fontWeight: 600, color: loanTheme.palette.text.primary }}>₪{loan.loan_amount.toLocaleString()}</Typography>
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarTodayIcon sx={{ color: loanTheme.palette.text.secondary }} />
                    <Typography variant="body1" sx={{ color: loanTheme.palette.text.secondary }}>
                      תאריך הלוואה: <Typography component="span" variant="body1" sx={{ fontWeight: 600, color: loanTheme.palette.text.primary }}>{loan.loan_date}</Typography>
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PaymentsIcon sx={{ color: loanTheme.palette.text.secondary }} />
                    <Typography variant="body1" sx={{ color: loanTheme.palette.text.secondary }}>
                      תשלום חודשי: <Typography component="span" variant="body1" sx={{ fontWeight: 600, color: loanTheme.palette.text.primary }}>₪{loan.monthly_payment.toLocaleString()}</Typography>
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarTodayIcon sx={{ color: loanTheme.palette.text.secondary }} />
                    <Typography variant="body1" sx={{ color: loanTheme.palette.text.secondary }}>
                      יום תשלום: <Typography component="span" variant="body1" sx={{ fontWeight: 600, color: loanTheme.palette.text.primary }}>{loan.payment_date}</Typography>
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TrendingDownIcon sx={{ color: loanTheme.palette.text.secondary }} />
                    <Typography variant="body1" sx={{ color: loanTheme.palette.text.secondary }}>
                      יתרה לסילוק: <Typography component="span" variant="body1" sx={{ fontWeight: 600, color: loanTheme.palette.text.primary }}>₪{loan.remaining_balance.toLocaleString()}</Typography>
                    </Typography>
                  </Box>
                  
                  {loan.initialMonthlyPayment !== undefined && ( // הצג רק אם קיים
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PaymentsIcon sx={{ color: loanTheme.palette.text.secondary }} />
                      <Typography variant="body1" sx={{ color: loanTheme.palette.text.secondary }}>
                        תשלום חודשי התחלתי: <Typography component="span" variant="body1" sx={{ fontWeight: 600, color: loanTheme.palette.text.primary }}>₪{loan.initialMonthlyPayment.toLocaleString()}</Typography>
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarTodayIcon sx={{ color: loanTheme.palette.text.secondary }} />
                    <Typography variant="body1" sx={{ color: loanTheme.palette.text.secondary }}>
                      סה"כ תשלומים: <Typography component="span" variant="body1" sx={{ fontWeight: 600, color: loanTheme.palette.text.primary }}>{loan.total_instalments}</Typography>
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    {getStatusIcon(loan.isActive, loan.remaining_balance)}
                    <Typography
                      variant="body2"
                      sx={{
                        color: getStatusColor(loan.isActive, loan.remaining_balance),
                        fontWeight: 600,
                      }}
                    >
                      סטטוס: {getStatusText(loan.isActive, loan.remaining_balance)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default Loans;