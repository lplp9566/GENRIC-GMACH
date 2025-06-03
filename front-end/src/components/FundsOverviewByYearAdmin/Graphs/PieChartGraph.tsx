import React from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import useMediaQuery from '@mui/material/useMediaQuery'

interface PieChartGraphProps {
    pieData: any[]
}

const PieChartGraph: React.FC<PieChartGraphProps> = ({ pieData }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  return (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={isMobile ? 150 : 150}
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
  )
}

export default PieChartGraph