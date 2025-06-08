import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
} from "@mui/material";
import { ILoan } from "../LoanDto";

interface Props {
  loan: ILoan;
}

export const GeneralInfoCard: React.FC<Props> = ({ loan }) => {
  /** רשימת נתונים להצגה */
  const items = [
    {
      label: "סכום הלוואה ראשוני",
      value: `₪${loan.initial_loan_amount.toLocaleString()}`,
      color: "#006CF0",
    },
    {
      label: "סכום הלוואה נוכחי",
      value: `₪${loan.loan_amount.toLocaleString()}`,
      color: "#007BFF",
    },
    { label: "תאריך הלוואה", value: loan.loan_date, color: "text.primary" },
    { label: "מטרה", value: loan.purpose, color: "text.primary" },
    {
      label: "תשלום חודשי",
      value: `₪${loan.monthly_payment.toLocaleString()}`,
      color: "#28A960",
    },
    {
      label: "תשלום חודשי התחלתי",
      value: `₪${loan.initial_monthly_payment.toLocaleString()}`,
      color: "#28A960",
    },
    { label: "יום תשלום בחודש", value: loan.payment_date, color: "#FD7E14" },
    {
      label: "סטטוס",
      value: (
        <Chip
          label={loan.isActive ? "פעיל" : "סגור"}
          color={loan.isActive ? "success" : "default"}
        />
      ),
      color: "",
    },
    {
      label: "יתרה נוכחית",
      value: `₪${loan.remaining_balance.toLocaleString()}`,
      color: "#DC3545",
    },
    {
      label: 'סה"כ תשלומים שנותרו',
      value: loan.total_installments,
      color: "text.primary",
    },
    {
      label: "מס תשלומים ששולמו ",
      value: loan.total_remaining_payments,
      color: "text.primary",
    },
    {
      label: "בלאנס",
      value: `₪${loan.balance.toLocaleString()}`,
      color: "text.primary",
    },
    {
      label: "ערב 1",
      value: loan.guarantor1 ?? "אין",
      color: "text.primary",
    },
    {
      label: "ערב 2",
      value: loan.guarantor2 ?? "אין",
      color: "text.primary",
    },
  ];

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3, p: 3 }}>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          פרטי הלוואה כלליים
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
  );
};
