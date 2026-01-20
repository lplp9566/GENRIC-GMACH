import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import { AdminYearlyFinancialItems, UserAdminFinancialItems } from "../items";
import { ChartTooltip } from "./LineChartGraph";

interface AreaChartGraphProps {
  data: any[];
  selectedFields: string[];
  COLORS: string[]; // אפשר להשאיר, אבל עדיף colorByKey (למטה)
}

const AreaChartGraph: React.FC<AreaChartGraphProps> = ({
  data,
  selectedFields,
  COLORS,
}) => {
  const { selectedUser } = useSelector((state: RootState) => state.AdminUsers);
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const isAdmin = Boolean(authUser?.is_admin);


  const items = useMemo(() => {
    return isAdmin && !selectedUser
      ? AdminYearlyFinancialItems
      : UserAdminFinancialItems;
  }, [isAdmin, selectedUser]);

  const labelByKey = useMemo(() => {
    return Object.fromEntries(items.map((i) => [i.key, i.label]));
  }, [items]);

  const colorByKey = useMemo(() => {
    return Object.fromEntries(items.map((i) => [i.key, i.color]));
  }, [items]);

  const getColor = (key: string, idx: number) =>
    colorByKey[key] ?? COLORS[idx % COLORS.length];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <defs>
          {selectedFields.map((key, idx) => {
            const c = getColor(key, idx);
            return (
              <linearGradient
                id={`color${key}`}
                key={key}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={c} stopOpacity={0.8} />
                <stop offset="95%" stopColor={c} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>

        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis tickCount={7} />

        <Tooltip
          content={<ChartTooltip />}
          formatter={(value: any, name: string) => [
            value,
            labelByKey[name] ?? name,
          ]}
          labelFormatter={(label) => `שנה: ${label}`}
        />

        {/* זה מבטיח שהלג׳נד תמיד יוצג בעברית ולא dataKey */}
        <Legend formatter={(value: string) => labelByKey[value] ?? value} />

        {selectedFields.map((key, idx) => {
          const c = getColor(key, idx);
          return (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              name={labelByKey[key] ?? key}
              stroke={c}
              fill={`url(#color${key})`}
              strokeWidth={2}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChartGraph;
