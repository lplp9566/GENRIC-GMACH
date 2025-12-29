import Box from "@mui/material/Box/Box"
import SummaryCard from "../Loans/LoansDashboard/SummaryCard"
interface StandingOrdersSummaryCardProps {
  countMonth: number;
  sumMonth: number;
}
const StandingOrdersSummaryCard = ({ countMonth, sumMonth }: StandingOrdersSummaryCardProps) => {
  return (
        <Box display="flex" justifyContent="center" gap={3} mb={4} flexWrap="wrap">
            <SummaryCard label="מספר החזרי הוראות קבע" value={countMonth} />
            <SummaryCard
              label="סה״כ הוראות קבע"
              value={`₪${sumMonth.toLocaleString()}`}
            />
          </Box>
  )
}

export default StandingOrdersSummaryCard