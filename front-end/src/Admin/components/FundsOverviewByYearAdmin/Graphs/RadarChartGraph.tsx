import React from 'react'
import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartTooltip } from './LineChartGraph';

interface RadarChartGraphProps {
    RadarData: any[]
}

const RadarChartGraph: React.FC<RadarChartGraphProps> = ({RadarData}) => {
  return (
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={RadarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 13 }} />
            <PolarRadiusAxis />
            <Radar
              dataKey="value"
              stroke="#b17be4"
              fill="#b17be4"
              fillOpacity={0.6}
            />
            <Legend />
        <Tooltip content={<ChartTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
  )
}

export default RadarChartGraph