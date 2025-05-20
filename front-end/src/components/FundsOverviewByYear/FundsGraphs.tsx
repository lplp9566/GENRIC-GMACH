import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  } from "recharts";
import { allFields } from "./fields";
import { useMediaQuery } from "@mui/material";

  const COLORS = allFields.map(f => f.color);
  
  interface Props {
    type: number;
    data: any[];
    selectedFields: string[];
    pieData: any[];
  }
  const FundsGraphs =({ type, data, selectedFields, pieData }: Props)=> {
    const isMobile = useMediaQuery("(max-width:600px)");
    if (type === 0)
      return (
        <ResponsiveContainer width="100%" height={490}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickCount={7}/>
            <Tooltip formatter={(value) => `₪${Number(value).toLocaleString()}`} />
            <Legend />
            {selectedFields.map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={allFields.find(f => f.key === key)?.label}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    if (type === 1)
      return (
        <ResponsiveContainer width="100%" height="70%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickCount={7} />
            <Tooltip formatter={(value) => `₪${Number(value).toLocaleString()}`} />
            <Legend />
            {selectedFields.map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                name={allFields.find(f => f.key === key)?.label}
                fill={COLORS[idx % COLORS.length]}
                barSize={35}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    if (type === 2)
      return (
        <ResponsiveContainer width="100%" height={490}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={isMobile ? 150 : 220}
              fill="#8884d8"
              dataKey="value"
              label
              nameKey="name"
            >
              {pieData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₪${Number(value).toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    if (type === 3)
      return (
        <ResponsiveContainer width="100%" height={490}>
          <AreaChart data={data}>
            <defs>
              {selectedFields.map((key, idx) => (
                <linearGradient id={`color${key}`} key={key} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickCount={7} />
            <Tooltip formatter={(value) => `₪${Number(value).toLocaleString()}`} />
            <Legend />
            {selectedFields.map((key, idx) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={allFields.find(f => f.key === key)?.label}
                stroke={COLORS[idx % COLORS.length]}
                fill={`url(#color${key})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
    if (type === 4)
        console.log('pieData:', pieData);
      return (
        
        <ResponsiveContainer width="100%" height={490}>
          <RadarChart data={pieData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 13 }} />
            <PolarRadiusAxis />
            <Radar
              name="ערך"
              dataKey="value"
              stroke="#b17be4"
              fill="#b17be4"
              fillOpacity={0.6}
            />
            <Legend />
            <Tooltip formatter={(value) => `₪${Number(value).toLocaleString()}`} />
          </RadarChart>
        </ResponsiveContainer>

      
      );
    return null;
  }
  export default FundsGraphs
  