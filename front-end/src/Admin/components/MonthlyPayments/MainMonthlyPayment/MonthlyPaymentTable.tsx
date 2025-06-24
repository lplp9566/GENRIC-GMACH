import { Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { IMonthlyPayment, paymentMethod } from '../MonthlyPaymentsDto'
interface MonthlyPaymentProps {
    paymentsThisMonth: IMonthlyPayment[]
} 
const MonthlyPaymentTable: React.FC<MonthlyPaymentProps> = ({ paymentsThisMonth }) => {
  return (
    <div>   <Paper sx={{ borderRadius: 2, overflow: 'auto',padding: 2, boxShadow: 1, }}>
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
      </Paper></div>
  )
}

export default MonthlyPaymentTable