import  { useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { getFundsOverview } from "../store/features/admin/adminFundsOverviewSlice";
import type { AppDispatch } from '../store/store';

const FundsOverviewPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        dispatch(getFundsOverview());
      }, [dispatch]);
    const {fundsOverview} = useSelector(
      (state: RootState) => state.adminFundsOverviewReducer
    )
    console.log(fundsOverview)
    if (!fundsOverview) {
        return <div>טוען נתונים...</div>;
      }
    
    const cardItems = [
        { label: "הון עצמי", value: fundsOverview.own_equity },
        { label: 'קרן הגמ"ח', value: fundsOverview.fund_principal },
        { label: "כסף נזיל", value: fundsOverview.available_funds },
        { label: "בהלוואות", value: fundsOverview.total_loaned_out },
        { label: "בהשקעות", value: fundsOverview.total_invested },
        { label: "רווחי השקעות", value: fundsOverview.Investment_profits },
        { label: "קרנות מיוחדות", value: fundsOverview.special_funds },
        { label: "הפקדות חודשיות", value: fundsOverview.monthly_deposits },
        { label: "סך התרומות", value: fundsOverview.total_donations },
        { label: "תרומות רגילות", value: fundsOverview.total_equity_donations },
        { label: "פיקדונות", value: fundsOverview.total_user_deposits },
        { label: 'החזרי הו"ק', value: fundsOverview.standing_order_return },
        { label: " מזומן", value: fundsOverview.cash_holdings },
        { label: "הוצאות", value: fundsOverview.total_expenses },
      ];
  return (
    <Box
      sx={{
        p: 4,
        direction: "rtl",
        backgroundColor: "#F4F6F8",
        height: "78vh",
        overflow: "auto",
      }}
    >
      <Typography variant="h4" gutterBottom fontWeight="bold">
        מצב כולל של הגמ"ח
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {cardItems.map((item) => (
          <Grid item xs={6} sm={6} md={4} lg={3} key={item.label}>
            <Card
              sx={{
                backgroundColor: "#fff",
                borderLeft: "4px solid #1E3A3A",
                boxShadow: 1,
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {item.label}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  ₪{(item.value ?? 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          פירוט קרנות מיוחדות
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {Object.entries(fundsOverview.fund_details).map(([name, amount]) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={name}>
              <Card
                sx={{
                  backgroundColor: "#FAFAFA",
                  boxShadow: 0,
                  border: "1px solid #E0E0E0",
                }}
              >
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {name}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    ₪{amount.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default FundsOverviewPage;
