import React from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import useMediaQuery from "@mui/material/useMediaQuery";

interface PieItem {
  name: string;
  value: number;
  color: string;
}

interface PieChartGraphProps {
  pieData: PieItem[];
}

const PieChartGraph: React.FC<PieChartGraphProps> = ({ pieData }) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          outerRadius={isMobile ? 120 : 150}
          dataKey="value"
          nameKey="name"
          label={false}   
        >
          {pieData.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.color} />
          ))}
        </Pie>

        {/* Tooltip = המקום היחיד שבו רואים שם + סכום */}
        <Tooltip
          formatter={(value: any, name: any) => [
            `₪${Number(value ?? 0).toLocaleString()}`,
            name,
          ]}
        />

        {/* Legend ברור, בלי עומס */}
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{
            direction: "rtl",
            marginTop: 12,
            fontSize: 13,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartGraph;
