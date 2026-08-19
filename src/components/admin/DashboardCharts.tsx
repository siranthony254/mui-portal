'use client'

import dynamic from 'next/dynamic'

// These are the actual heavy chart components
const EnrollmentTrendsChart = dynamic(() => import('./AnalyticsCharts').then(mod => mod.EnrollmentTrends), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-50 animate-pulse rounded-2xl" />
})

const TaskDistributionChart = dynamic(() => import('./AnalyticsCharts').then(mod => mod.TaskDistribution), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-50 animate-pulse rounded-2xl" />
})

export function EnrollmentTrends({ data }: { data: any[] }) {
  return <EnrollmentTrendsChart data={data} />
}

export function TaskDistribution({ data }: { data: any[] }) {
  return <TaskDistributionChart data={data} />
}
