import React, { useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Divider,
  CircularProgress,
  CardContent,
  Card,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { getFundsOverview } from "../../store/features/admin/adminFundsOverviewSlice";
import FundsOverviewItem from "./FundsOverviewItem";

// אייקונים “עתידניים” ל־2025
import RocketLaunchIcon       from '@mui/icons-material/RocketLaunch';
import TrendingUpIcon         from '@mui/icons-material/TrendingUp';
import CurrencyBitcoinIcon    from '@mui/icons-material/CurrencyBitcoin';
import HandshakeIcon          from '@mui/icons-material/Handshake';
import WaterfallChartIcon     from '@mui/icons-material/WaterfallChart';
import AccountTreeIcon        from '@mui/icons-material/AccountTree';
import CalendarTodayIcon      from '@mui/icons-material/CalendarToday';
import VolunteerActivismIcon  from '@mui/icons-material/VolunteerActivism';
import SavingsOutlinedIcon    from '@mui/icons-material/SavingsOutlined';
import ReportProblemIcon      from '@mui/icons-material/ReportProblem';

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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        bgcolor="background.default"
        dir="rtl"
      >
        <CircularProgress />
        <Typography variant="h6" ml={2} color="text.secondary">
          טוען נתונים...
        </Typography>
      </Box>
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
    { label: "הון עצמי",            value: fundsOverview.own_equity,          Icon: TrendingUpIcon        },
    { label: "קרן הגמ\"ח",           value: fundsOverview.fund_principal,      Icon: HandshakeIcon         },
    { label: "כסף נזיל",            value: fundsOverview.available_funds,      Icon: CurrencyBitcoinIcon   },
    { label: "בהלוואות",            value: fundsOverview.total_loaned_out,     Icon: RocketLaunchIcon      },
    { label: "בהשקעות",             value: fundsOverview.total_invested,       Icon: WaterfallChartIcon    },
    { label: "רווחי השקעות",        value: fundsOverview.Investment_profits,   Icon: TrendingUpIcon        },
    { label: "קרנות מיוחדות",        value: fundsOverview.special_funds,        Icon: AccountTreeIcon       },
    { label: "הפקדות חודשיות",      value: fundsOverview.monthly_deposits,     Icon: CalendarTodayIcon     },
    { label: "סך התרומות",          value: fundsOverview.total_donations,      Icon: VolunteerActivismIcon },
    { label: "תרומות רגילות",       value: fundsOverview.total_equity_donations,Icon: VolunteerActivismIcon},
    { label: "פיקדונות",            value: fundsOverview.total_user_deposits,  Icon: SavingsOutlinedIcon   },
    { label: 'החזרי הו\"ק',         value: fundsOverview.standing_order_return,Icon: HandshakeIcon        },
    { label: "מזומן",               value: fundsOverview.cash_holdings,        Icon: CurrencyBitcoinIcon   },
    { label: "הוצאות",              value: fundsOverview.total_expenses,       Icon: ReportProblemIcon     },
  ];

  return (
    <Box
      p={4}
      dir="rtl"
      sx={{
        background: theme =>
          `linear-gradient(180deg, ${theme.palette.background.default}B3 0%, ${theme.palette.background.default} 100%)`,
        minHeight: "calc(100vh - 64px)",
        fontFamily: "Heebo, Arial, sans-serif",
      }}
    >
      <Typography variant="h4" gutterBottom>
        מצב כולל של הגמ"ח
      </Typography>

      <Grid container spacing={4} mb={6}>
        {cardItems.map((item, i) => (
          <FundsOverviewItem
            key={item.label}
            label={item.label}
            value={item.value}
            Icon={item.Icon}
            animationDelay={ i * 100 }
          />
        ))}
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
                <CardContent sx={{ textAlign: "right" }}>
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
