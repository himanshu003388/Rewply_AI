'use client'

import React from 'react'
import {
  MessageSquare,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { Review } from '@/types/database.types'
import { ReputationHealthScoreResult } from '@/lib/metrics/health-score'

interface MetricCardsProps {
  reviews: Review[]
  healthScore?: ReputationHealthScoreResult | null
  isLoading?: boolean
}

export function MetricCards({ reviews, isLoading = false }: MetricCardsProps) {
  const totalReviews = reviews.length

  const criticalCount = reviews.filter(
    (r) => r.analysis?.priority === 'critical' || r.analysis?.priority === 'P1' || r.rating <= 2
  ).length

  const unansweredCount = reviews.filter((r) => r.response_status === 'pending').length

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-white/5 animate-pulse space-y-3">
            <div className="h-4 w-24 bg-slate-200 dark:bg-gray-800 rounded"></div>
            <div className="h-8 w-16 bg-slate-300 dark:bg-gray-800/80 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Total Reviews */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 shadow-sm flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-white/10 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600 dark:text-gray-300">
            Total Reviews
          </span>
          <MessageSquare className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-900 dark:text-white">{totalReviews}</span>
        </div>
        <span className="text-xs text-slate-500 dark:text-gray-400">All customer feedback</span>
      </div>

      {/* 2. Needs Reply (Unanswered) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 shadow-sm flex flex-col justify-between space-y-3 hover:border-amber-400 dark:hover:border-amber-500/30 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600 dark:text-gray-300">
            Needs Reply
          </span>
          <Clock className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{unansweredCount}</span>
        </div>
        <span className="text-xs text-amber-700 dark:text-amber-300/80">Reviews waiting for your response</span>
      </div>

      {/* 3. Urgent Issues */}
      <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-500/20 shadow-sm flex flex-col justify-between space-y-3 hover:border-rose-300 dark:hover:border-rose-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-rose-700 dark:text-rose-300">
            Urgent Issues
          </span>
          <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-rose-700 dark:text-rose-300">{criticalCount}</span>
        </div>
        <span className="text-xs text-rose-600 dark:text-rose-400/80">Negative or urgent reviews</span>
      </div>
    </div>
  )
}
