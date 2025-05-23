import React from 'react'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Card, CardContent, Grid, Typography } from '@mui/material';
interface CardItemProps   {
      label: string;
      value: number;
      Icon: typeof AttachMoneyIcon;
}

const FundsOverviewItemDefault: React.FC<CardItemProps> = ({label,value,Icon}) => {
  return (
     <Grid item xs={12} sm={6} md={4} lg={3} key={label}>
              <Card sx={{ borderLeft: `4px solid`, borderColor: 'primary.light' }}>
                <Icon sx={{ fontSize: 48, color: 'primary.main' }} />
                <CardContent>
                  <Typography variant="body2">{label}</Typography>
                  <Typography variant="h5">
                    ₪{(value ?? 0).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

  )
}

export default FundsOverviewItemDefault