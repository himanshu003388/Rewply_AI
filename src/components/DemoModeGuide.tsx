'use client'

import React, { useState } from 'react'
import {
  Play,
  RotateCcw,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Inbox,
  Flame,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Zap,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react'
import { Review } from '@/types/database.types'

export interface DemoStep {
  stepNumber: number
  title: string
  subtitle: string
  explanation: string
  actionLabel?: string
  icon: React.ReactNode
}

interface DemoModeGuideProps {
  isActive: boolean
  onClose: () => void
  onStepChange: (step: number) => void
  onResetData: () => Promise<void>
  onSimulateCriticalReview: () => Promise<void>
  onOpenFirstReview: () => void
  onAskQuestion: (q: string) => Promise<void>
  reviews: Review[]
}

const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    title: 'Dashboard Overview',
    subtitle: 'Real-time Telemetry & Ingestion Stream',
    explanation:
      'Rewply AI connects to Google, Yelp, and Trustpilot to provide a live Reputation Health Score (82/100) and review stream for BurgerHub Delivery.',
    actionLabel: 'Inspect Overview',
    icon: <Inbox className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
  },
  {
    stepNumber: 2,
    title: 'Simulate Incoming Review',
    subtitle: 'Automated Real-Time AI Pipeline',
    explanation:
      'When a new review arrives, Rewply AI immediately triggers the Google Gemini triage pipeline to extract sentiment, urgency, and operational category.',
    actionLabel: '⚡ Ingest & Analyze Review',
    icon: <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
  },
  {
    stepNumber: 3,
    title: 'Structured Gemini Analysis',
    subtitle: 'Root Cause & Urgency Extraction',
    explanation:
      'Gemini extracts the exact primary issue, sub-issues, customer emotion, intent, urgency score, and recommended next action in structured JSON.',
    actionLabel: 'View AI Analysis Breakdown',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
  },
  {
    stepNumber: 4,
    title: 'Critical Priority Ranking',
    subtitle: 'Immediate Escalation for P1 Threats',
    explanation:
      'High-risk complaints (billing disputes, food safety, delivery disasters) automatically bubble to the top of the inbox with crimson alert badges.',
    actionLabel: 'Filter Critical Reviews',
    icon: <Flame className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
  },
  {
    stepNumber: 5,
    title: 'Personalized Response Studio',
    subtitle: 'Brand-Aligned, Non-Liability Drafts',
    explanation:
      'Generates custom 50–100 word replies matching customer tone (empathetic, apologetic, friendly) without inventing refunds or legal liabilities.',
    actionLabel: 'Open AI Response Studio',
    icon: <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
  },
  {
    stepNumber: 6,
    title: 'Recurring Problems Intelligence',
    subtitle: 'Trend Velocity & Severity Scoring',
    explanation:
      'Identifies operational bottlenecks (e.g. Delivery Delays) by calculating period-over-period trend changes (+38%) and objective severity (9/10).',
    actionLabel: 'Inspect Recurring Problems',
    icon: <BarChart3 className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
  },
  {
    stepNumber: 7,
    title: 'Executive AI Business Insights',
    subtitle: 'Actionable Intelligence for Management',
    explanation:
      'Gemini synthesizes all review data into a strategic headline, top problem, emerging trend, and prioritized P1/P2/P3 operational action plan.',
    actionLabel: 'View AI Business Insights',
    icon: <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
  },
  {
    stepNumber: 8,
    title: 'Ask Your Reviews Assistant',
    subtitle: 'Data-Grounded Conversational RAG',
    explanation:
      'Business owners can ask natural language questions (e.g. "What should we fix first?"). Gemini answers using only verified review data.',
    actionLabel: 'Ask: "What should we fix first?"',
    icon: <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
  },
  {
    stepNumber: 9,
    title: 'AI Action Center',
    subtitle: 'Operational Task Countermeasures',
    explanation:
      'Turns intelligence into concrete countermeasures that managers can mark as "Under Investigation" or "Resolved" with 1 click.',
    actionLabel: 'Open Action Center',
    icon: <Zap className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
  },
]

