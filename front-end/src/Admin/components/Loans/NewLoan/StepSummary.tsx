// src/components/Loans/StepSummary.tsx
import React from "react";
import { Card, Typography, Stack } from "@mui/material";
import { fmtDate } from "../../../../common/genricFunction";

interface StepSummaryProps {
  newLoan: {
    loan_amount: number;
    purpose: string;
    loan_date: string;
    monthly_payment: number;
    payment_date: number;
  };
  borrowerName: string;
  guarantors: { firstName: string; lastName: string }[];
}

const StepSummary: React.FC<StepSummaryProps> = ({
  newLoan,
  borrowerName,
  guarantors,
}) => (
  <Card
    variant="outlined"
    sx={{
      p: 3,
      mb: 2,
      borderColor: "#0b5e29", 
      boxShadow: 2,
      textAlign:'center'
    }}
  >
    <Typography variant="h6" gutterBottom>
      סיכום ואישור
    </Typography>
    <Stack spacing={1}>
      <Typography>
        <strong>לווה:</strong> {borrowerName}
      </Typography>
      <Typography>
        <strong>סכום:</strong> ₪{newLoan.loan_amount}
      </Typography>
      <Typography>
        <strong>מטרה:</strong> {newLoan.purpose}
      </Typography>
      <Typography>
        <strong>תאריך:</strong> {fmtDate(newLoan.loan_date)}
      </Typography>
      <Typography>
        <strong>תשלום חודשי:</strong> ₪{newLoan.monthly_payment}
      </Typography>
      <Typography>
        <strong>יום תשלום:</strong> {newLoan.payment_date}
      </Typography>
      <Typography>
        <strong>ערבויות:</strong> {guarantors.length}
      </Typography>
      {guarantors.map((g, i) => (
        <Typography key={i}>
          ערב #{i + 1}: {g.firstName} {g.lastName}
        </Typography>
      ))}
    </Stack>
  </Card>
);

export default StepSummary;
