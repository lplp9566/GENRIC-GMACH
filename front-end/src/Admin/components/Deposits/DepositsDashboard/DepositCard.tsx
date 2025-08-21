import { FC } from "react";
import { IDeposit } from "../depositsDto";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
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
  deposit: IDeposit;
  onClick: () => void;
}

const fmtCurrency = (n?: number | null) =>
  typeof n === "number" ? `₪${n.toLocaleString("he-IL")}` : "—";

const fmtDate = (v?: string | Date | null) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("he-IL");
};

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
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box textAlign="right">
              <Typography variant="h6" fontWeight={700}>
                {deposit.user?.first_name ?? ""} {deposit.user?.last_name ?? ""}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.2}>
                הפקדה #{deposit.id}
              </Typography>
            </Box>
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

          {/* Body */}
          <Grid container spacing={2}>
            {/* סכום ראשוני */}
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <AttachMoneyIcon fontSize="small" sx={{ color: "#006CF0" }} />
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">
                    סכום התחלתי
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="#006CF0">
                    {fmtCurrency(deposit.initialDeposit)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* סכום נוכחי */}
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <AttachMoneyIcon fontSize="small" sx={{ color: "#28A960" }} />
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">
                    סכום נוכחי
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="#28A960">
                    {fmtCurrency(deposit.current_balance)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* תאריך התחלה */}
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">
                    תאריך התחלה
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {fmtDate(deposit.start_date)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* תאריך סיום */}
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">
                    תאריך סיום
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {fmtDate(deposit.end_date)}
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

export default DepositCard;