export function DemoModeGuide({
  isActive,
  onClose,
  onStepChange,
  onResetData,
  onSimulateCriticalReview,
  onOpenFirstReview,
  onAskQuestion,
}: DemoModeGuideProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isActionRunning, setIsActionRunning] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  if (!isActive) return null

  const step = DEMO_STEPS[currentStepIndex]
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === DEMO_STEPS.length - 1

  const handleNext = () => {
    if (!isLast) {
      const nextIndex = currentStepIndex + 1
      setCurrentStepIndex(nextIndex)
      onStepChange(nextIndex + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirst) {
      const prevIndex = currentStepIndex - 1
      setCurrentStepIndex(prevIndex)
      onStepChange(prevIndex + 1)
    }
  }

  const handleExecuteStepAction = async () => {
    setIsActionRunning(true)
    try {
      if (step.stepNumber === 1) {
        onStepChange(1)
      } else if (step.stepNumber === 2) {
        await onSimulateCriticalReview()
      } else if (step.stepNumber === 3) {
        onOpenFirstReview()
      } else if (step.stepNumber === 4) {
        onStepChange(4)
      } else if (step.stepNumber === 5) {
        onOpenFirstReview()
      } else if (step.stepNumber === 6) {
        onStepChange(6)
      } else if (step.stepNumber === 7) {
        onStepChange(7)
      } else if (step.stepNumber === 8) {
        onStepChange(8)
        await onAskQuestion('What should we fix first?')
      } else if (step.stepNumber === 9) {
        onStepChange(9)
      }
    } finally {
      setIsActionRunning(false)
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    try {
      await onResetData()
      setCurrentStepIndex(0)
      onStepChange(1)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 animate-in slide-in-from-bottom-6 duration-300">
      <div className="p-5 rounded-3xl bg-white/95 dark:bg-gray-950/95 border border-indigo-200 dark:border-indigo-500/50 shadow-2xl shadow-indigo-950/20 dark:shadow-indigo-950/60 backdrop-blur-xl space-y-4 text-slate-900 dark:text-white">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-gray-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Play className="w-3.5 h-3.5 fill-current" /> Demo Mode
            </span>
            <span className="text-xs text-slate-500 dark:text-gray-400 font-semibold">
              Step {step.stepNumber} of {DEMO_STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-900 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white transition-colors disabled:opacity-50"
              title="Reset dataset back to original 50 BurgerHub reviews"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting...' : 'Reset Demo Data'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
              title="Exit Demo Mode"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {step.icon}
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {step.title}: <span className="text-indigo-600 dark:text-indigo-400 font-normal">{step.subtitle}</span>
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed font-normal pl-8">
              {step.explanation}
            </p>
          </div>

          {/* Action Trigger & Stepper Navigation */}
          <div className="md:col-span-4 flex flex-col items-stretch sm:items-end gap-2.5">
            {step.actionLabel && (
              <button
                onClick={handleExecuteStepAction}
                disabled={isActionRunning}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isActionRunning ? 'Executing...' : step.actionLabel}</span>
              </button>
            )}

            <div className="flex items-center justify-between sm:justify-end gap-2 w-full">
              <button
                onClick={handlePrev}
                disabled={isFirst}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNext}
                disabled={isLast}
                className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>Next Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-between gap-1 pt-1">
          {DEMO_STEPS.map((s, idx) => {
            const isDone = idx < currentStepIndex
            const isCurrent = idx === currentStepIndex
            return (
              <button
                key={s.stepNumber}
                onClick={() => {
                  setCurrentStepIndex(idx)
                  onStepChange(idx + 1)
                }}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 shadow-sm shadow-indigo-600/50'
                    : isDone
                    ? 'bg-indigo-300 dark:bg-indigo-900'
                    : 'bg-slate-200 dark:bg-gray-800'
                }`}
                title={`Step ${s.stepNumber}: ${s.title}`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
