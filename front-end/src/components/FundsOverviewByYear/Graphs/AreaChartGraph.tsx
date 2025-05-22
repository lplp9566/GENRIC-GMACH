import React from 'react'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { allFields } from '../fields'
interface AreaChartGraphProps {
  data: any[];
  selectedFields: string[];
  COLORS: string[];
}
const AreaChartGraph: React.FC<AreaChartGraphProps> = ({data, selectedFields, COLORS}) => {
  return (
 <ResponsiveContainer width="100%" height={350}>
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
  )
}

export default AreaChartGraph