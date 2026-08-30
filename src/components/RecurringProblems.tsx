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
  Star,
} from 'lucide-react'
import { RecurringIssueDetail } from '@/lib/api/recurring-issues'

interface RecurringProblemsProps {
  issues: RecurringIssueDetail[]
  onSelectReview?: (reviewId: string) => void
  isLoading?: boolean
}

export function RecurringProblems({ issues, onSelectReview, isLoading }: RecurringProblemsProps) {
  const [selectedIssue, setSelectedIssue] = useState<RecurringIssueDetail | null>(null)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 animate-pulse space-y-3 shadow-sm">
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-gray-800 rounded"></div>
            <div className="h-3 w-1/2 bg-slate-200 dark:bg-gray-800/80 rounded"></div>
            <div className="h-6 w-full bg-slate-100 dark:bg-gray-800/50 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Recurring Problems Intelligence Engine</h3>
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

      {/* Grid of Recurring Problem Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          // Trend calculation visualization
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
            ) : issue.trend_direction === 'stable' ? (
              <span className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-gray-950 px-2 py-0.5 rounded-md border border-slate-200 dark:border-gray-800">
                <Minus className="w-3.5 h-3.5" /> Stable
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 dark:text-gray-500 italic bg-slate-100 dark:bg-gray-950 px-2 py-0.5 rounded border border-slate-200 dark:border-gray-800">
                Insufficient period data
              </span>
            )

          return (
            <div
              key={issue.id}
              onClick={() => setSelectedIssue(issue)}
              className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group shadow-sm ${severityCardStyle}`}
            >
              {isCritical && <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>}
              {/* Card Header */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-400">
                    {issue.category}
                  </span>
                  {severityBadge}
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                  {issue.issue_type}
                </h4>
              </div>

              {/* Mentions & Trend Row */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-white/5 flex items-center justify-between z-10">
                <div>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white block leading-none">
                    {issue.mention_count}{' '}
                    <span className="text-xs font-normal text-slate-500 dark:text-gray-400">mentions</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-gray-500 block mt-0.5">
                    {issue.percentage_of_negative_reviews}% of negative reviews
                  </span>
                </div>

                <div className="text-right">{trendBadge}</div>
              </div>

              {/* Stats Bar: Rating & Urgency */}
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200 dark:border-white/5 pt-2.5 z-10">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Avg: <strong className="text-slate-900 dark:text-white">{issue.average_rating}★</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 justify-end">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                  <span>
                    Urgency: <strong className="text-amber-600 dark:text-amber-300">{issue.average_urgency}/10</strong>
                  </span>
                </div>
              </div>

              {/* Top Sub-issues Preview */}
              {issue.sub_issues_breakdown.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-gray-500 block">Top Patterns</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {issue.sub_issues_breakdown.slice(0, 2).map((sub, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-900/50 border border-slate-200 dark:border-white/5 text-[10px] text-slate-700 dark:text-gray-300 truncate max-w-[200px]"
                      >
                        {sub.name} ({sub.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Click to inspect examples */}
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 pt-1">
                <span>View {issue.example_reviews.length} Example Reviews</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Example Reviews Modal / Drawer */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#06080e] border border-slate-200 dark:border-white/5 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0b0f19]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedIssue.issue_type}</h3>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-gray-950 border border-slate-300 dark:border-gray-800 text-slate-700 dark:text-gray-400">
                      {selectedIssue.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    {selectedIssue.mention_count} Total Mentions • {selectedIssue.percentage_of_negative_reviews}% of Complaints • Severity {selectedIssue.severity_score}/10
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedIssue(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Example Reviews */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
                <span className="font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                  Representative Customer Reviews
                </span>
                <span>Sorted by Urgency & Severity</span>
              </div>

              <div className="space-y-3">
                {selectedIssue.example_reviews.map((rev) => {
                  const platformColor =
                    rev.platform === 'google'
                      ? 'text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-300 dark:border-blue-500/20'
                      : rev.platform === 'yelp'
                      ? 'text-red-700 dark:text-red-400 bg-red-500/10 border-red-300 dark:border-red-500/20'
                      : 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20'

                  return (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 space-y-2.5 hover:border-slate-300 dark:hover:border-white/10 transition-colors shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{rev.customer_name}</span>
                          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${platformColor}`}>
                            {rev.platform}
                          </span>
                          <div className="flex items-center text-amber-400 text-xs">
                            {'★'.repeat(rev.rating)}
                            <span className="text-slate-300 dark:text-gray-600">{'★'.repeat(5 - rev.rating)}</span>
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400 dark:text-gray-500">
                          {new Date(rev.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-gray-200 leading-relaxed italic font-normal">
                        &ldquo;{rev.review_text}&rdquo;
                      </p>

                      {rev.ai_response && (
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/10 text-[11px] text-indigo-950 dark:text-indigo-200/90 flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                          <p className="line-clamp-2 italic font-normal">
                            &ldquo;{rev.ai_response}&rdquo;
                          </p>
                        </div>
                      )}

                      {onSelectReview && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              setSelectedIssue(null)
                              onSelectReview(rev.id)
                            }}
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                          >
                            <span>Open Details & Studio</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0b0f19]">
              <span className="text-xs text-slate-500 dark:text-gray-400">
                Clicking an individual review lets you modify and approve the AI reply.
              </span>
              <button
                onClick={() => setSelectedIssue(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-semibold text-slate-800 dark:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
