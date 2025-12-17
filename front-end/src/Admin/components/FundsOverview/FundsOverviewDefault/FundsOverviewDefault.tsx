import { Box, Card, CardContent, Divider, Grid, Typography } from "@mui/material";
import React from "react";
import FundsOverviewItemDefault from "./FundsOverviewItemDefault";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { IFundDonation } from "../../Donations/DonationDto";

interface FundsOverviewItemProps {
  items: { label: string; value: number; Icon: typeof AttachMoneyIcon }[];

  // ✅ במקום fundsOverview.fund_details (JSON)
  funds: IFundDonation[];
}

const FundsOverviewDefault: React.FC<FundsOverviewItemProps> = ({ items, funds }) => {
  return (
    <Box
      p={4}
      bgcolor="background.default"
      dir="rtl"
      fontFamily="Heebo, Arial, sans-serif"
    >
      <Grid container spacing={4} mb={6}>
        {items.map(({ label, value, Icon }) => (
          <FundsOverviewItemDefault key={label} Icon={Icon} label={label} value={value} />
        ))}
      </Grid>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          פירוט קרנות מיוחדות
        </Typography>
        <Divider />

        <Grid container spacing={3} mt={1}>
          {(funds ?? []).map((f) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={f.id ?? f.name}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: "right" }}>
                  <Typography variant="subtitle1">{f.name}</Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ direction: "ltr" }}>
                    {Number(f.balance ?? 0).toLocaleString("he-IL", {
                      style: "currency",
                      currency: "ILS",
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {!funds?.length && (
            <Grid item xs={12}>
              <Typography color="text.secondary">אין קרנות להצגה</Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default FundsOverviewDefault;
