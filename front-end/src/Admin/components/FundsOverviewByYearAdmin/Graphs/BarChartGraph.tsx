import React from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AdminYearlyFinancialItems, UserAdminFinancialItems } from '../items';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
interface BarChartGraphProps {
  data: any[];
  selectedFields: string[];
  COLORS: string[];
}
const BarChartGraph : React.FC<BarChartGraphProps> = ({data, selectedFields, COLORS}) => {
const {selectedUser} = useSelector((state: RootState) => state.AdminUsers);
  return (
    <ResponsiveContainer width="100%" height={350}>
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
                    name={ !selectedUser ? AdminYearlyFinancialItems.find(f => f.key === key)?.label : UserAdminFinancialItems.find(f => f.key === key)?.label}
                    fill={COLORS[idx % COLORS.length]}
                    barSize={35}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
            
  )
}

export default BarChartGraph