'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  Sparkles,
  Check,
  Clock,
  Flame,
  Loader2,
  Activity,
  Wand2,
  ShieldCheck,
  RotateCw,
  HelpCircle,
  Layers,
  Target,
  FileText,
  User,
  Calendar,
  AlertTriangle,
  Bot,
  Zap,
} from 'lucide-react'
import { Review } from '@/types/database.types'
import { SupportedTone } from '@/lib/ai/types'

const SUPPORTED_TONES: Array<{ id: SupportedTone; label: string; description: string }> = [
  { id: 'professional', label: 'Professional', description: 'Polite, structured, objective resolution' },
  { id: 'friendly', label: 'Friendly', description: 'Warm, personable, conversational' },
  { id: 'empathetic', label: 'Empathetic', description: 'Deep understanding, compassionate care' },
  { id: 'apologetic', label: 'Apologetic', description: 'Humble acknowledgment of failure' },
  { id: 'grateful', label: 'Grateful', description: 'Enthusiastic appreciation of positive feedback' },
]

interface ReviewModalProps {
  review: Review | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (
    reviewId: string,
    status: 'pending' | 'approved' | 'sent',
    updatedAiResponse?: string
  ) => Promise<void>
  onGenerateAIResponse: (
    reviewId: string,
    tone: SupportedTone,
    userNotes?: string
  ) => Promise<string>
  onAnalyzeReview: (reviewId: string) => Promise<void>
}

/**
 * Generate a concise, intelligent explanation of why this priority was assigned
 * Derived purely from existing analysis fields without making extra LLM calls
 */
function derivePriorityExplanation(review: Review): { title: string; explanation: string; riskLevel: string } {
  const analysis = review.analysis
  const priority = (analysis?.priority || 'low').toLowerCase()
  const urgencyScore = analysis?.urgency_score ?? (priority === 'critical' ? 9 : priority === 'high' ? 7 : priority === 'medium' ? 5 : 2)
  const primaryIssue = analysis?.primary_issue || analysis?.issue || 'General Experience'
  const emotion = analysis?.emotion || 'concerned'
  const intent = analysis?.intent || 'feedback'
  const urgencyReason = analysis?.urgency_reason

  if (priority === 'critical' || priority === 'p1') {
    return {
      title: 'High Operational Severity & Brand Risk',
      explanation:
        urgencyReason ||
        `Marked CRITICAL due to an acute urgency score (${urgencyScore}/10) regarding ${primaryIssue}. Customer exhibits strong ${emotion} emotion with a ${intent} intent, representing significant churn and public reputation risk that requires immediate manager attention.`,
      riskLevel: 'Critical Attention Required',
    }
  }

  if (priority === 'high' || priority === 'p2') {
    return {
      title: 'Actionable Friction Point',
      explanation:
        urgencyReason ||
        `Assigned HIGH priority due to an elevated urgency score (${urgencyScore}/10) concerning ${primaryIssue}. Customer is ${emotion} and requires prompt follow-up to resolve service dissatisfaction.`,
      riskLevel: 'Elevated Urgency',
    }
  }

  if (priority === 'medium') {
    return {
      title: 'Standard Service Inquiry / Operational Feedback',
      explanation:
        urgencyReason ||
        `Assigned MEDIUM priority (Urgency Score: ${urgencyScore}/10). Mentions ${primaryIssue} with ${emotion} tone. Recommended for regular operational review and standard response timeline.`,
      riskLevel: 'Moderate Attention',
    }
  }

  return {
    title: 'Positive Praise / Low Operational Risk',
    explanation:
      urgencyReason ||
      `Assigned LOW priority (Urgency Score: ${urgencyScore}/10). Customer expressed ${analysis?.sentiment || 'positive'} sentiment (${intent}). Standard brand acknowledgment recommended.`,
    riskLevel: 'Low Risk / Brand Advocacy',
  }
}

