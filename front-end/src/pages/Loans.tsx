import React from 'react';
import { Card, CardContent, Typography, Grid, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const loansData = [
  { id: 1, borrower: 'משה כהן', amount: 12000, status: 'פעילה' },
  { id: 2, borrower: 'יוסף לוי', amount: 8000, status: 'שולמה' },
  { id: 3, borrower: 'רבקה ישראלי', amount: 15000, status: 'איחור' },
];

 const Loans = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#1E3A3A' }}>
          רשימת הלוואות
        </Typography>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#B8860B', color: '#fff' }}
          onClick={() => navigate('/loans/new')}
        >
          הלוואה חדשה
        </Button>
      </Box>

      <Grid container spacing={2}>
        {loansData.map((loan) => (
          <Grid item xs={12} md={4} key={loan.id}>
            <Card
              sx={{ backgroundColor: '#FFFFFF', cursor: 'pointer' }}
              onClick={() => navigate(`/loans/${loan.id}`)}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: '#364E4E' }}>
                  {loan.borrower}
                </Typography>
                <Typography>סכום: ₪{loan.amount.toLocaleString()}</Typography>
                <Typography sx={{ color: getStatusColor(loan.status), mt: 1 }}>
                  סטטוס: {loan.status}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'פעילה':
      return '#90EE90';
    case 'שולמה':
      return '#808080';
    case 'איחור':
      return '#B8860B';
    default:
      return '#000000';
  }
};
export default Loans;