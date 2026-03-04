import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import SectionTitle from "./SectionTitle";
import { formatILS } from "../../../../Admin/components/HomePage/HomePage";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import HandshakeIcon from "@mui/icons-material/Handshake";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import SavingsIcon from "@mui/icons-material/Savings";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import PaidIcon from "@mui/icons-material/Paid";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";

type StatCard = {
  title: string;
  value: number | null | undefined;
  detail: string;
  kind: "money" | "count";
};

type Props = {
  cards: StatCard[];
  surface: string;
  softBorder: string;
};

const getCardIcon = (title: string) => {
  if (title.includes('סה"כ תרומות')) return <VolunteerActivismIcon />;
  if (title.includes("תרומות רגילות")) return <AutoGraphIcon />;
  if (title.includes("תרומות לקרנות מיוחדות")) return <HandshakeIcon />;
  if (title.includes("דמי חבר")) return <AccountBalanceWalletIcon />;
  if (title.includes("סכום הלוואות שנלקחו")) return <AccountBalanceIcon />;
  if (title.includes("כמות הלוואות")) return <FormatListNumberedIcon />;
  if (title.includes("סכום הלוואות שנפרעו")) return <PriceCheckIcon />;
  if (title.includes("הפקדות קבועות")) return <SavingsIcon />;
  if (title.includes("משיכות מהפקדות")) return <MoneyOffIcon />;
  if (title.includes("החזרים בהוראות קבע")) return <CurrencyExchangeIcon />;
  if (title.includes("אחזקה במזומן")) return <PaidIcon />;
  return <PaidIcon />;
};

const UserFullStatsSection = ({ cards, surface, softBorder }: Props) => (
  <>
    <SectionTitle align="center">הנתונים המלאים</SectionTitle>

    <Grid container spacing={{ xs: 2, md: 3 }}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={4} key={card.title}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 5,
              background: surface,
              border: softBorder,
              backdropFilter: "blur(8px)",
            }}
          >
            <Box sx={{ position: "relative", minHeight: 98 }}>
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  bgcolor: "action.hover",
                  display: "grid",
                  placeItems: "center",
                  color: "#22c55e",
                }}
              >
                {getCardIcon(card.title)}
              </Box>

              <Stack spacing={1} alignItems="center" textAlign="center">
                <Typography variant="subtitle2" fontWeight={900}>
                  {card.title}
                </Typography>

                <Typography variant="h6" fontWeight={900}>
                  {card.value == null
                    ? "לא הוגדר"
                    : card.kind === "count"
                      ? Number(card.value ?? 0).toLocaleString("he-IL")
                      : formatILS(card.value)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {card.detail}
                </Typography>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </>
);

export default UserFullStatsSection;
