import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { MonetizationOn, AccountBalance, Savings, VolunteerActivism, AccountBalanceWallet, Favorite, Payments, TrendingUp, MoneyOff } from '@mui/icons-material';
import LoanDeshbord from './LoanDeshbord/LoanDeshbord';

// הגדרת סוג הנתונים
 export interface FundsOverviewProps {
  data: {
    total_funds: number ;
    loaned_amount: number;
    investments: number;
    special_funds: number;
    monthly_deposits: number;
    donations_received: number;
    available_funds: number;
    user_deposits_total: number;
    expenses_total: number;
  };
}

// הגדרת מבנה הריבועים
const fundsItems = [
  { key: 'total_funds', label: 'הון עצמי', icon: <AccountBalance />, color: '#1976D2' },
  { key: 'Investment_profits', label: "רווח מהשקעות", icon:  <TrendingUp />, color: '#1976D2' },
  { key: 'loaned_amount', label: 'כסף בהלוואות', icon: <MonetizationOn />, color: '#E53935' },
  { key: 'investments', label: 'השקעות', icon: <Savings />, color: '#8E24AA' },
  { key: 'special_funds', label: 'קרנות מיוחדות', icon: <VolunteerActivism />, color: '#43A047' },
  { key: 'monthly_deposits', label: 'הפקדות חודשיות', icon: <Payments />, color: '#FF9800' },
  { key: 'donations_received', label: 'תרומות שהתקבלו', icon: <Favorite />, color: '#D81B60' },
  { key: 'available_funds', label: 'כסף נזיל', icon: <AccountBalanceWallet />, color: '#00ACC1' },
  { key: 'user_deposits_total', label: 'סך הפיקדונות', icon: <TrendingUp />, color: '#00796B' },
  { key: 'expenses_total', label: 'הוצאות כלליות', icon: <MoneyOff />, color: '#FF5722' },
];

const FundsOverview: React.FC<FundsOverviewProps> = ({ data }) => {
  return (
    <Grid container spacing={3}>
      {fundsItems.map((item) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={item.key}>
          <Card sx={{ backgroundColor: item.color, color: 'white', textAlign: 'center', padding: 2, borderRadius: 3 }}>
            <CardContent>
              {item.icon}
              <Typography variant="h6" sx={{ mt: 1 }}>{item.label}</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {data[item.key as keyof FundsOverviewProps['data']].toLocaleString()} ₪
              </Typography>
            </CardContent>
          </Card>
          <button onClick={()=><LoanDeshbord/>}>lo</button>
        </Grid>
      ))}
    </Grid>
  );
};

export default FundsOverview;
