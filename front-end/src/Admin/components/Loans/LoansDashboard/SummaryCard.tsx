// SummaryCard.tsx
import React from "react";
import { Paper, Typography } from "@mui/material";

interface SummaryCardProps {
  label: string;
  value: string | number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value }) => (
  <Paper
    elevation={1}
    sx={{
      p: 2,
      textAlign: "center",
      flex: "0 0 170px",
      minHeight: 120,
      borderRadius: 2,
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: 3,
      },
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.75 }}>
      {value}
    </Typography>
  </Paper>
);

export default SummaryCard;
