// StepSummary.tsx
import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import { IAddUserFormData } from "../UsersDto";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import { revertPaymentMethod } from "../../../../common/revertTypes/PaymentMethed";

interface Props {
  data: IAddUserFormData;
}

const StepSummary: React.FC<Props> = ({ data }) => {
  const allRanks = useSelector(
    (state: RootState) => state.AdminRankSlice.memberShipRanks
  );
  const rankName = allRanks.find((r) => r.id === data.userData.current_role)
    ?.name;

  const hasSpouse =
    data.userData.spouse_first_name ||
    data.userData.spouse_last_name ||
    data.userData.spouse_id_number;

  return (
    <Box mb={2}>
      <Typography variant="h5" align="center" gutterBottom>
        סיכום והשלמה
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" textAlign={"center"} gutterBottom>
                פרטי בנק
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography align="center">
                <strong>בנק:</strong> {data.paymentData.bank_number}
              </Typography>
              <Typography align={"center"}>
                <strong>סניף:</strong> {data.paymentData.bank_branch}
              </Typography>
              <Typography align={"center"}>
                <strong>חשבון:</strong> {data.paymentData.bank_account_number}
              </Typography>
              <Typography align={"center"}>
                <strong>תאריך חיוב:</strong> {data.paymentData.charge_date}
              </Typography>
              <Typography align={"center"}>
                <strong>אמצעי תשלום:</strong> {" "}
                {revertPaymentMethod(data.paymentData.payment_method)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography align={"center"} variant="h6" gutterBottom>
                פרטי משתמש
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography align={"center"}>
                <strong>שם מלא:</strong> {data.userData.first_name} {data.userData.last_name}
              </Typography>
              <Typography align={"center"}>
                <strong>ת"ז:</strong> {data.userData.id_number}
              </Typography>
              <Typography align={"center"}>
                <strong>אימייל:</strong> {data.userData.email_address}
              </Typography>
              <Typography align={"center"}>
                <strong>טלפון:</strong> {data.userData.phone_number}
              </Typography>
              <Typography align={"center"}>
                <strong>הרשאה:</strong> {data.userData.is_admin ? "אדמין" : "משתמש"}
              </Typography>
              <Typography align={"center"}>
                <strong>דרגה:</strong> {rankName}
              </Typography>
              {hasSpouse && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography align={"center"}>
                    <strong>בן/בת זוג:</strong> {data.userData.spouse_first_name} {data.userData.spouse_last_name}
                  </Typography>
                  <Typography align={"center"}>
                    <strong>ת"ז בן/בת זוג:</strong> {data.userData.spouse_id_number}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StepSummary;
