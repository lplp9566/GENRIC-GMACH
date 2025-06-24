import { Box, Typography } from "@mui/material";
import React from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "./FundsOverview.css"
interface GaugeItemProps {
  label: string;
  value: number;
  max: number;
  color: string;
}
const FundsOverviewGaugeItem: React.FC<GaugeItemProps> = ({
  color,
  label,
  value,
  max,
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <Box
      sx={{
        width: 150,
        textAlign: "center",
        cursor: "default",
        "&:hover .inner-label": {
          opacity: 1,
        },
      }}
    >
      <CircularProgressbar
        value={percentage}
        text={`${Math.round(percentage)}%`}
        strokeWidth={8}
        className="custom-progressbar" // Add a class here
        styles={buildStyles({
          pathColor: color,
          textColor: color,
          trailColor: "#eee",
          textSize: "24px",
        })}
      />
      <Typography
        className="inner-label"
        variant="subtitle1"
        sx={{
          mt: 1,
          opacity: 0.7,
          transition: "opacity 0.3s",
        }}
      >
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        ₪{value.toLocaleString()}
      </Typography>
    </Box>
  );
};
export default FundsOverviewGaugeItem;
