import { AdminYearlyFinancialItems, UserAdminFinancialItems } from "./items";
import LineChartGraph from "./Graphs/LineChartGraph";
import BarChartGraph from "./Graphs/BarChartGraph";
import PieChartGraph from "./Graphs/PieChartGraph";
import RadarChartGraph from "./Graphs/RadarChartGraph";
import AreaChartGraph from "./Graphs/AreaChartGraph";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";


  
  interface Props {
    type: number;
    data: any[];
    selectedFields: string[];
    pieData: any[];
  }
  const FundsGraphs =({ type, data, selectedFields, pieData }: Props)=> {
    const {selectedUser} = useSelector((state: RootState) => state.adminUsers);
      const COLORS = !selectedUser ? AdminYearlyFinancialItems.map(f => f.color) : UserAdminFinancialItems.map(f => f.color);
    if (type === 0)
      return (
        <LineChartGraph data={data} selectedFields={selectedFields} COLORS={COLORS} />
      );

    if (type === 1)
      return (
    <BarChartGraph COLORS={COLORS} data={data} selectedFields={selectedFields}/>
      );
    if (type === 2)
      return (
        <PieChartGraph  pieData={pieData}/>
      );
    if (type === 3)
      return (
    <AreaChartGraph COLORS={COLORS} data={data} selectedFields={selectedFields}/>
      );
    if (type === 4)
      return (
        <RadarChartGraph RadarData={pieData}/>
      );
    return null;
  }
  export default FundsGraphs
  