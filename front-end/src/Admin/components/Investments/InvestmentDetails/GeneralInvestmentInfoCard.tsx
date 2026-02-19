import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Divider,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { fmtDate } from "../../../../common/genricFunction";
import { InvestmentDto } from "../InvestmentDto";

interface GeneralInvestmentInfoCardProps {
  investment: InvestmentDto;
}

const GeneralInvestmentInfoCard: React.FC<GeneralInvestmentInfoCardProps> = ({
  investment,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const highlights = [
    {
      label: "סך קרן מושקעת",
      value: `₪${Number(investment.total_principal_invested ?? 0).toLocaleString("he-IL")}`,
    },
    {
      label: "שווי נוכחי",
      value: `₪${Number(investment.current_value ?? 0).toLocaleString("he-IL")}`,
    },
    {
      label: "רווח ממומש",
      value: `₪${Number(investment.profit_realized ?? 0).toLocaleString("he-IL")}`,
    },
  ];

  const items = [
    {
      label: "שם השקעה",
      value: investment.investment_name || "—",
    },
    {
      label: "תאריך השקעה ראשוני",
      value: fmtDate(investment.start_date),
    },
    {
      label: "תאריך עדכון אחרון",
      value: fmtDate(investment.last_update),
    },
    {
      label: "חברת השקעה",
      value: investment.company_name || "—",
    },
    {
      label: "השקעה דרך",
      value: investment.investment_by || "—",
    },
    {
      label: "מספר תיק השקעה",
      value: investment.investment_portfolio_number || "—",
    },
    {
      label: "סך הקרן שנותר",
      value: `₪${Number(investment.principal_remaining ?? 0).toLocaleString("he-IL")}`,
    },
    {
      label: "סכום שנמשך",
      value: `₪${Number(investment.withdrawn_total ?? 0).toLocaleString("he-IL")}`,
    },
    {
      label: "דמי ניהול מצטברים",
      value: `₪${Number(investment.management_fees_total ?? 0).toLocaleString("he-IL")}`,
    },
  ];

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        boxShadow: isDark
          ? "0 18px 42px rgba(0,0,0,0.45)"
          : "0 14px 40px rgba(15, 23, 42, 0.08)",
        background: isDark ? theme.palette.background.paper : "#ffffff",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: { xs: 2.5, md: 3 },
          py: 2.5,
          background: isDark
            ? "linear-gradient(135deg, rgba(30,58,138,0.35) 0%, rgba(12,74,110,0.35) 45%, rgba(6,78,59,0.30) 100%)"
            : "linear-gradient(135deg, rgba(37,99,235,0.10) 0%, rgba(14,165,233,0.10) 45%, rgba(16,185,129,0.08) 100%)",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          direction: "rtl",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
              פרטי השקעה
            </Typography>
            <Typography variant="body2" color="text.secondary">
              סיכום מעודכן על ביצועי ההשקעה
            </Typography>
          </Box>
          <Chip
            label={investment.is_active ? "פעיל" : "סגור"}
            color={investment.is_active ? "success" : "default"}
            sx={{ fontWeight: 700, px: 1, borderRadius: 2 }}
          />
        </Box>
      </Box>

      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Grid container spacing={2} sx={{ direction: "rtl" }}>
          {highlights.map((item) => (
            <Grid item xs={12} md={4} key={item.label}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                  boxShadow: isDark
                    ? "0 8px 24px rgba(0,0,0,0.35)"
                    : "0 8px 24px rgba(15, 23, 42, 0.06)",
                  background: isDark ? alpha(theme.palette.background.paper, 0.9) : "#ffffff",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
                  {item.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2.5} sx={{ direction: "rtl" }}>
          {items.map((it, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                  backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.6) : "#f8fafc",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  minHeight: 86,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75 }}>
                  {it.label}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  {it.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default GeneralInvestmentInfoCard;
