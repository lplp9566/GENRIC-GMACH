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
      p: 3,
      textAlign: "center",
      flex: "0 0 200px",
      borderRadius: 2,
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: 4,
      },
    }}
  >
    <Typography variant="subtitle2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
      {value}
    </Typography>
  </Paper>
);

export default SummaryCard;
