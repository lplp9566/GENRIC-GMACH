
import { ThemeProvider } from '@emotion/react';
import { loanTheme } from './LoanTheme';
import { Box, Card, CardContent, Chip, CssBaseline, Grid, Typography } from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; 
import TrendingDownIcon from '@mui/icons-material/TrendingDown'; 
import PaymentsIcon from '@mui/icons-material/Payments'; 
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useLoanHelpers } from '../../Hooks/LoanHooks/LoanHooksStatus';
import { ILoan } from './LoanDto';
import { useNavigate } from 'react-router-dom';
interface LoanProps{
  loansData: ILoan[];
  total: number
  user?: any
}
const Loans : React.FC<LoanProps> = ({loansData, user, total}) => {
    const { getStatusColor, getStatusText, getStatusIcon } = useLoanHelpers();
      const navigate = useNavigate();
  return (
 <ThemeProvider theme={loanTheme}>
      <CssBaseline />
      <Box sx={{ p: 4, backgroundColor: loanTheme.palette.background.default, minHeight: '100vh', direction: 'rtl' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleOutlineIcon sx={{ fontSize: 40, color: loanTheme.palette.primary.main }} />
            <Typography variant="h4" component="h1" sx={{ color: loanTheme.palette.text.primary, fontWeight: 700 }}>
              סה"כ הלוואות: {total}
            </Typography>
          </Box>

        </Box>

        <Grid container spacing={4}>
          {loansData.map((loan) => (
            <Grid item xs={12} sm={6} md={4} key={loan.id}>
              <Card onClick={() => navigate(`/loans/${loan.id}`)}>
                <CardContent>
                   <Chip
                  label={`#${loan.id}`}
                  size="small"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    fontWeight: 700,
                  }}
                />

                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', }}>
                    <Typography variant="h5" sx={{ color: loanTheme.palette.text.primary, mb: 2, marginLeft: '100px'  }}>
                      {user ? `${user.first_name} ${user.last_name}` : `${loan.user.first_name} ${loan.user.last_name}`}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: loanTheme.palette.text.secondary, mb: 2 }}>
                      {loan.user.id}
                    </Typography>
                  </div>
                  <Typography variant="h6" sx={{ color: loanTheme.palette.text.primary, mb: 2 }}>
                      פרטי הלוואה: {loan.purpose}
                    
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
                      יום תשלום: <Typography component="span" variant="body1" sx={{ fontWeight: 600, color: loanTheme.palette.text.primary }}>{loan.monthly_payment}</Typography>
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
                      סה"כ תשלומים: <Typography component="span" variant="body1" sx={{ fontWeight: 600, color: loanTheme.palette.text.primary }}> {Math.ceil(loan.total_installments)}</Typography>
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
  )
}

export default Loans