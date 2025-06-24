import { Box } from '@mui/material'
import SummaryCard from '../../Loans/LoansDashboard/SummaryCard'
interface MonthlyPaymentsSummaryCardProps {
  countMonth: number;
  sumMonth: number;
}
const MonthlyPaymentsSummaryCard = ({ countMonth, sumMonth }: MonthlyPaymentsSummaryCardProps) => {
  return (
          <Box display="flex" justifyContent="center" gap={3} mb={4} flexWrap="wrap">
            <SummaryCard label="מספר הוראות קבע" value={countMonth} />
            <SummaryCard
              label="סה״כ הוראות קבע"
              value={`₪${sumMonth.toLocaleString()}`}
            />
          </Box>
  )
}

export default MonthlyPaymentsSummaryCard