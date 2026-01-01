// src/pages/LoanDetailsPage/LoanHeader.tsx
import React from "react";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface LoanHeaderProps {
  firstName: string;
  lastName: string;
  principal: number;
  remaining: number;
  balance: number;
  purpose: string;
}

const LoanHeader: React.FC<LoanHeaderProps> = ({
  firstName,
  lastName,
  principal,
  remaining,
  balance,
  purpose,
}) => {
  const repaid = principal - remaining;
  const percentRepaid =
    principal > 0 ? Math.min((repaid / principal) * 100, 100) : 0;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mb: 4,
      }}
    >
      {/* לווה */}
      <Paper
        elevation={3}
        sx={{ p: 2, flex: "1 1 23%", textAlign: "center" }}
      >
        <Typography variant="subtitle2" color="textSecondary">
          לווה
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          {firstName} {lastName}
        </Typography>
      </Paper>

      {/* אחוזי החזר (דונאט) ובלאנס */}
      <Box
        sx={{
          flex: "1 1 20%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box position="relative" display="inline-flex">
            <CircularProgress
              variant="determinate"
              value={percentRepaid}
              size={80}
              thickness={5}
              sx={{ color: "#113E21" }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                {`${Math.round(percentRepaid)}%`}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {balance < 0 ? (
              <TrendingDownIcon sx={{ color: "red" }} fontSize="small" />
            ) : (
              <TrendingUpIcon sx={{ color: "green" }} fontSize="small" />
            )}
            <Typography
              variant="h6"
              fontWeight={700}
              color={balance >= 0 ? "green" : "red"}
            >
              {`${balance.toLocaleString()} ₪`}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* מטרה */}
      <Paper
        elevation={3}
        sx={{ p: 2, flex: "1 1 30%", textAlign: "center"}}
      >
        <Typography variant="subtitle2" color="textSecondary">
          מטרה
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          {purpose}
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoanHeader;
