import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import React from "react";
import {
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon,
  Flag as InvestmentNameIcon,
  Business as BusinessIcon,
  AccountBalanceWallet as WalletIcon,
} from "@mui/icons-material";
import { InvestmentDto } from "./InvestmentDto";

interface InvestmentCardProps {
  investment: InvestmentDto;
  onClick: () => void;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investment,
  onClick,
}) => {
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 2,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ pt: 2, pb: 3, px: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box textAlign="right">
              <Typography variant="body2" color="text.secondary" mt={0.2}>
                השקעה #{investment.id}
              </Typography>
            </Box>

            <Chip
              label={investment.is_active ? "פעיל" : "סגור"}
              size="small"
              sx={{
                backgroundColor: investment.is_active ? "#D2F7E1" : "#F0F0F0",
                color: investment.is_active ? "#28A960" : "#6B6B6B",
                fontWeight: 600,
                fontSize: "0.8rem",
              }}
            />
          </Box>
          <Grid container spacing={1} mb={2}>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <InvestmentNameIcon
                  fontSize="small"
                  sx={{ color: "#1C3C3C" }}
                />
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">
                    שם השקעה
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="#1C3C3C"
                  >
                    {investment.investment_name}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <BusinessIcon fontSize="small" sx={{ color: "#28A960" }} />
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">
                    חברת השקעה
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="#28A960"
                  >
                    {investment.company_name}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <WalletIcon fontSize="small" sx={{ color: "#28A960" }} />
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">
                    הושקע דרך
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="#28A960"
                  >
                    {investment.investment_by}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarTodayIcon fontSize="small" sx={{ color: "#D35400" }} />
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">
                    תאריך עדכון אחרון
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="#D35400"
                  >
                    {investment.last_update?.toString().split("T")[0]}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <AttachMoneyIcon fontSize="small" sx={{ color: "#D35400" }} />
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">
                    סך הקרן המושקעת
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="#D35400"
                  >
                    ₪{investment.total_principal_invested.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <AttachMoneyIcon fontSize="small" sx={{ color: "#006CF0" }} />
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">
                    ערך נוכחי
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="#006CF0"
                  >
                    ₪{investment.current_value.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default InvestmentCard;
