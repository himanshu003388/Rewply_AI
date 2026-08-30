'use client'

import React, { useState } from 'react'
import {
  HeartHandshake,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ShieldCheck,
  Star,
  MessageSquareCheck,
  AlertOctagon,
  Info,
} from 'lucide-react'
import { ReputationHealthScoreResult } from '@/lib/metrics/health-score'

interface ReputationHealthScoreProps {
  scoreData?: ReputationHealthScoreResult | null
  isLoading?: boolean
}

export function ReputationHealthScore({
  scoreData,
  isLoading = false,
}: ReputationHealthScoreProps) {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false)

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl bg-gray-900/70 border border-gray-800 animate-pulse space-y-4">
        <div className="h-5 w-40 bg-gray-800 rounded"></div>
        <div className="h-12 w-28 bg-gray-800 rounded"></div>
        <div className="h-3 w-full bg-gray-800/60 rounded"></div>
      </div>
    )
  }

  // 1. Insufficient Data State
  if (!scoreData || !scoreData.is_sufficient_data) {
    return (
      <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-gray-500" />
            <h3 className="text-sm font-bold text-gray-300">Reputation Health</h3>
          </div>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-gray-950 border border-gray-800 text-gray-500">
            Baseline Inactive
          </span>
        </div>

        <div className="py-3 text-center space-y-1">
          <div className="text-2xl font-bold text-gray-500">Insufficient Data</div>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Requires at least 5 customer reviews to calculate a statistically sound score.
          </p>
        </div>
      </div>
    )
  }

  const {
    overall,
    sentiment,
    ratings,
    responsiveness,
    issue_management,
    trend,
    trend_direction,
    weights,
  } = scoreData

  // Score Color & Gauge styling
  const scoreColor =
    overall >= 80
      ? 'text-emerald-400'
      : overall >= 65
      ? 'text-indigo-400'
      : overall >= 50
      ? 'text-amber-400'
      : 'text-rose-400'

  const scoreBadgeBg =
    overall >= 80
      ? 'bg-emerald-500/10 border-emerald-500/30'
      : overall >= 65
      ? 'bg-indigo-500/10 border-indigo-500/30'
      : overall >= 50
      ? 'bg-amber-500/10 border-amber-500/30'
      : 'bg-rose-500/10 border-rose-500/30'

  const trendBadge =
    trend_direction === 'up' ? (
      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>↑ Improving</span>
      </span>
    ) : trend_direction === 'down' ? (
      <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
        <TrendingDown className="w-3.5 h-3.5" />
        <span>↓ Declining</span>
      </span>
    ) : (
      <span className="flex items-center gap-1 text-xs font-semibold text-gray-300 bg-gray-950 px-2.5 py-1 rounded-xl border border-gray-800">
        <Minus className="w-3.5 h-3.5 text-gray-500" />
        <span>→ Stable</span>
      </span>
    )

  // Sub-component items
  const components = [
    {
      id: 'sentiment',
      label: 'Sentiment Health',
      score: sentiment,
      weight: Math.round(weights.sentiment * 100),
      icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
      color: 'bg-purple-500',
    },
    {
      id: 'ratings',
      label: 'Rating Health',
      score: ratings,
      weight: Math.round(weights.ratings * 100),
      icon: <Star className="w-3.5 h-3.5 text-amber-400" />,
      color: 'bg-amber-500',
    },
    {
      id: 'responsiveness',
      label: 'Response Rate',
      score: responsiveness,
      weight: Math.round(weights.responsiveness * 100),
      icon: <MessageSquareCheck className="w-3.5 h-3.5 text-blue-400" />,
      color: 'bg-blue-500',
    },
    {
      id: 'issues',
      label: 'Issue Management',
      score: issue_management,
      weight: Math.round(weights.issue_management * 100),
      icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />,
      color: 'bg-rose-500',
    },
    {
      id: 'trend',
      label: 'Recent Trend',
      score: trend,
      weight: Math.round(weights.trend * 100),
      icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />,
      color: 'bg-emerald-500',
    },
  ]

  return (
    <div className={`p-6 rounded-3xl border transition-all ${scoreBadgeBg} backdrop-blur-md space-y-5`}>
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gray-950/80 border border-gray-800">
            <HeartHandshake className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Reputation Health
            </span>
            <span className="text-[11px] text-gray-500">Deterministic Multi-Factor Score</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {trendBadge}
          <button
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="View deterministic weight formula"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Score Display */}
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl sm:text-5xl font-black tracking-tight ${scoreColor}`}>
          {overall}
        </span>
        <span className="text-lg font-bold text-gray-500">/ 100</span>
        <span className="ml-auto text-xs text-gray-400 font-medium">
          Based on <strong>{scoreData.total_reviews}</strong> verified reviews
        </span>
      </div>

      {/* Component Breakdown Gauges */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          <span>Component Breakdown</span>
          <span>Score & Weight</span>
        </div>

        <div className="space-y-2">
          {components.map((comp) => (
            <div key={comp.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-300 font-medium">
                  {comp.icon}
                  <span>{comp.label}</span>
                </span>
                <span className="text-gray-400 font-semibold">
                  <strong className="text-white">{comp.score}</strong>/100{' '}
                  <span className="text-[10px] text-gray-500">({comp.weight}%)</span>
                </span>
              </div>

              {/* Progress Track */}
              <div className="h-1.5 w-full bg-gray-950 rounded-full overflow-hidden border border-gray-800/80">
                <div
                  className={`h-full rounded-full ${comp.color} transition-all duration-500`}
                  style={{ width: `${Math.max(4, comp.score)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Formula Details Accordion */}
      {showFormulaDetails && (
        <div className="p-3.5 rounded-2xl bg-gray-950/90 border border-gray-800 text-[11px] text-gray-400 space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-1 text-gray-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Deterministic Scoring Formula:</span>
          </div>
          <p className="leading-relaxed">
            Score = (Sentiment &times; 25%) + (Ratings &times; 25%) + (Response Rate &times; 20%) + (Issue Management &times; 15%) + (Recent Trend &times; 15%). Calculated locally without LLM hallucination.
          </p>
        </div>
      )}
    </div>
  )
}
