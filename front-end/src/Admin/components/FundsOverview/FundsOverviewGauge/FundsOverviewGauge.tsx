import { Box } from "@mui/material";
import React from "react";
import FundsOverviewGaugeItem from "./FundsOverviewGaugeItem";
interface GaugeProps {
  items: { label: string; value: number ,Icon : any}[];
  max: number;
  COLORS: string[];
}

const FundsOverviewGauge: React.FC<GaugeProps> = ({ items, max, COLORS }) => {
  return (
    <Box
      p={4}
      dir="rtl"
      fontFamily="Heebo, Arial, sans-serif"
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 2,
        // padding: 0,
        width: "90%",
       maxHeight: "60vh",

      }}
    >
      {items.map((item, idx) => (
        item.label !== "הוצאות" && item.label !== "רווחי השקעות" && item.label  &&
        <FundsOverviewGaugeItem
          key={item.label}
          label={item.label}
          value={item.value}
          max={max}
          color={COLORS[idx % COLORS.length]}
        />
      ))}
    </Box>
  );
};

export default FundsOverviewGauge;
