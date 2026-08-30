'use client'

import React from 'react'
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Flame,
  CheckCircle2,
  Loader2,
  RotateCw,
  Lightbulb,
  Zap,
  Target,
  FileCheck2,
} from 'lucide-react'
import { BusinessInsightsData } from '@/lib/ai/types'

interface AIInsightsSectionProps {
  insights: BusinessInsightsData | null
  isLoading: boolean
  onGenerateInsights: () => void
}

export function AIInsightsSection({
  insights,
  isLoading,
  onGenerateInsights,
}: AIInsightsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-gray-900 border border-indigo-500/30 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Gemini Executive Intelligence
            </span>
            <span className="text-xs text-gray-400">• Cross-Platform Intelligence</span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {insights?.headline || 'AI Business Insights & Strategic Action Plan'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
            {insights?.summary ||
              'Transform aggregated customer feedback, recurring operational problems, and sentiment velocity into high-impact business decisions.'}
          </p>
        </div>

        <div className="self-start md:self-auto shrink-0">
          <button
            onClick={onGenerateInsights}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : insights ? (
              <RotateCw className="w-4 h-4" />
            ) : (
              <Zap className="w-4 h-4 text-amber-300" />
            )}
            <span>{isLoading ? 'Synthesizing with Gemini...' : insights ? 'Refresh Insights' : 'Generate AI Insights'}</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 rounded-3xl bg-[#0b0f19] border border-white/5 animate-pulse space-y-3">
              <div className="h-4 w-32 bg-gray-800 rounded"></div>
              <div className="h-6 w-full bg-gray-800/80 rounded"></div>
              <div className="h-12 w-full bg-gray-800/50 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {insights && !isLoading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 3-Column Diagnostic Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Most Important Problem */}
            <div className="p-5 rounded-3xl bg-[#0b0f19] border border-rose-500/20 shadow-lg shadow-rose-950/20 flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    <Flame className="w-4 h-4 text-rose-400" /> Top Priority Problem
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {insights.top_problem.severity || 'Critical'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight">
                  {insights.top_problem.issue}
                </h4>

                <p className="text-xs text-gray-300 leading-relaxed font-normal">
                  {insights.top_problem.reason}
                </p>
              </div>

              <div className="pt-2 border-t border-rose-500/20 flex items-center gap-1.5 text-[11px] text-rose-300/80 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Primary driver of customer churn</span>
              </div>
            </div>

            {/* 2. Emerging Problem */}
            <div className="p-5 rounded-3xl bg-[#0b0f19] border border-amber-500/20 shadow-lg shadow-amber-950/20 flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Emerging Problem
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Rising Pattern
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight">
                  {insights.emerging_problem.issue}
                </h4>

                <p className="text-xs text-gray-300 leading-relaxed font-normal">
                  {insights.emerging_problem.evidence}
                </p>
              </div>

              <div className="pt-2 border-t border-amber-500/20 flex items-center gap-1.5 text-[11px] text-amber-300/80 font-medium">
                <Target className="w-3.5 h-3.5" />
                <span>Requires proactive operational adjustment</span>
              </div>
            </div>

            {/* 3. Positive Trend */}
            <div className="p-5 rounded-3xl bg-[#0b0f19] border border-emerald-500/20 shadow-lg shadow-emerald-950/20 flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Positive Trend & Strength
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Brand Moat
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight">
                  {insights.positive_trend.topic}
                </h4>

                <p className="text-xs text-gray-300 leading-relaxed font-normal">
                  {insights.positive_trend.evidence}
                </p>
              </div>

              <div className="pt-2 border-t border-emerald-500/20 flex items-center gap-1.5 text-[11px] text-emerald-300/80 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Key driver of organic positive sentiment</span>
              </div>
            </div>
          </div>

          {/* Actionable Recommendations Section */}
          <div className="p-6 rounded-3xl bg-[#0b0f19] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Lightbulb className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Prioritized Action Plan</h3>
                  <p className="text-xs text-gray-400">Direct operational countermeasures backed by review data</p>
                </div>
              </div>

              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                <FileCheck2 className="w-4 h-4 text-indigo-400" />
                <span>{insights.recommended_actions.length} Action Items</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {insights.recommended_actions.map((item, idx) => {
                const isCritical = item.priority === 'critical'
                const isHigh = item.priority === 'high'

                const priorityBadge = isCritical ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                    P1 Critical
                  </span>
                ) : isHigh ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    P2 High
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    P3 Medium
                  </span>
                )

                const impactBadge =
                  item.expected_impact === 'high' ? (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      High Impact
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      Medium Impact
                    </span>
                  )

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#06080e] border border-white/5 flex flex-col justify-between space-y-3 hover:border-white/10 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {priorityBadge}
                        {impactBadge}
                      </div>

                      <h5 className="text-xs font-bold text-white leading-snug">
                        {item.action}
                      </h5>

                      <p className="text-[11px] text-gray-400 leading-relaxed font-normal">
                        <strong className="text-gray-300">Rationale:</strong> {item.reason}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500">
                      <span>Target: Operations & Fleet</span>
                      <span className="font-semibold text-indigo-400">Action #{idx + 1}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
