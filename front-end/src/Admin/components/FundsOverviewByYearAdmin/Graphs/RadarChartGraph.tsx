import React from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Box, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

interface RadarChartGraphProps {
  RadarData: { name: string; value: number; color?: string }[];
}

const RadarTooltip = ({ active, payload }: any) => {
  const theme = useTheme();
  if (!active || !payload?.length) return null;

  // ברדאר, ה־payload[0].payload הוא האובייקט המקורי של הנקודה
  const p0 = payload[0];
  const point = p0?.payload; // { name, value, color }

  const title = point?.name ?? "נתון";
  const val = Number(point?.value ?? 0);

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.96),
        border: `1px solid ${alpha(theme.palette.divider, 1)}`,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 14px 34px rgba(0,0,0,0.55)"
            : "0 10px 26px rgba(0,0,0,0.22)",
        minWidth: 200,
        direction: "rtl",
      }}
    >
      <Typography variant="body2" fontWeight={900} mb={0.5}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        ₪{val.toLocaleString()}
      </Typography>
    </Box>
  );
};

const RadarChartGraph: React.FC<RadarChartGraphProps> = ({ RadarData }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={RadarData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 13 }} />
        <PolarRadiusAxis />

        {/* אם תרצה צבע דינאמי לפי data, אפשר להחליף */}
        <Radar dataKey="value" stroke="#b17be4" fill="#b17be4" fillOpacity={0.6} />

        <Legend />
        <Tooltip content={<RadarTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChartGraph;
