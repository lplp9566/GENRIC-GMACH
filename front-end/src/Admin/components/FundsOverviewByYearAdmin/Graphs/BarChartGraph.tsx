import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
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

interface BarChartGraphProps {
  data: any[];
  selectedFields: string[];
  COLORS: string[]; // אפשר להשאיר, אבל עדיף colorByKey (ראה למטה)
}

const BarChartGraph: React.FC<BarChartGraphProps> = ({
  data,
  selectedFields,
  COLORS,
}) => {
  const { selectedUser } = useSelector((state: RootState) => state.AdminUsers);
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const isAdmin = Boolean(authUser?.is_admin);

  // אותו כלל כמו בכל הפרויקט:
  // AdminYearlyFinancialItems רק לאדמין בלי משתמש נבחר
  const items = useMemo(() => {
    return isAdmin && !selectedUser
      ? AdminYearlyFinancialItems
      : UserAdminFinancialItems;
  }, [isAdmin, selectedUser]);

  const labelByKey = useMemo(() => {
    return Object.fromEntries(items.map((i) => [i.key, i.label]));
  }, [items]);

  // (רשות) צבע יציב לפי key – הרבה יותר נכון מצבע לפי idx
  const colorByKey = useMemo(() => {
    return Object.fromEntries(items.map((i) => [i.key, i.color]));
  }, [items]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis tickCount={7} />

        {/* אם ChartTooltip שלך מציג name, כדאי שגם הוא יראה label
            אם לא בא לך לשנות אותו עכשיו – זה עדיין בסדר */}
        <Tooltip
          content={<ChartTooltip />}
          formatter={(value: any, name: string) => [
            value,
            labelByKey[name] ?? name,
          ]}
          labelFormatter={(label) => `שנה: ${label}`}
        />

        {/* זה מה שיבטיח שהלג׳נד יציג עברית תמיד */}
        <Legend formatter={(value: string) => labelByKey[value] ?? value} />

        {selectedFields.map((key, idx) => (
          <Bar
            key={key}
            dataKey={key}
            name={labelByKey[key] ?? key} // טוב להשאיר גם את זה
            // עדיף צבע לפי key (יציב)
            fill={colorByKey[key] ?? COLORS[idx % COLORS.length]}
            barSize={35}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartGraph;
