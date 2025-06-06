// LoansDashboardWithCircles.tsx
import React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Typography,
  Container,
} from "@mui/material";
import {
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon,
  TrendingDown as TrendingDownIcon,
  Flag as PurposeIcon,
  AccountBalanceWallet as RemainingIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ILoan } from "./LoanDto";

interface LoanProps {
  loansData: ILoan[];
  total: number;
}

const LoansDashboardWithCircles: React.FC<LoanProps> = ({ loansData, total }) => {
  const navigate = useNavigate();
  const totalAmount = loansData.reduce((sum, loan) => sum + loan.loan_amount, 0);

  return (
    <Box
      sx={{
        backgroundColor: "#F5F5F5",
        minHeight: "100vh",
        pt: 4,
        pb: 6,
        direction: "rtl",
      }}
    >
      <Container maxWidth="lg">
        {/* שני העיגולים למעלה */}
        <Box display="flex" justifyContent="center" gap={4} mb={4}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              bgcolor: "#FFFFFF",
              boxShadow: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              מספר הלוואות
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#006CF0" }}>
              {total}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              bgcolor: "#FFFFFF",
              boxShadow: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              סה״כ הלוואות
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#006CF0" }}>
              ₪{totalAmount.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* רשימת הכרטיסים */}
        <Grid container spacing={4}>
          {loansData.map((loan) => (
            <Grid item xs={12} sm={6} md={4} key={loan.id}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: "transform 0.2s, boxShadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea onClick={() => navigate(`/loans/${loan.id}`)}>
                  <CardContent sx={{ pt: 2, pb: 3, px: 3 }}>
                    {/* צ'יפ סטטוס */}
                    <Box display="flex" justifyContent="flex-end" mb={1}>
                      <Chip
                        label={loan.isActive ? "פעיל" : "סגור"}
                        size="small"
                        sx={{
                          backgroundColor: loan.isActive ? "#D2F7E1" : "#F0F0F0",
                          color: loan.isActive ? "#28A960" : "#6B6B6B",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                        }}
                      />
                    </Box>

                    {/* שם לווה */}
                    <Box textAlign="right" mb={2}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {loan.user.first_name} {loan.user.last_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.2 }}>
                        הלוואה #{loan.id}
                      </Typography>
                    </Box>

                    {/* שלוש שורות Grid: */}
                    <Grid container spacing={1} mb={2}>
                      {/* שורה 1: מטרת ההלוואה | סכום */}
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PurposeIcon fontSize="small" sx={{ color: "#1C3C3C" }} />
                          <Box textAlign="right">
                            <Typography variant="body2" color="text.secondary">
                              מטרת הלוואה
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1C3C3C" }}>
                              {loan.purpose}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AttachMoneyIcon fontSize="small" sx={{ color: "#006CF0" }} />
                          <Box textAlign="right">
                            <Typography variant="body2" color="text.secondary">
                              סכום
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#006CF0" }}>
                              ₪{loan.loan_amount.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      {/* שורה 2: יום תשלום | תשלום חודשי */}
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarTodayIcon fontSize="small" sx={{ color: "#28A960" }} />
                          <Box textAlign="right">
                            <Typography variant="body2" color="text.secondary">
                              יום תשלום
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#28A960" }}>
                              {loan.payment_date} לחודש
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AttachMoneyIcon fontSize="small" sx={{ color: "#28A960" }} />
                          <Box textAlign="right">
                            <Typography variant="body2" color="text.secondary">
                              תשלום חודשי
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#28A960" }}>
                              ₪{loan.monthly_payment.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      {/* שורה 3: תשלומים נשארו | יתרה לסילוק */}
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <TrendingDownIcon fontSize="small" sx={{ color: "#1C3C3C" }} />
                          <Box textAlign="right">
                            <Typography variant="body2" color="text.secondary">
                              תשלומים נשארו
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1C3C3C" }}>
                              {`${Math.ceil(loan.total_installments)} תשלומים`}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <RemainingIcon fontSize="small" sx={{ color: "#D35400" }} />
                          <Box textAlign="right">
                            <Typography variant="body2" color="text.secondary">
                              יתרה לסילוק
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#D35400" }}>
                              ₪{loan.remaining_balance.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LoansDashboardWithCircles;
