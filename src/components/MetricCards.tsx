'use client'

import React from 'react'
import {
  MessageSquare,
  AlertTriangle,
  Clock,
  Activity
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

  const criticalCount = reviews.filter(
    (r) => r.analysis?.priority === 'critical' || r.analysis?.priority === 'P1' || r.rating <= 2
  ).length

  const unansweredCount = reviews.filter((r) => r.response_status === 'pending').length

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-white/5 animate-pulse space-y-3">
            <div className="h-4 w-24 bg-slate-200 dark:bg-gray-800 rounded"></div>
            <div className="h-8 w-16 bg-slate-300 dark:bg-gray-800/80 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {/* 1. Reputation Health Score */}
      <div className="glass p-5 rounded-2xl hover-lift flex flex-col justify-between space-y-3 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="flex items-center justify-between relative z-10">
          <span className="text-sm font-bold text-slate-700 dark:text-gray-200">
            Health Score
          </span>
          <Activity className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="flex items-baseline gap-2 relative z-10">
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            {healthScore?.overall || 0}
          </span>
          <span className="text-sm text-slate-500 dark:text-gray-400 font-bold">/100</span>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 relative z-10 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${healthScore?.overall || 0}%` }}
          ></div>
        </div>
      </div>

      {/* 2. Total Reviews */}
      <div className="glass p-5 rounded-2xl hover-lift flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700 dark:text-gray-200">
            Total Reviews
          </span>
          <MessageSquare className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-900 dark:text-white">{totalReviews}</span>
        </div>
        <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">Analyzed feedback</span>
      </div>

      {/* 3. Needs Reply (Unanswered) */}
      <div className="glass p-5 rounded-2xl hover-lift flex flex-col justify-between space-y-3 border-l-4 border-l-amber-500">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700 dark:text-gray-200">
            Needs Reply
          </span>
          <Clock className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{unansweredCount}</span>
        </div>
        <span className="text-xs text-amber-700 dark:text-amber-300/80 font-medium">Awaiting response</span>
      </div>

      {/* 4. Urgent Issues */}
      <div className="glass p-5 rounded-2xl hover-lift flex flex-col justify-between space-y-3 border-l-4 border-l-rose-500 bg-rose-50/20 dark:bg-rose-950/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-rose-700 dark:text-rose-300">
            Urgent Issues
          </span>
          <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-rose-700 dark:text-rose-300">{criticalCount}</span>
        </div>
        <span className="text-xs text-rose-600 dark:text-rose-400/80 font-medium">Critical attention needed</span>
      </div>
    </div>
  )
}
