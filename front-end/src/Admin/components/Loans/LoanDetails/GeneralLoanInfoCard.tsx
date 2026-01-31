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
import { ILoanWithPayment } from "../LoanDto";
import { fmtDate } from "../../../../common/genricFunction";

interface Props {
  loan: ILoanWithPayment;
}

export const GeneralLoanInfoCard: React.FC<Props> = ({ loan }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const highlights = [
    {
      label: "סכום הלוואה",
      value: `₪${loan.loan_amount.toLocaleString("he-IL")}`,
      colorKey: "primary",
    },
    {
      label: "יתרה לתשלום",
      value: `₪${loan.remaining_balance.toLocaleString("he-IL")}`,
      colorKey: "error",
    },
    {
      label: "תשלום חודשי",
      value: `₪${loan.monthly_payment.toLocaleString("he-IL")}`,
      colorKey: "success",
    },
  ];

  const items = [
    {
      label: "סכום הלוואה ראשוני",
      value: `₪${loan.initial_loan_amount.toLocaleString("he-IL")}`,
      condition: loan.initial_loan_amount !== loan.loan_amount,
    },
    {
      label: "תאריך הלוואה",
      value: fmtDate(loan.loan_date),
    },
    {
      label: "תאריך תחילת התשלום",
      value: fmtDate(loan.first_payment_date),
      condition: loan.first_payment_date !== null,
    },
    {
      label: "מטרה",
      value: loan.purpose,
    },
    {
      label: "תשלום חודשי התחלתי",
      value: `₪${loan.initial_monthly_payment.toLocaleString("he-IL")}`,
      condition: loan.initial_monthly_payment !== loan.monthly_payment,
    },
    {
      label: "יום תשלום בחודש",
      value: loan.payment_date,
    },
    {
      label: "סה\"כ תשלומים שנותרו",
      value: Math.ceil(loan.total_installments),
    },
    {
      label: "מספר תשלומים ששולמו",
      value: loan.total_remaining_payments,
    },
    {
      label: "בלאנס",
      value: `₪${loan.balance.toLocaleString("he-IL")}`,
    },
    {
      label: "ערב 1",
      value: loan.guarantor1 ?? "אין",
    },
    {
      label: "ערב 2",
      value: loan.guarantor2 ?? "אין",
    },
  ];

  const itemsToRender = items.filter((it) => it.condition !== false);

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
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: theme.palette.text.primary }}
            >
              פרטי הלוואה
            </Typography>
            <Typography variant="body2" color="text.secondary">
              סיכום מעודכן על הפעילות והתשלומים
            </Typography>
          </Box>
          <Chip
            label={loan.isActive ? "פעיל" : "סגור"}
            color={loan.isActive ? "success" : "default"}
            sx={{
              fontWeight: 700,
              px: 1,
              borderRadius: 2,
            }}
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
                  background: isDark
                    ? alpha(theme.palette.background.paper, 0.9)
                    : "#ffffff",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 4,
                    borderRadius: 999,
                    mb: 1.5,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    mt: 0.5,
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2.5} sx={{ direction: "rtl" }}>
          {itemsToRender.map((it, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                  backgroundColor: isDark
                    ? alpha(theme.palette.background.paper, 0.6)
                    : "#f8fafc",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  minHeight: 86,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.75 }}
                >
                  {it.label}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 700, color: theme.palette.text.primary }}
                >
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
