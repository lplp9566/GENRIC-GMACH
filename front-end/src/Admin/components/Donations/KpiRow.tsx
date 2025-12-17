import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { FC } from 'react'
interface KpiRowProps {
    view: "split" | "left" | "right";
    totalDonations: number;
    totalAmount: number;
}
const KpiRow: FC<KpiRowProps> = ({ totalDonations, totalAmount, view }: KpiRowProps) => {
  return (
  <Grid container spacing={3} sx={{ mb: 3 }} justifyContent="center">
      <Grid item xs={12} sm={6} md={8}>
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent sx={{ textAlign: "center", width: 2}}>
            <Typography variant="subtitle1" color="text.secondary">
                סה״כ סכום תרומות
            </Typography>
            <Typography variant="h4" fontWeight={view === "split" ? 600 : 800}>
              <Box component="span" sx={{ color: "success.main" }}>
                {totalAmount.toLocaleString("he-IL", {
                  style: "currency",
                  currency: "ILS",
                })}
              </Box>
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="subtitle1" color="text.secondary">
                סה״כ תרומות
            </Typography>
            <Typography variant="h4" fontWeight={800}>{totalDonations}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default KpiRow