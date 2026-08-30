'use client'

import React from 'react'
import {
  Search,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  AlertCircle,
  Clock,
  ThumbsDown,
  ThumbsUp,
  Inbox,
} from 'lucide-react'
import { Review } from '@/types/database.types'

export type QuickFilter =
  | 'all'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'negative'
  | 'positive'
  | 'unanswered'

export type SortOption =
  | 'highest_priority'
  | 'most_recent'
  | 'lowest_rating'
  | 'highest_urgency'

interface ReviewInboxFiltersProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  activeFilter: QuickFilter
  onFilterChange: (filter: QuickFilter) => void
  selectedPlatform: string
  onPlatformChange: (platform: string) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  reviews: Review[]
  onReset: () => void
}

export function ReviewInboxFilters({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  selectedPlatform,
  onPlatformChange,
  sortBy,
  onSortChange,
  reviews,
  onReset,
}: ReviewInboxFiltersProps) {
  // Count computations for filter badges
  const counts = {
    all: reviews.length,
    critical: reviews.filter((r) => r.analysis?.priority === 'critical' || r.analysis?.priority === 'P1').length,
    high: reviews.filter((r) => r.analysis?.priority === 'high' || r.analysis?.priority === 'P2').length,
    medium: reviews.filter((r) => r.analysis?.priority === 'medium').length,
    low: reviews.filter((r) => r.analysis?.priority === 'low' || r.analysis?.priority === 'P3').length,
    negative: reviews.filter((r) => r.analysis?.sentiment === 'negative').length,
    positive: reviews.filter((r) => r.analysis?.sentiment === 'positive').length,
    unanswered: reviews.filter((r) => r.response_status === 'pending').length,
  }

  const filterButtons: Array<{ id: QuickFilter; label: string; icon: React.ReactNode; count: number; color: string }> = [
    { id: 'all', label: 'All', icon: <Inbox className="w-3.5 h-3.5" />, count: counts.all, color: 'text-gray-400' },
    { id: 'critical', label: 'Critical', icon: <Flame className="w-3.5 h-3.5 text-rose-500" />, count: counts.critical, color: 'text-rose-400' },
    { id: 'high', label: 'High', icon: <AlertCircle className="w-3.5 h-3.5 text-amber-500" />, count: counts.high, color: 'text-amber-400' },
    { id: 'medium', label: 'Medium', icon: <SlidersHorizontal className="w-3.5 h-3.5 text-yellow-500" />, count: counts.medium, color: 'text-yellow-400' },
    { id: 'low', label: 'Low', icon: <span className="w-2 h-2 rounded-full bg-emerald-500" />, count: counts.low, color: 'text-emerald-400' },
    { id: 'negative', label: 'Negative', icon: <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />, count: counts.negative, color: 'text-rose-400' },
    { id: 'positive', label: 'Positive', icon: <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />, count: counts.positive, color: 'text-emerald-400' },
    { id: 'unanswered', label: 'Unanswered', icon: <Clock className="w-3.5 h-3.5 text-indigo-400" />, count: counts.unanswered, color: 'text-indigo-400' },
  ]

  return (
    <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/5 shadow-sm space-y-4">
      {/* Top row: Search, Platform, Sort, Reset */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, keywords, issues, complaints..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Right side controls: Platform selector & Sort */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Platform Selector */}
          <select
            value={selectedPlatform}
            onChange={(e) => onPlatformChange(e.target.value)}
            className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Platforms</option>
            <option value="google">Google Reviews</option>
            <option value="yelp">Yelp</option>
            <option value="trustpilot">Trustpilot</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="highest_priority">Sort: Highest Priority</option>
            <option value="most_recent">Sort: Most Recent</option>
            <option value="lowest_rating">Sort: Lowest Rating</option>
            <option value="highest_urgency">Sort: Highest Urgency</option>
          </select>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-gray-950 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
            title="Reset All Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterButtons.map((btn) => {
          const isActive = activeFilter === btn.id
          return (
            <button
              key={btn.id}
              onClick={() => onFilterChange(btn.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-gray-900/50 border border-white/5 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {btn.icon}
              <span>{btn.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-900 text-gray-400 border border-gray-800'
                }`}
              >
                {btn.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
