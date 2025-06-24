import React, { useEffect } from "react";
import { Box, Typography, Switch, FormControlLabel, Grid } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store";
import { getFundsOverview } from "../../../store/features/admin/adminFundsOverviewSlice";
import LoadingIndicator from "../StatusComponents/LoadingIndicator";
import FundsOverviewGauge from "./FundsOverviewGauge/FundsOverviewGauge";
import FundsOverviewDefault from "./FundsOverviewDefault/FundsOverviewDefault"; // Assuming you'll create this component
import ErrorMessage from "../StatusComponents/ErrorMessage";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';
import CreditCardOffIcon from '@mui/icons-material/CreditCardOff';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import MoneyOutlinedIcon from '@mui/icons-material/MoneyOutlined';

const FundsOverview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { fundsOverview, status, error } = useSelector(
    (s: RootState) => s.adminFundsOverviewReducer
  );

  const [displayMode, setDisplayMode] = React.useState<"gauge" | "default">(
    "default"
  );

  useEffect(() => {
    dispatch(getFundsOverview());
  }, [dispatch]);

  if (status === "pending" || !fundsOverview) {
    return <LoadingIndicator />;
  }

  if (status === "rejected" || error) {
    return <ErrorMessage errorMessage={error} />;
  }

  const items = [
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

  const max = fundsOverview.own_equity;
  const COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#556270",
    "#C7F464",
    "#FFCC5C",
    "#96CEB4",
  ];

  const handleDisplayModeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDisplayMode(event.target.checked ? "gauge" : "default");
  };

  return (
    <Box
      p={4}
      dir="rtl"
      fontFamily="Heebo, Arial, sans-serif"
      sx={{
        display: "flex",
        flexDirection: "column",
        maxHeight: "100vh",
        padding: 0,
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        fontWeight="bold"
        sx={{ textAlign: "center",
          justifyContent: "start",
          margin: 0,
          padding: 0,
         }}
      >
        מצב כולל של הגמ"ח
      </Typography>

      <Grid
        container
        justifyContent="center"
        alignItems="center"
        spacing={2}
        sx={{ mb: 3,
          margin: 0,
         }}
      >
        <Grid item>
          <Typography
            variant="body1"
            color={
              displayMode === "default" ? "primary.main" : "text.secondary"
            }
          >
            מצב רגיל
          </Typography>
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Switch
                checked={displayMode === "gauge"}
                onChange={handleDisplayModeChange}
                name="displayModeToggle"
                color="success"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: COLORS[1],
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: COLORS[1], // Track color when checked
                  },
                }}
              />
            }
            label="" 
            labelPlacement="start"
          />
        </Grid>
        <Grid item>
          <Typography
            variant="body1"
            color={displayMode === "gauge" ? "primary.main" : "text.secondary"}
          >
            מצב אחוזים
          </Typography>
        </Grid>
      </Grid>

      {displayMode === "gauge" ? (
        <FundsOverviewGauge COLORS={COLORS} items={items} max={max} />
      ) : (
        <FundsOverviewDefault items={items} fundsOverview={fundsOverview}/>
      )}
    </Box>
  );
};

export default FundsOverview;
