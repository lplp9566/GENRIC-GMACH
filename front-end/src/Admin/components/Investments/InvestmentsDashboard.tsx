import { FC } from 'react';
import { InvestmentDto } from './InvestmentDto';
import { Box, Container, Grid, Paper, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import InvestmentCard from './InvestmentCard';
interface InvestmentsDashboardProps {
  investmentsData: InvestmentDto[];
}
const InvestmentsDashboard:FC<InvestmentsDashboardProps> = ({ investmentsData }) => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();

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
          <Grid container spacing={2} justifyContent="center" mb={4}>
            <Grid item xs={12} sm={isSm ? 6 : 3}>
              {/* <SummaryCard label="מספר הלוואות" value={total} /> */}
            </Grid>
            <Grid item xs={12} sm={isSm ? 6 : 3}>
              {/* <SummaryCard label="סה״כ הלוואות" value={`₪${totalAmount}`} /> */}
            </Grid>
          </Grid>

          {/* Loans Grid */}
          <Grid container spacing={4}>
            {investmentsData.map((investment) => (
              <Grid item xs={12} sm={6} md={4} key={investment.id}>
                <InvestmentCard
                  investment={investment}
                  onClick={() => navigate(`/investments/${investment.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  )
}

export default InvestmentsDashboard