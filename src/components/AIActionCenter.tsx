'use client'

import React, { useState } from 'react'
import {
  ShieldAlert,
  Flame,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  XCircle,
  Sparkles,
  Zap,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { AIActionItem, ActionStatus } from '@/lib/api/actions'

interface AIActionCenterProps {
  actions: AIActionItem[]
  onUpdateStatus: (actionId: string, status: ActionStatus) => Promise<void>
  onSelectReview?: (reviewId: string) => void
  isLoading?: boolean
}

export function AIActionCenter({
  actions,
  onUpdateStatus,
  onSelectReview,
  isLoading = false,
}: AIActionCenterProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'high_priority' | 'investigating' | 'dismissed' | 'completed'>('all')
  const [selectedActionForModal, setSelectedActionForModal] = useState<AIActionItem | null>(null)
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({})

  const handleStatusChange = async (actionId: string, status: ActionStatus) => {
    setUpdatingIds((prev) => ({ ...prev, [actionId]: true }))
    try {
      await onUpdateStatus(actionId, status)
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [actionId]: false }))
    }
  }

  const filteredActions = actions.filter((act) => {
    if (activeFilter === 'high_priority') return act.priority === 'CRITICAL' || act.priority === 'HIGH'
    if (activeFilter === 'investigating') return act.status === 'investigating'
    if (activeFilter === 'dismissed') return act.status === 'dismissed'
    if (activeFilter === 'completed') return act.status === 'completed'
    return act.status !== 'dismissed' // default 'all' shows active items
  })

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl bg-gray-900/70 border border-gray-800 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-gray-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-800/60 rounded-2xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-3xl bg-[#0b0f19] border border-white/5 shadow-xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm shadow-rose-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">AI Action Center</h3>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-3 h-3" /> Priority Triage
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Data-grounded operational countermeasures derived from customer review intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-xl bg-gray-950 border border-gray-800 font-semibold text-white">
            {actions.filter((a) => a.status === 'investigating').length} Under Investigation
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-gray-800/80">
        {[
          { id: 'all', label: 'Active Actions', count: actions.filter((a) => a.status !== 'dismissed').length },
          { id: 'high_priority', label: 'Critical & High', count: actions.filter((a) => a.priority === 'CRITICAL' || a.priority === 'HIGH').length },
          { id: 'investigating', label: 'Investigating', count: actions.filter((a) => a.status === 'investigating').length },
          { id: 'completed', label: 'Resolved', count: actions.filter((a) => a.status === 'completed').length },
          { id: 'dismissed', label: 'Dismissed', count: actions.filter((a) => a.status === 'dismissed').length },
        ].map((tab) => {
          const isActive = activeFilter === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-[#06080e] text-gray-400 hover:text-gray-200 border border-white/5 hover:border-white/10'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-indigo-700 text-white' : 'bg-gray-900 text-gray-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Action Cards Grid */}
      {filteredActions.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#0b0f19] border border-white/5 space-y-2">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
          <h4 className="text-xs font-bold text-white">No actions in this category</h4>
          <p className="text-[11px] text-gray-400">All prioritized operational tasks are currently up to date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActions.map((action) => {
            const isCritical = action.priority === 'CRITICAL'
            const isHigh = action.priority === 'HIGH'
            const isInvestigating = action.status === 'investigating'
            const isCompleted = action.status === 'completed'
            const isDismissed = action.status === 'dismissed'
            const isUpdating = Boolean(updatingIds[action.id])

            const cardBorder = isCritical
              ? 'border-rose-500/30 bg-[#06080e] relative overflow-hidden'
              : isHigh
              ? 'border-amber-500/20 bg-[#06080e]'
              : 'border-white/5 bg-[#06080e]'

            const priorityBadge = isCritical ? (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                <Flame className="w-3 h-3 text-rose-400 animate-pulse" /> Critical Priority
              </span>
            ) : isHigh ? (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                <AlertCircle className="w-3 h-3 text-amber-400" /> High Priority
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase">
                Medium Priority
              </span>
            )

            const impactBadge =
              action.expected_impact === 'HIGH' ? (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                  High Impact
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase">
                  Medium Impact
                </span>
              )

            return (
              <div
                key={action.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${cardBorder}`}
              >
                {isCritical && <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>}
                {/* Top Row: Priority & Impact */}
                <div className="space-y-2 z-10 relative">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {priorityBadge}
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-gray-900/50 border border-white/5 text-gray-400">
                        {action.category}
                      </span>
                    </div>
                    {impactBadge}
                  </div>

                  {/* Problem Statement */}
                  <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                    {action.problem}
                  </h4>

                  {/* Evidence Box */}
                  <div className="p-3 rounded-xl bg-gray-900/50 border border-white/5 text-[11px] text-gray-300 space-y-1">
                    <span className="font-bold text-gray-400 uppercase text-[10px] block">
                      Observed Evidence:
                    </span>
                    <p className="leading-relaxed font-normal">{action.evidence}</p>
                  </div>

                  {/* Recommended Action */}
                  <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs space-y-1">
                    <span className="font-bold text-indigo-300 uppercase text-[10px] block flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" /> Recommended Action:
                    </span>
                    <p className="text-indigo-100 font-medium leading-relaxed">
                      {action.recommended_action}
                    </p>
                  </div>
                </div>

                {/* Status Indicator & Action Buttons */}
                <div className="border-t border-white/5 pt-3 flex items-center justify-between gap-2 flex-wrap z-10 relative">
                  {/* Status indicator */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                      </span>
                    ) : isInvestigating ? (
                      <span className="flex items-center gap-1 text-amber-400 font-semibold animate-pulse">
                        <Clock className="w-3.5 h-3.5" /> Under Investigation
                      </span>
                    ) : isDismissed ? (
                      <span className="flex items-center gap-1 text-gray-500 font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Dismissed
                      </span>
                    ) : (
                      <span className="text-gray-500 font-medium">Pending Review</span>
                    )}
                  </div>

                  {/* Button Controls */}
                  <div className="flex items-center gap-1.5">
                    {/* View Source Reviews */}
                    <button
                      onClick={() => setSelectedActionForModal(action)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                      title="Inspect source customer reviews"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Reviews ({action.source_review_examples.length})</span>
                    </button>

                    {/* Mark as Investigating */}
                    {!isCompleted && !isDismissed && (
                      <button
                        onClick={() =>
                          handleStatusChange(
                            action.id,
                            isInvestigating ? 'pending' : 'investigating'
                          )
                        }
                        disabled={isUpdating}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                          isInvestigating
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isInvestigating ? 'Investigating...' : 'Investigate'}</span>
                      </button>
                    )}

                    {/* Mark as Resolved */}
                    {!isCompleted && !isDismissed && (
                      <button
                        onClick={() => handleStatusChange(action.id, 'completed')}
                        disabled={isUpdating}
                        className="p-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50"
                        title="Mark action as resolved"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Dismiss */}
                    {!isDismissed ? (
                      <button
                        onClick={() => handleStatusChange(action.id, 'dismissed')}
                        disabled={isUpdating}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                        title="Dismiss action"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(action.id, 'pending')}
                        disabled={isUpdating}
                        className="px-2 py-1 rounded bg-gray-800 text-[10px] text-gray-400 hover:text-white"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Source Reviews Inspector Modal */}
      {selectedActionForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#06080e] border border-white/5 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0b0f19]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Source Review Feedback</h3>
                  <p className="text-xs text-gray-400">{selectedActionForModal.problem}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedActionForModal(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto">
              <span className="text-xs font-semibold uppercase text-gray-400 block">
                Customer Feedback Quotes Triggering this Action:
              </span>
              <div className="space-y-3">
                {selectedActionForModal.source_review_examples.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-[#0b0f19] border border-white/5 space-y-2 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{rev.customer_name}</span>
                        <span className="text-[10px] uppercase font-semibold text-gray-400 px-1.5 py-0.5 rounded bg-gray-900">
                          {rev.platform}
                        </span>
                        <div className="flex items-center text-amber-400 text-xs">
                          {'★'.repeat(rev.rating)}
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-gray-200 leading-relaxed italic font-normal">
                      &ldquo;{rev.review_text}&rdquo;
                    </p>

                    {onSelectReview && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            setSelectedActionForModal(null)
                            onSelectReview(rev.id)
                          }}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <span>Open Review Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-[#0b0f19]">
              <span className="text-xs text-gray-400">
                Action status: <strong className="text-white capitalize">{selectedActionForModal.status}</strong>
              </span>
              <button
                onClick={() => setSelectedActionForModal(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
