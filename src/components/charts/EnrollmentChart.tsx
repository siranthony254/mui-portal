'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface EnrollmentChartProps {
  data: Array<{ month: string; students: number }>
  className?: string
}

export function EnrollmentChart({ data, className = '' }: EnrollmentChartProps) {
  return (
    <div className={className}>
      <h3 className="text-sm font-bold text-gray-900 mb-4">Student Enrollment Trends</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6B7280' }}
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
          <Line 
            type="monotone" 
            dataKey="students" 
            stroke="#0F6E56" 
            strokeWidth={2}
            dot={{ fill: '#0F6E56', r: 4 }}
            activeDot={{ r: 6, stroke: '#0F6E56', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
