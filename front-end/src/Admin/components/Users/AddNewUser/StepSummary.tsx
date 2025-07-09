import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { IAddUserFormData } from "../UsersDto";

interface Props {
  data: IAddUserFormData;
}

const StepSummary: React.FC<Props> = ({ data }) => (
  <Paper variant="outlined" sx={{ p: 3, backgroundColor: "#e9f5e9", mb: 2,  textAlign: "center"  }}>
    <Typography variant="h6" gutterBottom>סיכום הנתונים</Typography>
    <Typography>שם: {data.userData.first_name} {data.userData.last_name}</Typography>
    <Typography>תז: {data.userData.id_number}</Typography>
    <Typography>דוא"ל: {data.userData.email_address}</Typography>
    <Typography>טלפון: {data.userData.phone_number}</Typography>
    <Typography>מנהל: {data.userData.is_admin ? "כן" : "לא"}</Typography>
    <Typography>תפקיד: {data.userData.current_role}</Typography>
    <Box mt={2} />
    <Typography>בנק: {data.paymentData.bank_number}</Typography>
    <Typography>סניף: {data.paymentData.bank_branch}</Typography>
    <Typography>חשבון: {data.paymentData.bank_account_number}</Typography>
    <Typography>תאריך חיוב: {data.paymentData.charge_date}</Typography>
    <Typography>אופן תשלום: {data.paymentData.payment_method}</Typography>
  </Paper>
);

export default StepSummary;
