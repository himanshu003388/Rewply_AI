'use client'

import React from 'react'
import { Search, RotateCcw } from 'lucide-react'
import { ReviewFilters } from '@/lib/api/reviews'

interface ReviewFiltersBarProps {
  filters: ReviewFilters
  onFilterChange: (newFilters: ReviewFilters) => void
  totalCount: number
}

export function ReviewFiltersBar({ filters, onFilterChange, totalCount }: ReviewFiltersBarProps) {
  const handleReset = () => {
    onFilterChange({
      platform: 'all',
      rating: 'all',
      sentiment: 'all',
      status: 'all',
      search: '',
    })
  }

  return (
    <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reviews, issues, customer name..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Count & Reset */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <span className="text-xs text-gray-400 font-medium">
            Showing <strong className="text-white">{totalCount}</strong> reviews
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] text-gray-300 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Filter Selectors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {/* Platform */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Platform</label>
          <select
            value={filters.platform || 'all'}
            onChange={(e) => onFilterChange({ ...filters, platform: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Platforms</option>
            <option value="google">Google Reviews</option>
            <option value="yelp">Yelp</option>
            <option value="trustpilot">Trustpilot</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Rating</label>
          <select
            value={filters.rating ?? 'all'}
            onChange={(e) => onFilterChange({ ...filters, rating: e.target.value === 'all' ? 'all' : Number(e.target.value) })}
            className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars (Praise)</option>
            <option value="4">4 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star (Critical)</option>
          </select>
        </div>

        {/* Sentiment */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Sentiment</label>
          <select
            value={filters.sentiment || 'all'}
            onChange={(e) => onFilterChange({ ...filters, sentiment: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
          </select>
        </div>

        {/* AI Response Status */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">AI Response Status</label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="sent">Sent</option>
          </select>
        </div>
      </div>
    </div>
  )
}
