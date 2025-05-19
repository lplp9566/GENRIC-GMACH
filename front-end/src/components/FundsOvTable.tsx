import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from '@mui/material';

const fundsByYearData = [
  {
    year: 2021,
    total_monthly_deposits: 40000,
    total_equity_donations: 15000,
    special_fund_donations: 10000,
    total_special_funds_withdrawn: 6000,
    total_loans_taken: 22,
    total_loans_amount: 92000,
    total_loans_repaid: 48000,
    total_fixed_deposits_added: 30000,
    total_fixed_deposits_withdrawn: 10000,
    total_standing_order_return: 2000,
    total_investments_out: 5000,
    total_investments_in: 8000,
    total_expenses: 7000,
    total_donations: 25000,
  },
  {
    year: 2021,
    total_monthly_deposits: 40000,
    total_equity_donations: 15000,
    special_fund_donations: 10000,
    total_special_funds_withdrawn: 6000,
    total_loans_taken: 22,
    total_loans_amount: 92000,
    total_loans_repaid: 48000,
    total_fixed_deposits_added: 30000,
    total_fixed_deposits_withdrawn: 10000,
    total_standing_order_return: 2000,
    total_investments_out: 5000,
    total_investments_in: 8000,
    total_expenses: 7000,
    total_donations: 25000,
  },
  {
    year: 2021,
    total_monthly_deposits: 40000,
    total_equity_donations: 15000,
    special_fund_donations: 10000,
    total_special_funds_withdrawn: 6000,
    total_loans_taken: 22,
    total_loans_amount: 92000,
    total_loans_repaid: 48000,
    total_fixed_deposits_added: 30000,
    total_fixed_deposits_withdrawn: 10000,
    total_standing_order_return: 2000,
    total_investments_out: 5000,
    total_investments_in: 8000,
    total_expenses: 7000,
    total_donations: 25000,
  },
  {
    year: 2010,
    total_monthly_deposits: 40000,
    total_equity_donations: 15000,
    special_fund_donations: 10000,
    total_special_funds_withdrawn: 6000,
    total_loans_taken: 22,
    total_loans_amount: 92000,
    total_loans_repaid: 48000,
    total_fixed_deposits_added: 30000,
    total_fixed_deposits_withdrawn: 10000,
    total_standing_order_return: 2000,
    total_investments_out: 5000,
    total_investments_in: 8000,
    total_expenses: 7000,
    total_donations: 25000,
  },
  {
    year: 2022,
    total_monthly_deposits: 46000,
    total_equity_donations: 20000,
    special_fund_donations: 12000,
    total_special_funds_withdrawn: 9000,
    total_loans_taken: 30,
    total_loans_amount: 110000,
    total_loans_repaid: 75000,
    total_fixed_deposits_added: 35000,
    total_fixed_deposits_withdrawn: 5000,
    total_standing_order_return: 2500,
    total_investments_out: 8000,
    total_investments_in: 9000,
    total_expenses: 9500,
    total_donations: 32000,
  },
];

const FundsOverviewByYearTable = () => {
  return (
    <Box sx={{ mt: 6, background: 'linear-gradient(to left, #f3f4f7, #e8edf3)', p: 3, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        טבלת סיכום לפי שנה
      </Typography>
      <Paper elevation={3} sx={{ overflowX: 'auto', borderRadius: 2 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#1E3A3A' }}>
            <TableRow>
              {[
                'שנה',
                'הפקדות חודשיות',
                'תרומות הון',
                'תרומות קרנות',
                'משיכות מקרנות',
                'מס" הלוואות',
                'סך הלוואות',
                'החזרי הלוואות',
                'פיקדונות נוספים',
                'פיקדונות שנמשכו',
                'החזרים על הוראת קבע',
                'השקעות החוצה',
                'רווחי השקעות',
                'הוצאות',
                'סה"כ תרומות',
              ].map((header) => (
                <TableCell key={header} sx={{ color: 'white', fontWeight: 'bold' }}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {fundsByYearData.map((row) => (
              <TableRow key={row.year}>
                <TableCell>{row.year}</TableCell>
                <TableCell>{row.total_monthly_deposits.toLocaleString()}</TableCell>
                <TableCell>{row.total_equity_donations.toLocaleString()}</TableCell>
                <TableCell>{row.special_fund_donations.toLocaleString()}</TableCell>
                <TableCell>{row.total_special_funds_withdrawn.toLocaleString()}</TableCell>
                <TableCell>{row.total_loans_taken}</TableCell>
                <TableCell>{row.total_loans_amount.toLocaleString()}</TableCell>
                <TableCell>{row.total_loans_repaid.toLocaleString()}</TableCell>
                <TableCell>{row.total_fixed_deposits_added.toLocaleString()}</TableCell>
                <TableCell>{row.total_fixed_deposits_withdrawn.toLocaleString()}</TableCell>
                <TableCell>{row.total_standing_order_return.toLocaleString()}</TableCell>
                <TableCell>{row.total_investments_out.toLocaleString()}</TableCell>
                <TableCell>{row.total_investments_in.toLocaleString()}</TableCell>
                <TableCell>{row.total_expenses.toLocaleString()}</TableCell>
                <TableCell>{row.total_donations.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default FundsOverviewByYearTable;