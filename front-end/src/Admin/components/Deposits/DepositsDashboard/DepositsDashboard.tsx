import { FC } from 'react'
import { IDeposit } from '../depositsDto';
import { useNavigate } from "react-router-dom";
import { Box, Container, Grid, Paper, useMediaQuery, useTheme } from '@mui/material';
import SummaryCard from '../../Loans/LoansDashboard/SummaryCard';
import DepositCard from './DepositCard';

interface  DepositsDashboardProps {
  depositsData: IDeposit[];
  total: number;
}
const DepositsDashboard:FC<DepositsDashboardProps> = ({depositsData, total}) => {
const navigate = useNavigate();
const theme = useTheme();
const isSm = useMediaQuery(theme.breakpoints.down('sm'));  

const totalAmount = depositsData
  .reduce((sum, deposit) => sum + (deposit.isActive ? deposit.current_balance : 0), 0)

  return (
    <Box sx={{ bgcolor: "#F5F5F5", py: 6, direction: "rtl" }}>
      <Container maxWidth="lg">
        {/* מסגרת לבנה לכל התוכן */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            mb: 6,
            bgcolor: "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 2,
          }}
        >
          {/* Summary Section */}
          <Grid
            container
            spacing={2}
            justifyContent="center"
            mb={4}
          >
            <Grid item xs={12} sm={isSm? 6:3}>
              <SummaryCard
                label="מספר הפקדות"
                value={total}
              />
            </Grid>
            <Grid item xs={12} sm={isSm? 6:3}>
              <SummaryCard
                label="סה״כ הפקדות"
                value={`₪${totalAmount}`}
              />
            </Grid>
          </Grid>
          {/* Loans Grid */}
          <Grid container spacing={4}>
            {depositsData.map((deposit) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={deposit.id}
              >
                <DepositCard
                  deposit={deposit}
                  onClick={() => navigate(`/deposit/${deposit.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  )
}


export default DepositsDashboard