'use client'

import React from 'react'
import {
  HeartHandshake,
  MessageSquare,
  ThumbsDown,
  Flame,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { Review } from '@/types/database.types'
import { ReputationHealthScoreResult } from '@/lib/metrics/health-score'

interface MetricCardsProps {
  reviews: Review[]
  healthScore?: ReputationHealthScoreResult | null
  isLoading?: boolean
}

export function MetricCards({ reviews, healthScore, isLoading = false }: MetricCardsProps) {
  const totalReviews = reviews.length

  const negativeCount = reviews.filter(
    (r) => r.analysis?.sentiment === 'negative' || r.rating <= 2
  ).length
  const negativePercentage = totalReviews > 0 ? Math.round((negativeCount / totalReviews) * 100) : 0

  const criticalCount = reviews.filter(
    (r) => r.analysis?.priority === 'critical' || r.analysis?.priority === 'P1'
  ).length

  const unansweredCount = reviews.filter((r) => r.response_status === 'pending').length

  const repScore = healthScore?.is_sufficient_data ? healthScore.overall : '--'
  const trendDirection = healthScore?.trend_direction || 'stable'

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 rounded-2xl bg-gray-900/40 border border-white/5 animate-pulse space-y-2">
            <div className="h-3 w-20 bg-gray-800 rounded"></div>
            <div className="h-7 w-16 bg-gray-800/80 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* 1. Reputation Health */}
      <div className="p-4 rounded-2xl bg-[#0b0f19] border border-indigo-500/20 shadow-sm flex flex-col justify-between space-y-2 hover:border-indigo-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Reputation Health
          </span>
          <HeartHandshake className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-white">{repScore}</span>
          <span className="text-xs text-gray-500 font-bold">/ 100</span>
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          {trendDirection === 'up' ? (
            <span className="flex items-center gap-0.5 text-emerald-400 font-semibold">
              <TrendingUp className="w-3 h-3" /> Improving
            </span>
          ) : trendDirection === 'down' ? (
            <span className="flex items-center gap-0.5 text-rose-400 font-semibold">
              <TrendingDown className="w-3 h-3" /> Declining
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-gray-400 font-medium">
              <Minus className="w-3 h-3 text-gray-500" /> Stable
            </span>
          )}
        </div>
      </div>

      {/* 2. Total Reviews */}
      <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/5 shadow-sm flex flex-col justify-between space-y-2 hover:border-white/10 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Total Reviews
          </span>
          <MessageSquare className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-white">{totalReviews}</span>
          <span className="text-xs text-purple-400 font-medium">verified</span>
        </div>
        <span className="text-[11px] text-gray-400">Google • Yelp • Trustpilot</span>
      </div>

      {/* 3. Negative Reviews */}
      <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/5 shadow-sm flex flex-col justify-between space-y-2 hover:border-white/10 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Negative Reviews
          </span>
          <ThumbsDown className="w-4 h-4 text-rose-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-rose-400">{negativeCount}</span>
          <span className="text-xs text-gray-500 font-medium">({negativePercentage}%)</span>
        </div>
        <span className="text-[11px] text-gray-400">Rating &le; 2★ or negative</span>
      </div>

      {/* 4. Critical Reviews */}
      <div className="p-4 rounded-2xl bg-rose-950/10 border border-rose-500/20 shadow-sm flex flex-col justify-between space-y-2 hover:border-rose-500/40 transition-colors relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
            Critical Reviews
          </span>
          <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-rose-300">{criticalCount}</span>
          <span className="text-xs text-rose-400/80 font-bold uppercase">Urgent</span>
        </div>
        <span className="text-[11px] text-rose-400/80">Immediate attention</span>
      </div>

      {/* 5. Unanswered Reviews */}
      <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/5 shadow-sm flex flex-col justify-between space-y-2 hover:border-amber-500/30 transition-colors col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Unanswered
          </span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-amber-400">{unansweredCount}</span>
          <span className="text-xs text-gray-500 font-medium">pending</span>
        </div>
        <span className="text-[11px] text-amber-300/80 font-medium">Needs team response</span>
      </div>
    </div>
  )
}
