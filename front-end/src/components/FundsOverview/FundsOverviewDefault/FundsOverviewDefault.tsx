import { Box, Card, CardContent, Divider, Grid, Typography } from '@mui/material';
import React from 'react'
import FundsOverviewItemDefault from './FundsOverviewItemDefault';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
interface FundsOverviewItemProps {
  items: { label: string; value: number ,Icon : typeof AttachMoneyIcon}[];
  fundsOverview: {
    fund_details: Record<string, number>;
  };
}
const FundsOverviewDefault: React.FC<FundsOverviewItemProps> = ({items,fundsOverview}) => {
  return (
     <Box
      p={4}
      bgcolor="background.default"
      // minHeight="calc(100vh - 64px)"
      dir="rtl"
      fontFamily="Heebo, Arial, sans-serif"
    >
      <Grid container spacing={4} mb={6}>
        {items.map(({ label, value, Icon }) => {
          return (
            <FundsOverviewItemDefault Icon={Icon} label={label} value={value} />
          );
        })}
      </Grid>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          פירוט קרנות מיוחדות
        </Typography>
        <Divider />
        <Grid container spacing={3}>
          {Object.entries(fundsOverview.fund_details).map(([name, amt]) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={name}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle1">{name}</Typography>
                  <Typography variant="h6" color="text.secondary">
                    ₪{(amt as number).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>

  )
}

export default FundsOverviewDefault