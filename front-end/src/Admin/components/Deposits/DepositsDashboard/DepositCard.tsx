import { FC } from "react";
import { IDeposit } from "../depositsDto";
import {
  AttachMoney as AttachMoneyIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
interface DepositCardProps {
  deposit: IDeposit; // Replace 'any' with the actual type of deposit
  onClick: () => void;
}
const DepositCard: FC<DepositCardProps> = ({ deposit, onClick }) => {
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
              <Typography variant="h6" fontWeight={700}>
                {deposit.user.first_name} {deposit.user.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.2}>
                הלוואה #{deposit.id}
              </Typography>
            </Box>
            {/* <Box display="flex" alignItems="center" gap={0.5}>
              {balancePositive ? (
                <TrendingUpIcon fontSize="small" sx={{ color: "#28A960" }} />
              ) : (
                <TrendingDownIcon fontSize="small" sx={{ color: "#D35400" }} />
              )}
              <Typography
                variant="body2"
                fontWeight={600}
                color={balancePositive ? "#28A960" : "#D35400"}
              >
                ₪{Math.abs(loan.balance ?? 0).toLocaleString()}
              </Typography>
            </Box> */}
            <Chip
              label={deposit.isActive ? "פעיל" : "סגור"}
              size="small"
              sx={{
                backgroundColor: deposit.isActive ? "#D2F7E1" : "#F0F0F0",
                color: deposit.isActive ? "#28A960" : "#6B6B6B",
                fontWeight: 600,
                fontSize: "0.8rem",
              }}
            />
          </Box>
          <Grid container spacing={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoneyIcon fontSize="small" sx={{ color: "#006CF0" }} />
              <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  סכום ראשוני
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="#006CF0"
                >
                  ₪{deposit.initialDeposit.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoneyIcon fontSize="small" sx={{ color: "#28A960" }} />
              <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  תאריך התחלה{" "}
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="#28A960"
                >
                  ₪{deposit.start_date.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
                    <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoneyIcon fontSize="small" sx={{ color: "#28A960" }} />
              <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  תאריך סיום{" "}
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="#28A960"
                >
                  ₪{deposit.end_date!.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
                    <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoneyIcon fontSize="small" sx={{ color: "#28A960" }} />
              <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                   סכום נוכחי{" "}
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="#28A960"
                >
                  ₪{deposit.start_date.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DepositCard;
