'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  Flame,
  AlertCircle,
  Loader2,
  RotateCw,
  MessageSquare,
  ShieldAlert,
  Edit3,
  Check,
  Bot,
  X,
} from 'lucide-react'
import { Review } from '@/types/database.types'

interface ReviewCardProps {
  review: Review
  onOpenDetails: (review: Review) => void
  onAnalyze: (reviewId: string) => Promise<void>
  onGenerateResponse: (reviewId: string, tone?: string, userNotes?: string) => Promise<void>
  onApproveResponse: (reviewId: string) => Promise<void>
  isAnalyzing?: boolean
  isGenerating?: boolean
  isApproving?: boolean
}

export function ReviewCard({
  review,
  onOpenDetails,
  onAnalyze,
  onGenerateResponse,
  onApproveResponse,
  isAnalyzing = false,
  isGenerating = false,
  isApproving = false,
}: ReviewCardProps) {
  const [showQuickAssist, setShowQuickAssist] = useState(false)
  const [cardQuickNotes, setCardQuickNotes] = useState('')
  const isCritical =
    review.analysis?.priority === 'critical' || review.analysis?.priority === 'P1'
  const isHigh =
    review.analysis?.priority === 'high' || review.analysis?.priority === 'P2'
  const isMedium = review.analysis?.priority === 'medium'

  const hasAnalysis = Boolean(review.analysis && review.analysis.sentiment)
  const hasResponse = Boolean(review.ai_response && review.ai_response.trim().length > 0)
  const isPending = review.response_status === 'pending'
  const isApproved = review.response_status === 'approved'

  // Priority Styles
  const priorityConfig = isCritical
    ? {
        label: 'CRITICAL',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20',
        card: 'border-rose-500/30 bg-[#0b0f19] relative overflow-hidden',
        icon: <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />,
      }
    : isHigh
    ? {
        label: 'HIGH',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        card: 'border-amber-500/20 bg-[#0b0f19] hover:border-amber-500/40',
        icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
      }
    : isMedium
    ? {
        label: 'MEDIUM',
        badge: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
        card: 'border-white/5 bg-[#0b0f19] hover:border-white/10',
        icon: <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />,
      }
    : {
        label: 'LOW',
        badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        card: 'border-white/5 bg-[#0b0f19] hover:border-white/10',
        icon: <span className="w-2 h-2 rounded-full bg-emerald-400" />,
      }

  // Platform styling
  const platformColor =
    review.platform === 'google'
      ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      : review.platform === 'yelp'
      ? 'text-red-400 bg-red-500/10 border-red-500/20'
      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'

  // Sentiment styling
  const sentimentColor =
    review.analysis?.sentiment === 'positive'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : review.analysis?.sentiment === 'negative'
      ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      : 'text-gray-400 bg-gray-500/10 border-gray-500/20'

  // Status Badge
  const statusBadge =
    review.response_status === 'sent' ? (
      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" /> Sent
      </span>
    ) : review.response_status === 'approved' ? (
      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <CheckCircle2 className="w-3 h-3" /> Approved
      </span>
    ) : (
      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Clock className="w-3 h-3" /> Pending Review
      </span>
    )

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 relative overflow-hidden group ${priorityConfig.card}`}
    >
      {/* Top Banner for Critical items */}
      {isCritical && (
        <>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 bg-rose-500/5 px-3 py-1.5 -mx-5 -mt-5 mb-1 border-b border-rose-500/10">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Immediate Attention Required — High Operational Severity</span>
          </div>
        </>
      )}

      {/* Review Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-white">{review.customer_name}</span>
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${platformColor}`}>
              {review.platform}
            </span>
            <span className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${priorityConfig.badge}`}>
              {priorityConfig.icon}
              <span>{priorityConfig.label}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-400 text-xs">
              {'★'.repeat(review.rating)}
              <span className="text-gray-600">{'★'.repeat(5 - review.rating)}</span>
              <span className="ml-1 text-[11px] text-gray-400 font-normal">({review.rating}/5)</span>
            </div>
            <span className="text-gray-600">•</span>
            <span className="text-[11px] text-gray-400">
              {new Date(review.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        <div>{statusBadge}</div>
      </div>

      {/* Review Text */}
      <p className="text-xs text-gray-200 line-clamp-3 leading-relaxed font-normal italic">
        &ldquo;{review.review_text}&rdquo;
      </p>

      {/* Structured Analysis Tags */}
      {hasAnalysis ? (
        <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1">
          {/* Sentiment Badge */}
          <span className={`px-2 py-0.5 rounded-md border capitalize font-semibold ${sentimentColor}`}>
            {review.analysis?.sentiment}
          </span>

          {/* Issue Badge */}
          {(review.analysis?.primary_issue || review.analysis?.issue) && (
            <span className="px-2 py-0.5 rounded-md bg-gray-900/50 border border-white/5 text-gray-300">
              Issue: <strong className="text-white capitalize">{review.analysis.primary_issue || review.analysis.issue}</strong>
            </span>
          )}

          {/* Urgency Score */}
          {review.analysis?.urgency_score !== undefined ? (
            <span className="px-2 py-0.5 rounded-md bg-gray-900/50 border border-white/5 text-amber-300">
              Urgency: <strong>{review.analysis.urgency_score}/10</strong>
            </span>
          ) : review.analysis?.urgency ? (
            <span className="px-2 py-0.5 rounded-md bg-gray-900/50 border border-white/5 text-amber-300 capitalize">
              Urgency: <strong>{review.analysis.urgency}</strong>
            </span>
          ) : null}

          {/* Emotion */}
          {review.analysis?.emotion && (
            <span className="px-2 py-0.5 rounded-md bg-gray-900/50 border border-white/5 text-purple-300 capitalize">
              {review.analysis.emotion}
            </span>
          )}
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-gray-900/50 border border-white/5 text-xs text-gray-400 flex items-center justify-between">
          <span className="text-[11px]">Analysis pending — click Analyze to run Gemini triage</span>
          <button
            onClick={() => onAnalyze(review.id)}
            disabled={isAnalyzing}
            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Analyze Now
          </button>
        </div>
      )}

      {/* AI Draft Response Preview */}
      {hasResponse && (
        <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/10 space-y-1.5 relative">
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1 text-indigo-400 font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Gemini AI Draft Response
            </span>
            <span
              className={`font-semibold capitalize px-1.5 py-0.2 rounded text-[10px] ${
                isApproved
                  ? 'text-blue-400 bg-blue-500/10'
                  : isPending
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-emerald-400 bg-emerald-500/10'
              }`}
            >
              {review.response_status}
            </span>
          </div>
          <p className="text-[11px] text-indigo-200/90 line-clamp-2 leading-relaxed font-normal italic">
            &ldquo;{review.ai_response}&rdquo;
          </p>
        </div>
      )}

      {/* Quick AI Generative Assistant Drawer */}
      {showQuickAssist && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-indigo-950/40 border border-indigo-500/30 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-indigo-400" /> Generative AI Reply Assistant
            </span>
            <button
              type="button"
              onClick={() => setShowQuickAssist(false)}
              className="text-gray-500 hover:text-gray-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={cardQuickNotes}
              onChange={(e) => setCardQuickNotes(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onGenerateResponse(review.id, undefined, cardQuickNotes)
                }
              }}
              placeholder="Type rough words (e.g., 'sorry delay, 20% discount on next order')..."
              className="w-full px-3 py-1.5 bg-[#06080e] border border-indigo-500/30 focus:border-indigo-400 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => onGenerateResponse(review.id, undefined, cardQuickNotes)}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all shrink-0 flex items-center gap-1 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              <span>Generate</span>
            </button>
          </div>
        </div>
      )}

      {/* Action Footer Button Bar */}
      <div className="border-t border-gray-800/80 pt-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Analyze / Re-Analyze */}
          <button
            onClick={() => onAnalyze(review.id)}
            disabled={isAnalyzing}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-900/50 border border-white/5 hover:bg-gray-800 text-xs font-medium text-gray-300 transition-colors disabled:opacity-50"
            title={hasAnalysis ? 'Re-run Gemini analysis' : 'Analyze review'}
          >
            {isAnalyzing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            ) : hasAnalysis ? (
              <RotateCw className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>{hasAnalysis ? 'Re-Analyze' : 'Analyze'}</span>
          </button>

          {/* Quick AI Assist Toggle Button */}
          <button
            type="button"
            onClick={() => setShowQuickAssist(!showQuickAssist)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              showQuickAssist
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                : 'bg-gray-900/50 border-indigo-500/20 text-indigo-300 hover:bg-gray-800 hover:border-indigo-500/40'
            }`}
            title="Compose reply using quick keywords or instructions"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Assist</span>
          </button>

          {/* Generate Response or Regenerate */}
          {!hasResponse ? (
            <button
              onClick={() => onGenerateResponse(review.id)}
              disabled={isGenerating}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white shadow-sm transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5" />
              )}
              <span>Generate Response</span>
            </button>
          ) : (
            <button
              onClick={() => onGenerateResponse(review.id)}
              disabled={isGenerating}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-900/50 border border-white/5 hover:bg-gray-800 text-xs font-medium text-indigo-300 transition-colors disabled:opacity-50"
              title="Regenerate draft with Gemini"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCw className="w-3.5 h-3.5" />
              )}
              <span>Regenerate</span>
            </button>
          )}

          {/* Edit Response button */}
          {hasResponse && (
            <button
              onClick={() => onOpenDetails(review)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-900/50 border border-white/5 hover:bg-gray-800 text-xs font-medium text-gray-300 transition-colors"
              title="Edit response in studio"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Response</span>
            </button>
          )}

          {/* 1-Click Approve button (when pending) */}
          {hasResponse && isPending && (
            <button
              onClick={() => onApproveResponse(review.id)}
              disabled={isApproving}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-xs font-medium text-white shadow-sm transition-colors disabled:opacity-50"
              title="Approve response"
            >
              {isApproving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Approve</span>
            </button>
          )}
        </div>

        {/* View Details Button */}
        <button
          onClick={() => onOpenDetails(review)}
          className="flex items-center gap-1 text-xs font-semibold text-gray-300 hover:text-white group-hover:translate-x-0.5 transition-all"
        >
          <span>View Details</span>
          <ChevronRight className="w-4 h-4 text-indigo-400" />
        </button>
      </div>
    </div>
  )
}