export function ReviewModal({
  review,
  isOpen,
  onClose,
  onUpdateStatus,
  onGenerateAIResponse,
  onAnalyzeReview,
}: ReviewModalProps) {
  const [editedResponse, setEditedResponse] = useState('')
  const [quickNotes, setQuickNotes] = useState('')
  const [selectedTone, setSelectedTone] = useState<SupportedTone>('professional')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExpandingText, setIsExpandingText] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (review) {
      setEditedResponse(review.ai_response || '')
      setQuickNotes('')
      const initialTone: SupportedTone =
        review.rating <= 2
          ? 'empathetic'
          : review.rating >= 4
          ? 'grateful'
          : 'professional'
      setSelectedTone(initialTone)
    }
  }, [review])

  const wordCount = useMemo(() => {
    if (!editedResponse.trim()) return 0
    return editedResponse.trim().split(/\s+/).length
  }, [editedResponse])

  const priorityReasoning = useMemo(() => {
    if (!review) return null
    return derivePriorityExplanation(review)
  }, [review])

  const quickPrompts = useMemo(() => {
    if (!review) return []
    if (review.rating <= 2) {
      return [
        { label: 'Apologize & 20% discount', text: 'Apologize for the inconvenience and offer 20% off their next order' },
        { label: 'Peak rush explanation', text: 'Explain kitchen peak rush delays and prioritize packaging improvements' },
        { label: 'Direct manager escalation', text: 'Offer direct contact with our general manager to review their order details' },
        { label: 'Free remake voucher', text: 'Issue a complimentary replacement meal voucher on us' },
      ]
    } else if (review.rating === 3) {
      return [
        { label: 'Thank & address delay', text: 'Thank them for constructive feedback and commit to improving speed' },
        { label: 'Invite back for new recipe', text: 'Invite them back to try our newly refined recipe' },
        { label: '10% loyalty perk', text: 'Offer 10% loyalty bonus on their next visit' },
      ]
    } else {
      return [
        { label: 'Warm thanks & invite back', text: 'Thank them warmly and invite them back to try our chef specials' },
        { label: 'Loyalty bonus points', text: 'Offer VIP loyalty bonus points for being an amazing customer' },
        { label: 'Compliment the kitchen team', text: 'Let them know their praise was shared with our head chef and kitchen staff' },
      ]
    }
  }, [review])

  if (!isOpen || !review) return null

  const isCritical =
    review.analysis?.priority === 'critical' || review.analysis?.priority === 'P1'
  const isHigh =
    review.analysis?.priority === 'high' || review.analysis?.priority === 'P2'

  const handleAction = async (status: 'pending' | 'approved' | 'sent') => {
    setIsSubmitting(true)
    try {
      await onUpdateStatus(review.id, status, editedResponse)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerate = async (customNotes?: string) => {
    setIsGenerating(true)
    try {
      const notesToSend = customNotes !== undefined ? customNotes : quickNotes
      const generated = await onGenerateAIResponse(review.id, selectedTone, notesToSend)
      setEditedResponse(generated)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExpandCurrentText = async () => {
    if (!editedResponse.trim()) return
    setIsExpandingText(true)
    try {
      const generated = await onGenerateAIResponse(review.id, selectedTone, editedResponse.trim())
      setEditedResponse(generated)
    } finally {
      setIsExpandingText(false)
    }
  }

  const handleReanalyze = async () => {
    setIsAnalyzing(true)
    try {
      await onAnalyzeReview(review.id)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const priorityBadgeColor = isCritical
    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    : isHigh
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'

  const sentimentBadgeColor =
    review.analysis?.sentiment === 'positive'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : review.analysis?.sentiment === 'negative'
      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
      : 'bg-gray-500/15 text-gray-300 border-gray-500/30'

  const platformBadge =
    review.platform === 'google'
      ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      : review.platform === 'yelp'
      ? 'text-red-400 bg-red-500/10 border-red-500/20'
      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#06080e] border border-white/5 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0b0f19]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Review Details & Intelligence</h3>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${platformBadge}`}>
                  {review.platform}
                </span>
                {isCritical && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    <Flame className="w-3 h-3 text-rose-400" /> CRITICAL
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">Deep root-cause diagnostics, priority reasoning, and editable AI reply</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* SECTION 1: CUSTOMER & REVIEW INFO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Customer Name */}
            <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/5 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gray-900/50 border border-white/5 text-gray-400">
                <User className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider block">Customer</span>
                <span className="text-xs font-bold text-white">{review.customer_name}</span>
              </div>
            </div>

            {/* Star Rating */}
            <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/5 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gray-900/50 border border-white/5 text-amber-400">
                <span className="font-bold text-xs">★</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider block">Rating</span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  {'★'.repeat(review.rating)}
                  <span className="text-gray-600">{'★'.repeat(5 - review.rating)}</span>
                  <span className="ml-1 text-gray-400 font-normal">({review.rating}/5)</span>
                </div>
              </div>
            </div>

            {/* Date & Platform */}
            <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/5 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gray-900/50 border border-white/5 text-gray-400">
                <Calendar className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider block">Date & Platform</span>
                <span className="text-xs font-bold text-white capitalize">
                  {new Date(review.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  • {review.platform}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: ORIGINAL REVIEW */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" /> Original Review
              </span>
              <span className="text-[11px] text-gray-500">Unmodified Customer Feedback</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/5 text-sm text-gray-200 leading-relaxed font-normal italic">
              &ldquo;{review.review_text}&rdquo;
            </div>
          </div>

          {/* SECTION 3: AI ANALYSIS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" /> AI Deep Analysis
              </span>
              <button
                onClick={handleReanalyze}
                disabled={isAnalyzing}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                Re-Analyze with Gemini
              </button>
            </div>

            {review.analysis ? (
              <div className="space-y-3">
                {/* 4-Box Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/5">
                    <span className="text-[10px] text-gray-500 block uppercase font-semibold tracking-wider">Sentiment</span>
                    <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-md border capitalize ${sentimentBadgeColor}`}>
                      {review.analysis.sentiment} {review.analysis.sentiment_score !== undefined && `(${review.analysis.sentiment_score > 0 ? '+' : ''}${review.analysis.sentiment_score.toFixed(2)})`}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/5">
                    <span className="text-[10px] text-gray-500 block uppercase font-semibold tracking-wider">Emotion</span>
                    <span className="inline-block mt-1 text-xs font-bold text-purple-300 capitalize">
                      {review.analysis.emotion || 'N/A'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/5">
                    <span className="text-[10px] text-gray-500 block uppercase font-semibold tracking-wider">Urgency Score</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-amber-300">
                        {review.analysis.urgency_score !== undefined ? `${review.analysis.urgency_score}/10` : review.analysis.urgency || 'Low'}
                      </span>
                      {review.analysis.urgency_score !== undefined && (
                        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              review.analysis.urgency_score >= 8
                                ? 'bg-rose-500'
                                : review.analysis.urgency_score >= 5
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${review.analysis.urgency_score * 10}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/5">
                    <span className="text-[10px] text-gray-500 block uppercase font-semibold tracking-wider">Priority</span>
                    <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-md border uppercase ${priorityBadgeColor}`}>
                      {review.analysis.priority}
                    </span>
                  </div>
                </div>

                {/* Primary Issue, Sub Issues, Intent & Action Table */}
                <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/5 space-y-2.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-white/5">
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold block">Primary Issue</span>
                      <span className="text-white font-bold text-xs capitalize mt-0.5 block">
                        {review.analysis.primary_issue || review.analysis.issue || 'None'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold block">Customer Intent</span>
                      <span className="text-indigo-300 font-semibold text-xs capitalize mt-0.5 block">
                        {review.analysis.intent || 'General Feedback'}
                      </span>
                    </div>
                  </div>

                  {/* Sub Issues */}
                  {review.analysis.sub_issues && review.analysis.sub_issues.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-gray-500 text-[10px] uppercase font-semibold block flex items-center gap-1">
                        <Layers className="w-3 h-3 text-indigo-400" /> Identified Sub-Issues
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {review.analysis.sub_issues.map((sub, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-lg bg-gray-900/50 border border-white/5 text-[11px] text-gray-300 font-medium"
                          >
                            • {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business Impact & Suggested Action */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {review.analysis.estimated_business_impact && (
                      <div>
                        <span className="text-gray-500 text-[10px] uppercase font-semibold block">Estimated Business Impact</span>
                        <p className="text-gray-300 text-[11px] mt-0.5">
                          {review.analysis.estimated_business_impact}
                        </p>
                      </div>
                    )}

                    {review.analysis.suggested_action && (
                      <div>
                        <span className="text-gray-500 text-[10px] uppercase font-semibold block flex items-center gap-1">
                          <Target className="w-3 h-3 text-indigo-400" /> Recommended Action
                        </span>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-indigo-900/20 border border-indigo-500/20 text-indigo-300 font-bold uppercase text-[10px]">
                          {review.analysis.suggested_action}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 text-center rounded-2xl bg-gray-950/60 border border-gray-800">
                <p className="text-xs text-gray-400">Analysis pending. Click &apos;Re-Analyze with Gemini&apos; to process.</p>
              </div>
            )}
          </div>

          {/* SECTION 4: WHY THIS PRIORITY? (Derived instantly from existing analysis) */}
          {priorityReasoning && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isCritical
                  ? 'bg-rose-950/10 border-rose-500/20 shadow-sm shadow-rose-950/30'
                  : isHigh
                  ? 'bg-amber-950/10 border-amber-500/20'
                  : 'bg-[#0b0f19] border-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {isCritical ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                )}
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Why This Priority? — <span className="text-indigo-300">{priorityReasoning.title}</span>
                </h4>
                <span
                  className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : isHigh
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {priorityReasoning.riskLevel}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6 font-normal">
                {priorityReasoning.explanation}
              </p>
            </div>
          )}

          {/* SECTION 5: AI RESPONSE STUDIO */}
          <div className="space-y-4 border-t border-white/5 pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> AI Response Studio
                </label>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Generate, customize with quick notes, and approve personalized responses.
                </p>
              </div>

              {/* Response Status */}
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border capitalize self-start sm:self-auto ${
                  review.response_status === 'sent'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : review.response_status === 'approved'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                Status: {review.response_status}
              </span>
            </div>

            {/* Generative AI Smart Assistant Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-[#0b0f19] to-purple-950/30 border border-indigo-500/25 shadow-lg shadow-indigo-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Bot className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      Generative AI Assistant <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold uppercase">Smart Compose</span>
                    </span>
                    <p className="text-[11px] text-gray-400">
                      Type rough keywords or pick a key point below — AI will analyze the review &amp; compose a full customer message.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick suggestion chips */}
              {quickPrompts.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Quick Key Points:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {quickPrompts.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setQuickNotes(chip.text)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          quickNotes === chip.text
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                            : 'bg-[#06080e]/80 border-white/5 text-gray-300 hover:border-indigo-500/40 hover:text-white'
                        }`}
                        title={chip.text}
                      >
                        + {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input for custom words / notes */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={quickNotes}
                    onChange={(e) => setQuickNotes(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleGenerate()
                      }
                    }}
                    placeholder="Type rough words (e.g., 'sorry about cold burger, offered 20% refund, contact manager')..."
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#06080e] border border-indigo-500/30 focus:border-indigo-400 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                  />
                  {quickNotes && (
                    <button
                      type="button"
                      onClick={() => setQuickNotes('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 shrink-0"
                >
                  {isGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{quickNotes.trim() ? 'Generate from Notes' : 'AI Generate'}</span>
                </button>
              </div>
            </div>

            {/* Tone Selector Toolbar */}
            <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/5 space-y-3">
              <div className="space-y-1.5">
                <span className="text-[11px] text-gray-400 font-semibold block uppercase tracking-wider">
                  Select Brand Tone:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {SUPPORTED_TONES.map((t) => {
                    const isSelected = selectedTone === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTone(t.id)}
                        className={`p-2 rounded-xl text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500'
                            : 'bg-[#06080e] border border-white/5 text-gray-400 hover:text-gray-200 hover:border-white/10'
                        }`}
                        title={t.description}
                      >
                        <span className="block text-xs font-semibold">{t.label}</span>
                        <span className="block text-[10px] opacity-75 truncate">{t.description}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>50-100 words concise • Non-liability &amp; customer support escalation active</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900/80 border border-white/10 hover:bg-gray-800 text-xs font-semibold text-indigo-300 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : editedResponse ? (
                    <RotateCw className="w-3.5 h-3.5" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  <span>{editedResponse ? 'Regenerate Draft' : 'Generate Full Draft'}</span>
                </button>
              </div>
            </div>

            {/* Editable Response Text Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span className="font-medium">Response Text (Editable):</span>
                <div className="flex items-center gap-2">
                  {editedResponse.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={handleExpandCurrentText}
                      disabled={isExpandingText || isGenerating}
                      className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
                      title="Turn whatever words are typed below into a full polished reply"
                    >
                      {isExpandingText ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Wand2 className="w-3 h-3 text-indigo-400" />
                      )}
                      <span>Polish &amp; Expand My Words</span>
                    </button>
                  )}
                  <span className={wordCount >= 50 && wordCount <= 100 ? 'text-emerald-400 font-semibold' : 'text-gray-400'}>
                    {wordCount} words {wordCount >= 50 && wordCount <= 100 ? '(Optimal: 50-100)' : ''}
                  </span>
                </div>
              </div>
              <textarea
                rows={5}
                value={editedResponse}
                onChange={(e) => setEditedResponse(e.target.value)}
                placeholder="AI generated response text will appear here. You can type rough words and click 'Polish &amp; Expand My Words', or edit the response before approving..."
                className="w-full p-3.5 bg-[#0b0f19] border border-white/5 rounded-2xl text-xs text-gray-200 leading-relaxed placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-[#0b0f19]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {review.response_status !== 'pending' && (
              <button
                disabled={isSubmitting}
                onClick={() => handleAction('pending')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-300 transition-colors disabled:opacity-50"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Mark as Pending</span>
              </button>
            )}

            <button
              disabled={isGenerating}
              onClick={() => handleGenerate()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-indigo-300 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCw className="w-3.5 h-3.5" />
              )}
              <span>Regenerate</span>
            </button>

            <button
              disabled={isSubmitting || !editedResponse.trim()}
              onClick={() => handleAction('approved')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors shadow-lg shadow-emerald-600/25 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve Response</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
