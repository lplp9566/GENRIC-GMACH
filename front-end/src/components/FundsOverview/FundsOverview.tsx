import { useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { getFundsOverview } from "../../store/features/admin/adminFundsOverviewSlice";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';
import CreditCardOffIcon from '@mui/icons-material/CreditCardOff';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import MoneyOutlinedIcon from '@mui/icons-material/MoneyOutlined';
import FundsOverviewItem from "./FundsOverviewItem";
import LoadingIndicator from "../StatusComponents/LoadingIndicator";
const FundsOverview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { fundsOverview, status, error } = useSelector(
    (s: RootState) => s.adminFundsOverviewReducer
  );

  useEffect(() => {
    dispatch(getFundsOverview());
  }, [dispatch]);

  if (status === "pending" || !fundsOverview) {
    return (
      <LoadingIndicator />
    );
  }

  if (status === "rejected" || error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        bgcolor="background.default"
        color="error.main"
        dir="rtl"
      >
        <Typography variant="h6">
          שגיאה בטעינת הנתונים: {error || "נסה שוב מאוחר יותר."}
        </Typography>
      </Box>
    );
  }



  const cardItems = [
    { label: "הון עצמי", value: fundsOverview.own_equity ,Icon : AccountBalanceWalletIcon},
    { label: "קרן הגמ\"ח", value: fundsOverview.fund_principal  ,Icon : AccountBalanceWalletIcon},
    { label: "כסף נזיל", value: fundsOverview.available_funds ,Icon : AttachMoneyIcon},
    { label: "בהלוואות", value: fundsOverview.total_loaned_out ,  Icon : AccountBalanceIcon},
    { label: "בהשקעות", value: fundsOverview.total_invested ,  Icon : AccountBalanceIcon},
    { label: "רווחי השקעות", value: fundsOverview.Investment_profits ,  Icon : AttachMoneyIcon},
    { label: "קרנות מיוחדות", value: fundsOverview.special_funds ,  Icon : PriceChangeIcon},
    { label: "הפקדות חודשיות", value: fundsOverview.monthly_deposits ,  Icon : SavingsIcon},
    { label: "סך התרומות", value: fundsOverview.total_donations,  Icon : SavingsIcon},
    { label: "תרומות רגילות", value: fundsOverview.total_equity_donations ,  Icon : SavingsIcon},
    { label: "פיקדונות", value: fundsOverview.total_user_deposits,  Icon : SavingsIcon},
    { label: 'החזרי הו"ק', value: fundsOverview.standing_order_return ,  Icon : MoneyOutlinedIcon},
    { label: "מזומן", value: fundsOverview.cash_holdings,  Icon : AttachMoneyIcon},
    { label: "הוצאות", value: fundsOverview.total_expenses ,  Icon : CreditCardOffIcon},
  ];

  return (
    <Box
      p={4}
      bgcolor="background.default"
      minHeight="calc(100vh - 64px)"
      overflow="auto"
      dir="rtl"
      fontFamily="Heebo, Arial, sans-serif"
    >
      <Typography variant="h4" gutterBottom>
        מצב כולל של הגמ"ח
      </Typography>

      <Grid container spacing={4} mb={6}>
        {cardItems.map(({ label, value, Icon }) => {
          return (
            <FundsOverviewItem Icon={Icon} label={label} value={value} />
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
  );
};

export default FundsOverview;
