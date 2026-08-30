'use client'

import React, { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertOctagon,
  Flame,
  AlertCircle,
  Layers,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react'
import { RecurringIssueDetail } from '@/lib/api/recurring-issues'

interface RecurringProblemsProps {
  issues: RecurringIssueDetail[]
  onSelectReview?: (reviewId: string) => void
  isLoading?: boolean
  columns?: 1 | 2 | 3 | 'auto'
  compact?: boolean
}

export function RecurringProblems({
  issues,
  onSelectReview,
  isLoading,
  columns = 'auto',
  compact = false,
}: RecurringProblemsProps) {
  const [selectedIssue, setSelectedIssue] = useState<RecurringIssueDetail | null>(null)

  const gridClass =
    columns === 1
      ? 'grid grid-cols-1 gap-4'
      : columns === 2
      ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
      : columns === 3
      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
      : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'

  if (isLoading) {
    return (
      <div className={gridClass}>
        {[...Array(columns === 1 ? 3 : 6)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 animate-pulse space-y-3 shadow-sm"
          >
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-gray-800 rounded"></div>
            <div className="h-3 w-1/2 bg-slate-200 dark:bg-gray-800/80 rounded"></div>
            <div className="h-6 w-full bg-slate-100 dark:bg-gray-800/50 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Info (Only in non-compact full view) */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Recurring Problems Intelligence Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Categorized via structured review analysis comparing current 7 days vs previous period
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 self-start sm:self-auto">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 font-semibold text-slate-800 dark:text-white">
              {issues.length} Problem Clusters
            </span>
          </div>
        </div>
      )}

      {/* Grid of Recurring Problem Cards */}
      <div className={gridClass}>
        {issues.map((issue) => {
          const isCritical = issue.severity_level === 'Critical'
          const isHigh = issue.severity_level === 'High'

          const severityCardStyle = isCritical
            ? 'border-rose-200 dark:border-rose-500/30 bg-rose-50/40 dark:bg-[#0b0f19] relative overflow-hidden'
            : isHigh
            ? 'border-amber-200 dark:border-amber-500/20 bg-amber-50/30 dark:bg-[#0b0f19] hover:border-amber-300 dark:hover:border-amber-500/40'
            : 'border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0f19] hover:border-slate-300 dark:hover:border-white/10'

          const severityBadge =
            issue.severity_level === 'Critical' ? (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40">
                <Flame className="w-3 h-3 text-rose-600 dark:text-rose-400 animate-pulse" /> Critical ({issue.severity_score}/10)
              </span>
            ) : issue.severity_level === 'High' ? (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" /> High ({issue.severity_score}/10)
              </span>
            ) : issue.severity_level === 'Medium' ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-500/20">
                Medium ({issue.severity_score}/10)
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/20">
                Low ({issue.severity_score}/10)
              </span>
            )

          const trendBadge =
            issue.trend_direction === 'increasing' ? (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-300 dark:border-rose-500/20">
                <TrendingUp className="w-3.5 h-3.5" />
                {issue.trend_change_percentage !== null ? `+${issue.trend_change_percentage}%` : 'Rising'}
              </span>
            ) : issue.trend_direction === 'decreasing' ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-500/20">
                <TrendingDown className="w-3.5 h-3.5" />
                {issue.trend_change_percentage !== null ? `${issue.trend_change_percentage}%` : 'Falling'}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-gray-700">
                <Minus className="w-3 h-3" />
                Stable
              </span>
            )

          return (
            <div
              key={issue.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${severityCardStyle}`}
            >
              {/* Header: Title & Badges */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                      {issue.category}
                    </span>
                    {severityBadge}
                  </div>
                  {trendBadge}
                </div>

                {/* Metrics Row */}
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <strong>{issue.mention_count}</strong> reviews
                  </span>
                  <span>•</span>
                  <span>
                    Avg rating: <strong>{issue.average_rating}★</strong>
                  </span>
                </div>
              </div>

              {/* Sub-issues breakdown */}
              {issue.sub_issues_breakdown && issue.sub_issues_breakdown.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500" /> Common Breakdown
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {issue.sub_issues_breakdown.slice(0, 3).map((sub, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300"
                      >
                        {sub.name} ({sub.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Review */}
              {issue.example_reviews && issue.example_reviews.length > 0 && (
                <p className="text-xs text-slate-600 dark:text-gray-400 italic line-clamp-2">
                  &ldquo;{issue.example_reviews[0].review_text}&rdquo;
                </p>
              )}

              {/* Action Recommendation & Drawer Trigger */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-slate-500 dark:text-gray-400">
                  {issue.example_reviews?.length || 0} customer cases
                </span>
                <button
                  onClick={() => setSelectedIssue(issue)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0"
                >
                  <span>Investigate</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Investigation Details Modal / Side Drawer */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/10 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Issue Deep Dive
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedIssue.category}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Severity & Impact Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06080e] border border-slate-200 dark:border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> Operational Metrics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-gray-400 block">Total Mentions:</span>
                    <strong className="text-slate-900 dark:text-white">{selectedIssue.mention_count}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-gray-400 block">Avg Severity:</span>
                    <strong className="text-slate-900 dark:text-white">{selectedIssue.severity_score}/10</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-gray-400 block">Avg Urgency:</span>
                    <strong className="text-slate-900 dark:text-white">{selectedIssue.average_urgency}/10</strong>
                  </div>
                </div>
              </div>

              {/* Sample Customer Reviews */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider">
                  Associated Reviews ({selectedIssue.example_reviews.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedIssue.example_reviews.map((rev) => (
                    <div
                      key={rev.id}
                      onClick={() => {
                        if (onSelectReview) {
                          setSelectedIssue(null)
                          onSelectReview(rev.id)
                        }
                      }}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#06080e] border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-gray-300 hover:border-indigo-400 cursor-pointer transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {rev.customer_name} ({rev.rating}★)
                        </span>
                        <span className="text-[10px] text-slate-400">{rev.platform}</span>
                      </div>
                      <p className="italic">&ldquo;{rev.review_text}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedIssue(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-bold text-slate-800 dark:text-white transition-colors"
              >
                Close Investigation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
