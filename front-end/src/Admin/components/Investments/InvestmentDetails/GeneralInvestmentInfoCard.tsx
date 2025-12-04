import { FC } from "react"
import { InvestmentDto } from "../InvestmentDto"
import { Box, Card, CardContent, Chip, Grid, Typography } from "@mui/material";
import { fmtDate } from "../../../../common/genricFunction";
interface GeneralInvestmentInfoCardProps {
    investment:InvestmentDto
}
const GeneralInvestmentInfoCard:FC<GeneralInvestmentInfoCardProps> = ({ investment }) => {
      const items = [
    {
      label: "שם השקעה",
      value: investment.investment_name,
      color: "#006CF0",
    //   condition:loan.initial_loan_amount !== loan.loan_amount
    },
    {
      label:"הושקעה דרך ",
      value: `₪${investment.investment_by}`,
      color: "#007BFF",
    },
    { label: "חברת השקעה ", 
        value: (investment.company_name), color: "text.primary" },
    { label: "מספר תיק השקעה ", value: investment.investment_portfolio_number, color: "text.primary" },
    {
      label: "ערך נוכחי",
      value: `₪${investment.current_value.toLocaleString()}`,
      color: "#28A960",
    },
    {
      label:"סכום משיכה",
      value: `₪${investment.withdrawn_total.toLocaleString()}`,
      color: "#28A960",
    //   condition: investment.initial_monthly_payment !== investment.monthly_payment,
    },
    { label: "סך הקרן המושקעת", value: investment.total_principal_invested, color: "#FD7E14" },
    {
      label: "סטטוס",
      value: (
        <Chip
          label={investment.is_active ? "פעיל" : "סגור"}
          color={investment.is_active ? "success" : "default"}
        />
      ),
      color: "",
    },
    {
      label: "סך מהקרן נותר ",
      value: `₪${investment.principal_remaining.toLocaleString()}`,
      color: "#DC3545",
    },
    {
      label: "רווח מומש ",
      value: Math.ceil(investment.profit_realized),
      color: "text.primary",
    },
    {
      label: "דמי ניהול ",
      value: investment.management_fees_total,
      color: "text.primary",
    },
    {
      label: "תאריך השקעה ראשוני",
      value: fmtDate(investment.start_date),
      color: "text.primary",
    },
    {
      label: "תאריך עידכון אחרון ",
      value:fmtDate(investment.last_update),
      color: "text.primary",
    },

  ];
  return (
  <Card sx={{ borderRadius: 2, boxShadow: 3, p: 3 }}>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3,textAlign:"center" }}>
          פרטי השקעה כלליים
        </Typography>

        <Grid container spacing={3}>
          {items.map((it, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <Box
                sx={{
                  p: 1.5,
                  backgroundColor: "#F8F9FA",
                  borderRadius: 1,
                  borderLeft: `4px solid ${
                    it.color === "text.primary" || !it.color ? "#CCC" : it.color
                  }`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {it.label}
                </Typography>

                {typeof it.value === "string" ||
                typeof it.value === "number" ? (
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 700, color: it.color }}
                  >
                    {it.value}
                  </Typography>
                ) : (
                  it.value
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default GeneralInvestmentInfoCard