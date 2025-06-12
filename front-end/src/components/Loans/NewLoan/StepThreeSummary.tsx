import React from "react";
import { Card, CardContent, Typography, List, ListItem } from "@mui/material";
import { ICreateLoan } from "../LoanDto";

interface StepThreeProps {
  loan: ICreateLoan & { guarantors: number[] };
}

export const StepThreeSummary: React.FC<StepThreeProps> = ({ loan }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        סיכום פרטי ההלוואה
      </Typography>
      <List>
        <ListItem>משתמש: {loan.user}</ListItem>
        <ListItem>סכום: ₪{loan.loan_amount}</ListItem>
        <ListItem>מטרה: {loan.purpose}</ListItem>
        <ListItem>תאריך הלוואה: {loan.loan_date}</ListItem>
        <ListItem>תשלום חודשי: ₪{loan.monthly_payment}</ListItem>
        <ListItem>יום תשלום: {loan.payment_date}</ListItem>
        <ListItem>מספר ערבויות: {loan.guarantors.length}</ListItem>
        {loan.guarantors.map((g, i) => (
          <ListItem key={i}>ערב #{i + 1}: {g}</ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);