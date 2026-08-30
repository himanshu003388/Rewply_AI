'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Sparkles,
  Loader2,
  ChevronDown,
  Flame,
  Clock,
  CheckCircle2,
  X,
  CreditCard,
  Truck,
  UtensilsCrossed,
  ThumbsUp,
  Smartphone,
} from 'lucide-react'
import { Review } from '@/types/database.types'
import { DemoScenarioType } from '@/app/api/reviews/simulate/route'

interface SimulateReviewButtonProps {
  onReviewSimulated: (review: Review, isCriticalOrHigh: boolean) => void
  onOpenDetails: (review: Review) => void
}

const SCENARIOS: Array<{
  type: DemoScenarioType
  label: string
  icon: React.ReactNode
  badge: string
  badgeColor: string
}> = [
  {
    type: 'billing',
    label: 'Critical Billing Dispute',
    icon: <CreditCard className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />,
    badge: 'Critical',
    badgeColor: 'text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-300 dark:border-rose-500/20',
  },
  {
    type: 'delivery',
    label: '90-Min Delivery Delay',
    icon: <Truck className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />,
    badge: 'High',
    badgeColor: 'text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-300 dark:border-amber-500/20',
  },
  {
    type: 'food_quality',
    label: 'Raw Meat & Food Quality',
    icon: <UtensilsCrossed className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />,
    badge: 'Critical',
    badgeColor: 'text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-300 dark:border-rose-500/20',
  },
  {
    type: 'positive',
    label: '5-Star Brand Praise',
    icon: <ThumbsUp className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />,
    badge: 'Low',
    badgeColor: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20',
  },
  {
    type: 'app_technical',
    label: 'App Crash & Promo Glitch',
    icon: <Smartphone className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400 shrink-0" />,
    badge: 'Medium',
    badgeColor: 'text-purple-700 dark:text-purple-300 bg-purple-500/10 border-purple-300 dark:border-purple-500/20',
  },
]

export function SimulateReviewButton({
  onReviewSimulated,
  onOpenDetails,
}: SimulateReviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState(1)
  const [toastReview, setToastReview] = useState<Review | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSimulate = async (scenario?: DemoScenarioType) => {
    setIsOpen(false)
    setIsProcessing(true)
    setProcessingStage(1)

    // Visual progression
    const timer1 = setTimeout(() => setProcessingStage(2), 800)
    const timer2 = setTimeout(() => setProcessingStage(3), 1600)

    try {
      const res = await fetch('/api/reviews/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      })

      const json = await res.json()

      if (json.success && json.review) {
        onReviewSimulated(json.review, json.isCriticalOrHigh)

        if (json.isCriticalOrHigh) {
          setToastReview(json.review)
        }
      } else {
        alert(json.error || 'Simulation failed.')
      }
    } catch (err) {
      alert((err as Error).message)
    } finally {
      clearTimeout(timer1)
      clearTimeout(timer2)
      setIsProcessing(false)
      setProcessingStage(1)
    }
  }

  return (
    <>
      {/* Simulation Trigger Button & Dropdown */}
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <div className="flex items-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex-shrink-0">
          <button
            onClick={() => handleSimulate()}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            ) : (
              <Plus className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="hidden sm:inline">Simulate Review</span>
            <span className="sm:hidden">Simulate</span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={isProcessing}
            className="p-1.5 sm:p-2 border-l border-indigo-500/60 hover:bg-indigo-700 rounded-r-xl transition-colors disabled:opacity-50"
            title="Pick specific demo scenario"
            aria-label="Pick specific demo scenario"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dropdown Scenario Selector */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 px-3 py-1.5 block">
              Demo Test Scenarios:
            </span>

            <div className="space-y-1">
              {SCENARIOS.map((sc) => (
                <button
                  key={sc.type}
                  onClick={() => handleSimulate(sc.type)}
                  className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800/80 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 group-hover:border-slate-300 dark:group-hover:border-gray-700 shrink-0">
                      {sc.icon}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-gray-200 group-hover:text-slate-950 dark:group-hover:text-white truncate">
                      {sc.label}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Real-time AI Processing Modal Banner */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 sm:space-y-5 text-center">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 w-fit mx-auto animate-pulse">
              <Sparkles className="w-7 h-7 sm:w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Analyzing Customer Feedback...</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm mx-auto">
                Live Google Gemini pipeline evaluating text sentiment, root causes &amp; operational urgency
              </p>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-2.5 text-left bg-slate-50 dark:bg-gray-950 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-gray-800 text-xs">
              <div className="flex items-start sm:items-center gap-2.5">
                {processingStage >= 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                ) : (
                  <Loader2 className="w-4 h-4 text-slate-400 dark:text-gray-500 animate-spin shrink-0 mt-0.5 sm:mt-0" />
                )}
                <span className={`min-w-0 break-words ${processingStage >= 1 ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400 dark:text-gray-500'}`}>
                  1. Ingesting customer review into database
                </span>
              </div>

              <div className="flex items-start sm:items-center gap-2.5">
                {processingStage >= 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                ) : (
                  <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin shrink-0 mt-0.5 sm:mt-0" />
                )}
                <span className={`min-w-0 break-words ${processingStage >= 2 ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400 dark:text-gray-500'}`}>
                  2. Extracting sentiment, emotion &amp; sub-issues with Gemini
                </span>
              </div>

              <div className="flex items-start sm:items-center gap-2.5">
                {processingStage >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400 dark:text-gray-500 shrink-0 mt-0.5 sm:mt-0" />
                )}
                <span className={`min-w-0 break-words ${processingStage >= 3 ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400 dark:text-gray-500'}`}>
                  3. Calculating priority score &amp; updating dashboard
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Review Real-Time Alert Notification Toast */}
      {toastReview && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 max-w-md w-auto sm:w-full animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-gray-900 border border-rose-300 dark:border-rose-500/50 shadow-2xl shadow-rose-950/20 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 mt-0.5 shrink-0">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 dark:text-rose-400 animate-pulse" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Critical Alert Ingested
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 shrink-0">
                    URGENT
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-gray-200 font-medium line-clamp-2 break-words">
                  {toastReview.customer_name}: &ldquo;{toastReview.review_text}&rdquo;
                </p>
                <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      onOpenDetails(toastReview)
                      setToastReview(null)
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Open Triage &amp; Reply
                  </button>
                  <button
                    onClick={() => setToastReview(null)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 text-xs font-medium transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setToastReview(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors shrink-0"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
