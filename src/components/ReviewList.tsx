'use client'

import React, { useState } from 'react'
import { ReviewCard } from './ReviewCard'
import { Review } from '@/types/database.types'
import { Inbox, ChevronLeft, ChevronRight, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react'

interface ReviewListProps {
  reviews: Review[]
  onOpenDetails: (review: Review) => void
  onAnalyze: (reviewId: string) => Promise<void>
  onGenerateResponse: (reviewId: string, tone?: string, userNotes?: string) => Promise<void>
  onApproveResponse: (reviewId: string) => Promise<void>
  analyzingIds?: Record<string, boolean>
  generatingIds?: Record<string, boolean>
  approvingIds?: Record<string, boolean>
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  columns?: 1 | 2 | 3 | 'auto'
}

const ITEMS_PER_PAGE = 8

export function ReviewList({
  reviews,
  onOpenDetails,
  onAnalyze,
  onGenerateResponse,
  onApproveResponse,
  analyzingIds = {},
  generatingIds = {},
  approvingIds = {},
  isLoading = false,
  isError = false,
  onRetry,
  columns = 'auto',
}: ReviewListProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentReviews = reviews.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1))
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1))

  const gridClass =
    columns === 1
      ? 'grid grid-cols-1 gap-4'
      : columns === 2
      ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
      : columns === 3
      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
      : 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4'

  // 1. Loading State
  if (isLoading) {
    return (
      <div className={gridClass}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 animate-pulse space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-slate-200 dark:bg-gray-800 rounded"></div>
              <div className="h-4 w-20 bg-slate-200 dark:bg-gray-800 rounded"></div>
            </div>
            <div className="h-3 w-48 bg-slate-200 dark:bg-gray-800/80 rounded"></div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-100 dark:bg-gray-800/60 rounded"></div>
              <div className="h-3 w-5/6 bg-slate-100 dark:bg-gray-800/60 rounded"></div>
            </div>
            <div className="h-8 w-full bg-slate-100 dark:bg-gray-800/40 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  // 2. Error State
  if (isError) {
    return (
      <div className="p-10 text-center rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500 dark:text-rose-400 mx-auto" />
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Failed to load customer reviews</h4>
        <p className="text-xs text-rose-700 dark:text-rose-300 max-w-sm mx-auto">
          An error occurred while communicating with the database. Please check your network connection or try again.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    )
  }

  // 3. Empty State
  if (reviews.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 space-y-3 shadow-sm">
        <Inbox className="w-10 h-10 text-slate-400 dark:text-gray-600 mx-auto" />
        <h4 className="text-sm font-semibold text-slate-800 dark:text-gray-300">No matching reviews found in this view</h4>
        <p className="text-xs text-slate-500 dark:text-gray-500 max-w-sm mx-auto">
          Try clearing your search filters or switching to a different priority tab.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* List Header Actions */}
      <div className="flex justify-end mb-2">
        <button 
          onClick={() => {
            const pendingReviews = reviews.filter(r => r.response_status === 'pending');
            pendingReviews.forEach(r => {
              if (!generatingIds[r.id]) onGenerateResponse(r.id);
            });
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all hover-lift"
          title="Draft responses for all unanswered reviews on this page"
        >
          <Sparkles className="w-4 h-4" />
          Bulk AI Draft All Pending
        </button>
      </div>

      {/* Grid of Reviews */}
      <div className={gridClass}>
        {currentReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onOpenDetails={onOpenDetails}
            onAnalyze={onAnalyze}
            onGenerateResponse={onGenerateResponse}
            onApproveResponse={onApproveResponse}
            isAnalyzing={Boolean(analyzingIds[review.id])}
            isGenerating={Boolean(generatingIds[review.id])}
            isApproving={Boolean(approvingIds[review.id])}
          />
        ))}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-gray-400 shadow-sm">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{startIndex + 1}</strong> -{' '}
            <strong className="text-slate-900 dark:text-white">{Math.min(startIndex + ITEMS_PER_PAGE, reviews.length)}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white">{reviews.length}</strong> reviews
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-30 disabled:pointer-events-none transition-colors text-slate-800 dark:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-700 dark:text-gray-300 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-30 disabled:pointer-events-none transition-colors text-slate-800 dark:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
