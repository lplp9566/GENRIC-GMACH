import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

import { AdminYearlyFinancialItems, UserAdminFinancialItems } from "./items";
import LineChartGraph from "./Graphs/LineChartGraph";
import BarChartGraph from "./Graphs/BarChartGraph";
import PieChartGraph from "./Graphs/PieChartGraph";
import RadarChartGraph from "./Graphs/RadarChartGraph";
import AreaChartGraph from "./Graphs/AreaChartGraph";

interface Props {
  type: number;
  data: any[];
  selectedFields: string[];
  pieData: any[];
}

const FundsGraphs = ({ type, data, selectedFields, pieData }: Props) => {
  const { selectedUser } = useSelector((state: RootState) => state.AdminUsers);
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const isAdmin = Boolean(authUser?.is_admin);

  // AdminYearlyFinancialItems רק לאדמין בלי משתמש נבחר
  const items = useMemo(() => {
    return isAdmin && !selectedUser
      ? AdminYearlyFinancialItems
      : UserAdminFinancialItems;
  }, [isAdmin, selectedUser]);

  const COLORS = useMemo(() => items.map((f) => f.color), [items]);

  // דיבאג (אופציונלי)
  // console.log("FundsGraphs mode:", {
  //   isAdmin,
  //   selectedUser: Boolean(selectedUser),
  //   items: items.map((i) => i.key),
  // });

  if (type === 0)
    return (
      <LineChartGraph
        data={data}
        selectedFields={selectedFields}
        COLORS={COLORS}
      />
    );

  if (type === 1)
    return (
      <BarChartGraph
        COLORS={COLORS}
        data={data}
        selectedFields={selectedFields}
      />
    );

  if (type === 2) return <PieChartGraph pieData={pieData} />;

  if (type === 3)
    return (
      <AreaChartGraph
        COLORS={COLORS}
        data={data}
        selectedFields={selectedFields}
      />
    );

  if (type === 4) return <RadarChartGraph RadarData={pieData} />;

  return null;
};

export default FundsGraphs;
