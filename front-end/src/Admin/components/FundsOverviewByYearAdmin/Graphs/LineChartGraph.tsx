import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import { AdminYearlyFinancialItems, UserAdminFinancialItems } from "../items";
import { alpha, useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

interface LineChartGrapeProps {
  data: any[];
  selectedFields: string[];
  COLORS: string[];
}

// ✅ Tooltip מותאם ל־Theme
 export const ChartTooltip = ({ active, payload, label }: any) => {
  const theme = useTheme();

  if (!active || !payload?.length) return null;

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
        minWidth: 220,
        direction: "rtl",
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block" mb={0.75}>
        {label}
      </Typography>

      {payload.map((p: any, i: number) => (
        <Box
          key={i}
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 0.5 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: p.color,
                flex: "0 0 auto",
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: p.color,
                fontWeight: 800,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={p.name}
            >
              {p.name}
            </Typography>
          </Box>

          <Typography variant="body2" fontWeight={900} color={p.color}>
            ₪{Number(p.value ?? 0).toLocaleString()}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const LineChartGraph: React.FC<LineChartGrapeProps> = ({ data, selectedFields, COLORS }) => {
  const theme = useTheme();
  const { selectedUser } = useSelector((state: RootState) => state.AdminUsers);

  // צבעים ל־צירים/גריד/טקסט לפי theme
  const gridColor = alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.18 : 0.12);
  const axisColor = alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.65 : 0.55);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />

        <XAxis
          dataKey="year"
          tick={{ fill: axisColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={{ stroke: gridColor }}
        />

        <YAxis
          tickCount={7}
          tick={{ fill: axisColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={{ stroke: gridColor }}
        />

        {/* ✅ Tooltip מותאם */}
        <Tooltip content={<ChartTooltip />} />

        {/* ✅ Legend צבעים עדינים */}
        <Legend
          wrapperStyle={{
            color: theme.palette.text.primary,
            direction: "rtl",
          }}
        />

        {selectedFields.map((key, idx) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={
              !selectedUser
                ? AdminYearlyFinancialItems.find((f) => f.key === key)?.label
                : UserAdminFinancialItems.find((f) => f.key === key)?.label
            }
            stroke={COLORS[idx % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartGraph;
