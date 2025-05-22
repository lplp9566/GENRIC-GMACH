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
import { allFields } from "../fields";
interface LineChartGrapeProps {
  data: any[];
  selectedFields: string[];
  COLORS: string[];
}
const LineChartGraph: React.FC<LineChartGrapeProps> = ({
  data,
  selectedFields,
  COLORS,
}) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis tickCount={7} />
        <Tooltip formatter={(value) => `₪${Number(value).toLocaleString()}`} />
        <Legend />
        {selectedFields.map((key, idx) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={allFields.find((f) => f.key === key)?.label}
            stroke={COLORS[idx % COLORS.length]}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartGraph;
