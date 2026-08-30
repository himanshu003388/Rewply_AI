'use client'

import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Review, Issue } from '@/types/database.types'
import { TrendingUp, BarChart2, PieChart as PieIcon, Activity, CheckCircle2, Clock } from 'lucide-react'

interface AnalyticsChartsProps {
  reviews: Review[]
  issues?: Issue[]
}

const SENTIMENT_COLORS = {
  positive: '#10b981', // emerald-500
  neutral: '#6b7280',  // gray-500
  negative: '#f43f5e', // rose-500
}

const RATING_COLORS = ['#f43f5e', '#fb923c', '#facc15', '#a3e635', '#22c55e']

const ISSUE_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#06b6d4', '#10b981', '#8b5cf6', '#64748b']

export function AnalyticsCharts({ reviews }: AnalyticsChartsProps) {
  // 1. Sentiment Over Time (Grouped by Date)
  const dateGroups: Record<
    string,
    { date: string; positive: number; neutral: number; negative: number; total: number }
  > = {}

  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  for (const r of sortedReviews) {
    const d = new Date(r.created_at)
    const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

    if (!dateGroups[key]) {
      dateGroups[key] = { date: key, positive: 0, neutral: 0, negative: 0, total: 0 }
    }

    dateGroups[key].total += 1
    const sentiment = r.analysis?.sentiment || (r.rating >= 4 ? 'positive' : r.rating <= 2 ? 'negative' : 'neutral')
    if (sentiment === 'positive') dateGroups[key].positive += 1
    else if (sentiment === 'negative') dateGroups[key].negative += 1
    else dateGroups[key].neutral += 1
  }

  const timeSeriesData = Object.values(dateGroups)

  // 2. Rating Distribution (1★ to 5★)
  const ratingDistribution = [1, 2, 3, 4, 5].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length
    return {
      name: `${star}★`,
      star,
      count,
      percentage: reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0,
      fill: RATING_COLORS[star - 1],
    }
  })

  // 3. Issue Distribution by Primary Category
  const issueCounts: Record<string, number> = {}
  for (const r of reviews) {
    const issue = r.analysis?.primary_issue || r.analysis?.issue || 'General'
    const formatted = issue.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    issueCounts[formatted] = (issueCounts[formatted] || 0) + 1
  }

  const issueDistribution = Object.entries(issueCounts)
    .map(([name, count], index) => ({
      name,
      count,
      percentage: reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0,
      fill: ISSUE_COLORS[index % ISSUE_COLORS.length],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  // 4. Response Performance Metrics
  const totalReviews = reviews.length
  const pendingCount = reviews.filter((r) => r.response_status === 'pending').length
  const approvedCount = reviews.filter((r) => r.response_status === 'approved').length
  const sentCount = reviews.filter((r) => r.response_status === 'sent').length
  const resolvedCount = approvedCount + sentCount
  const responseRate = totalReviews > 0 ? Math.round((resolvedCount / totalReviews) * 100) : 0

  return (
    <div className="space-y-6">
      {/* 4-Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CHART 1: Sentiment Over Time */}
        <div className="p-5 rounded-3xl bg-[#0b0f19] border border-white/5 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Sentiment Over Time
              </span>
              <span className="text-[10px] text-gray-500 font-semibold uppercase">Daily Timeline</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">Positive vs Negative Review Dynamics</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SENTIMENT_COLORS.positive} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={SENTIMENT_COLORS.positive} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SENTIMENT_COLORS.negative} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={SENTIMENT_COLORS.negative} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="positive"
                  stroke={SENTIMENT_COLORS.positive}
                  fillOpacity={1}
                  fill="url(#colorPositive)"
                  name="Positive"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="negative"
                  stroke={SENTIMENT_COLORS.negative}
                  fillOpacity={1}
                  fill="url(#colorNegative)"
                  name="Negative"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-800/80 pt-2">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Positive Trend
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Negative Friction
            </span>
          </div>
        </div>

        {/* CHART 2: Rating Distribution */}
        <div className="p-5 rounded-3xl bg-[#0b0f19] border border-white/5 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-amber-400" /> Rating Distribution
              </span>
              <span className="text-[10px] text-gray-500 font-semibold uppercase">1★ - 5★ Stars</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">Volume Breakdown by Star Tier</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Reviews">
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-800/80 pt-2">
            <span>High Concentration: 1★-2★</span>
            <span className="text-indigo-400 font-semibold">{totalReviews} Reviews</span>
          </div>
        </div>

        {/* CHART 3: Issue Distribution */}
        <div className="p-5 rounded-3xl bg-[#0b0f19] border border-white/5 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <PieIcon className="w-3.5 h-3.5 text-indigo-400" /> Issue Distribution
              </span>
              <span className="text-[10px] text-gray-500 font-semibold uppercase">Category Share</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">Top Operational Complaint Categories</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issueDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={62}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {issueDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="#111827" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-800/80 pt-2 truncate">
            <span className="text-indigo-400 font-medium truncate">
              Top: {issueDistribution[0]?.name || 'Delivery'} ({issueDistribution[0]?.count || 0})
            </span>
            <span className="text-gray-500">{issueDistribution.length} Categories</span>
          </div>
        </div>

        {/* CHART 4: Review Volume & Response Performance */}
        <div className="p-5 rounded-3xl bg-[#0b0f19] border border-white/5 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-400" /> Response Performance
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {responseRate}% Rate
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">Triage, Approval & Resolution Speed</p>
          </div>

          {/* Performance Meter */}
          <div className="space-y-2.5 py-1">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Sent
                </span>
                <span className="font-bold text-white">
                  {resolvedCount} <span className="text-gray-500 font-normal">({responseRate}%)</span>
                </span>
              </div>
              <div className="h-2 w-full bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${responseRate}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <Clock className="w-3.5 h-3.5" /> Pending Approval
                </span>
                <span className="font-bold text-white">
                  {pendingCount}{' '}
                  <span className="text-gray-500 font-normal">
                    ({totalReviews > 0 ? Math.round((pendingCount / totalReviews) * 100) : 0}%)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalReviews > 0 ? Math.round((pendingCount / totalReviews) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-800/80 pt-2">
            <span>{approvedCount} Drafts Approved</span>
            <span className="text-emerald-400 font-semibold">{sentCount} Published</span>
          </div>
        </div>
      </div>
    </div>
  )
}
