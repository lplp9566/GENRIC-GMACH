import { allFields } from "./fields";
import LineChartGraph from "./Graphs/LineChartGraph";
import BarChartGraph from "./Graphs/BarChartGraph";
import PieChartGraph from "./Graphs/PieChartGraph";
import RadarChartGraph from "./Graphs/RadarChartGraph";

  const COLORS = allFields.map(f => f.color);
  
  interface Props {
    type: number;
    data: any[];
    selectedFields: string[];
    pieData: any[];
  }
  const FundsGraphs =({ type, data, selectedFields, pieData }: Props)=> {
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
       <BarChartGraph COLORS={COLORS} data={data} selectedFields={selectedFields}/>
      );
    if (type === 4)
        console.log('pieData:', pieData);
      return (
        <RadarChartGraph RadarData={pieData}/>
      );
    return null;
  }
  export default FundsGraphs
  