'use client'

import React from 'react'
import {
  Sparkles,
  TrendingUp,
  Flame,
  CheckCircle2,
  Loader2,
  RotateCw,
  Lightbulb,
  Zap,
  FileCheck2,
  AlertOctagon,
} from 'lucide-react'
import { BusinessInsightsData } from '@/lib/ai/types'

interface AIInsightsSectionProps {
  insights: BusinessInsightsData | null
  isLoading: boolean
  onGenerateInsights: () => void
  compact?: boolean
}

export function AIInsightsSection({
  insights,
  isLoading,
  onGenerateInsights,
  compact = false,
}: AIInsightsSectionProps) {
  // COMPACT MODE: Designed to auto-fit fluidly inside the 3-column Overview Grid
  if (compact) {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 animate-pulse space-y-3 shadow-sm"
            >
              <div className="h-4 w-32 bg-slate-200 dark:bg-gray-800 rounded"></div>
              <div className="h-6 w-full bg-slate-200 dark:bg-gray-800/80 rounded"></div>
              <div className="h-10 w-full bg-slate-100 dark:bg-gray-800/50 rounded"></div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Compact Summary & Refresh Header */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-indigo-950/40 dark:to-gray-900 border border-indigo-200/80 dark:border-indigo-500/20 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
              <Sparkles className="w-3 h-3" /> Gemini 2.5
            </span>
            <button
              onClick={onGenerateInsights}
              disabled={isLoading}
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
            >
              <RotateCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>
          <p className="text-xs text-slate-700 dark:text-gray-300 font-medium leading-relaxed">
            {insights?.summary ||
              'Aggregated feedback synthesized with AI to identify root causes and immediate operational priorities.'}
          </p>
        </div>

        {insights && (
          <>
            {/* Top Priority Problem Card */}
            {insights.top_problem && (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0b0f19] border border-rose-200 dark:border-rose-500/20 shadow-sm space-y-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" /> Top Issue
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40">
                    {insights.top_problem.severity || 'Critical'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {insights.top_problem.issue}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed">
                  {insights.top_problem.reason}
                </p>
              </div>
            )}

            {/* Strategic Recommended Actions Card */}
            {insights.recommended_actions && insights.recommended_actions.length > 0 && (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 shadow-sm space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Action Roadmap
                </span>
                <div className="space-y-2">
                  {insights.recommended_actions.slice(0, 3).map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#06080e] border border-slate-200/80 dark:border-white/5 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-gray-200 capitalize">
                          {rec.priority || 'P1'} Priority
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 capitalize">
                          {rec.expected_impact} Impact
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                        {rec.action}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400 leading-relaxed">
                        {rec.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emerging Problem & Positive Trend Chips */}
            <div className="grid grid-cols-1 gap-2">
              {insights.emerging_problem && (
                <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-[#0b0f19] border border-amber-200 dark:border-amber-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" /> Emerging Pattern
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {insights.emerging_problem.issue}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-gray-400">
                    {insights.emerging_problem.evidence}
                  </p>
                </div>
              )}

              {insights.positive_trend && (
                <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-[#0b0f19] border border-emerald-200 dark:border-emerald-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Positive Driver
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {insights.positive_trend.topic}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-gray-400">
                    {insights.positive_trend.evidence}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  // FULL-PAGE MODE: Rich 3-column executive diagnostic dashboard
  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-slate-100 dark:from-indigo-950/60 dark:via-purple-950/40 dark:to-gray-900 border border-indigo-200 dark:border-indigo-500/30 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Gemini Executive Intelligence
            </span>
            <span className="text-xs text-slate-500 dark:text-gray-400">• Cross-Platform Synthesis</span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {insights?.headline || 'AI Business Insights & Strategic Action Plan'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed font-normal">
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
            <div key={i} className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 animate-pulse space-y-3 shadow-sm">
              <div className="h-4 w-32 bg-slate-200 dark:bg-gray-800 rounded"></div>
              <div className="h-6 w-full bg-slate-200 dark:bg-gray-800/80 rounded"></div>
              <div className="h-12 w-full bg-slate-100 dark:bg-gray-800/50 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {insights && !isLoading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Diagnostic 3-Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Top Problem */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0b0f19] border border-rose-200 dark:border-rose-500/20 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    <Flame className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-pulse" /> Top Priority Problem
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40">
                    {insights.top_problem.severity || 'Critical'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  {insights.top_problem.issue}
                </h4>

                <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed font-normal">
                  {insights.top_problem.reason}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 dark:text-gray-400">Severity Status:</span>
                <span className="font-bold text-rose-700 dark:text-rose-400 capitalize">
                  {insights.top_problem.severity || 'High Risk'}
                </span>
              </div>
            </div>

            {/* 2. Emerging Problem */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0b0f19] border border-amber-200 dark:border-amber-500/20 shadow-sm flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    <AlertOctagon className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Emerging Trend
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                    Rising
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  {insights.emerging_problem.issue}
                </h4>

                <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed font-normal">
                  {insights.emerging_problem.evidence}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-white/5 text-[11px] text-slate-500 dark:text-gray-400">
                Pattern: <strong className="text-slate-800 dark:text-gray-200">Requires Monitoring</strong>
              </div>
            </div>

            {/* 3. Positive Momentum Driver */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0b0f19] border border-emerald-200 dark:border-emerald-500/20 shadow-sm flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Positive Momentum
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    Strengths
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  {insights.positive_trend.topic}
                </h4>

                <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed font-normal">
                  {insights.positive_trend.evidence}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-white/5 text-[11px] text-slate-500 dark:text-gray-400">
                Core Driver: <strong className="text-emerald-700 dark:text-emerald-400">Customer Delight</strong>
              </div>
            </div>
          </div>

          {/* Operational Action Roadmap */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Prioritized Operational Roadmap
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  Direct action items generated by Gemini to resolve recurring complaints
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.recommended_actions?.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06080e] border border-slate-200 dark:border-white/5 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                        {rec.priority || 'P1'}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-gray-500 capitalize">
                        Impact: {rec.expected_impact || 'High'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {rec.action}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed font-normal">
                      {rec.reason}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Impact Tier: {rec.expected_impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
