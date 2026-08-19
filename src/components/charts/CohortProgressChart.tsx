'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface CohortProgressChartProps {
  data: Array<{ cohort: string; progress: number }>
  className?: string
}

export function CohortProgressChart({ data, className = '' }: CohortProgressChartProps) {
  return (
    <div className={className}>
      <h3 className="text-sm font-bold text-gray-900 mb-4">Cohort Progress</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            type="number"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            type="category"
            dataKey="cohort"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            width={80}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
          <Bar dataKey="progress" fill="#0F6E56" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
