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
import { AdminYearlyFinancialItems, UserAdminFinancialItems } from "../items";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
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
  const { selectedUser } = useSelector((state: RootState) => state.AdminUsers);
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
            name={
              !selectedUser
                ? AdminYearlyFinancialItems.find((f) => f.key === key)?.label
                : UserAdminFinancialItems.find((f) => f.key === key)?.label
            }
            stroke={COLORS[idx % COLORS.length]}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartGraph;
