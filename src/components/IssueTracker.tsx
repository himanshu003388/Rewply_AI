'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus, AlertOctagon } from 'lucide-react'
import { Issue } from '@/types/database.types'

interface IssueTrackerProps {
  issues: Issue[]
}

export function IssueTracker({ issues }: IssueTrackerProps) {
  return (
    <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Root-Cause Issue Tracker</h3>
            <p className="text-xs text-gray-400">Automated categorization across customer touchpoints</p>
          </div>
        </div>
        <span className="text-xs text-gray-400 font-medium">
          {issues.length} Identified Clusters
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 uppercase tracking-wider text-[10px]">
              <th className="pb-3 font-semibold">Issue Name</th>
              <th className="pb-3 font-semibold">Category</th>
              <th className="pb-3 font-semibold text-center">Mentions</th>
              <th className="pb-3 font-semibold text-center">Trend</th>
              <th className="pb-3 font-semibold text-right">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 text-gray-300">
            {issues.map((issue) => {
              const trendIcon =
                issue.trend_direction === 'up' ? (
                  <span className="flex items-center justify-center gap-1 text-rose-400 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" /> +18%
                  </span>
                ) : issue.trend_direction === 'down' ? (
                  <span className="flex items-center justify-center gap-1 text-emerald-400 font-medium">
                    <TrendingDown className="w-3.5 h-3.5" /> -12%
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1 text-gray-400">
                    <Minus className="w-3.5 h-3.5" /> Stable
                  </span>
                )

              const severityColor =
                issue.severity_score >= 8
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : issue.severity_score >= 6
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'

              return (
                <tr key={issue.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 font-medium text-white">{issue.issue_type}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md bg-gray-950 border border-gray-800 text-gray-400">
                      {issue.category}
                    </span>
                  </td>
                  <td className="py-3 text-center font-semibold text-white">{issue.mention_count}</td>
                  <td className="py-3 text-center">{trendIcon}</td>
                  <td className="py-3 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-md border font-semibold ${severityColor}`}>
                      {issue.severity_score} / 10
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
