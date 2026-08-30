'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Header } from '@/components/Header'
import { MetricCards } from '@/components/MetricCards'
import { AnalyticsCharts } from '@/components/AnalyticsCharts'
import { ReviewInboxFilters, QuickFilter, SortOption } from '@/components/ReviewInboxFilters'
import { ReviewList } from '@/components/ReviewList'
import { ReviewModal } from '@/components/ReviewModal'
import { RecurringProblems } from '@/components/RecurringProblems'
import { AIInsightsSection } from '@/components/AIInsightsSection'
import { AIActionCenter } from '@/components/AIActionCenter'
import { AskYourReviews } from '@/components/AskYourReviews'
import { SimulateReviewButton } from '@/components/SimulateReviewButton'
import { DemoModeGuide } from '@/components/DemoModeGuide'
import { getReviews, getIssues, updateReviewStatus } from '@/lib/api/reviews'
import { Review } from '@/types/database.types'
import { SupportedTone, BusinessInsightsData } from '@/lib/ai/types'
import { ReputationHealthScoreResult } from '@/lib/metrics/health-score'
import { ActionStatus } from '@/lib/api/actions'
import { Sparkles, BarChart3, Inbox, Lightbulb, LayoutGrid, MessageSquare, Zap } from 'lucide-react'

export default function DashboardPage() {
  const queryClient = useQueryClient()

  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<'3-column' | 'inbox' | 'actions' | 'problems' | 'insights' | 'assistant'>('3-column')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDemoModeActive, setIsDemoModeActive] = useState(false)

  // Tracking in-flight actions per review ID
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({})
  const [generatingIds, setGeneratingIds] = useState<Record<string, boolean>>({})
  const [approvingIds, setApprovingIds] = useState<Record<string, boolean>>({})

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<QuickFilter>('all')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('highest_priority')

  // AI Business Insights State
  const [insightsData, setInsightsData] = useState<BusinessInsightsData | null>(null)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)

  // 1. Fetch all reviews from Supabase / Data layer
  const {
    data: reviewsResponse,
    isLoading: isReviewsLoading,
    isError: isReviewsError,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ['reviews_all'],
    queryFn: () => getReviews(),
  })

  // 2. Fetch deterministic reputation health score
  const { data: healthScoreData, isLoading: isHealthScoreLoading } = useQuery<ReputationHealthScoreResult>({
    queryKey: ['health_score'],
    queryFn: async () => {
      const res = await fetch('/api/metrics/health-score')
      const json = await res.json()
      return json as ReputationHealthScoreResult
    },
  })

  // 3. Fetch recurring problems intelligence
  const { data: recurringIssuesData, isLoading: isRecurringIssuesLoading } = useQuery({
    queryKey: ['recurring_issues'],
    queryFn: async () => {
      const res = await fetch('/api/insights/issues')
      const json = await res.json()
      return json.issues || []
    },
  })

  // 4. Fetch Prioritized AI Action Center Items
  const { data: actionsData, isLoading: isActionsLoading } = useQuery({
    queryKey: ['prioritized_actions'],
    queryFn: async () => {
      const res = await fetch('/api/actions')
      const json = await res.json()
      return json.actions || []
    },
  })

  // 5. Fetch raw issues
  const { data: issuesResponse } = useQuery({
    queryKey: ['issues'],
    queryFn: () => getIssues(),
  })

  // Callback when a new review is simulated
  const handleReviewSimulated = () => {
    queryClient.invalidateQueries({ queryKey: ['reviews_all'] })
    queryClient.invalidateQueries({ queryKey: ['health_score'] })
    queryClient.invalidateQueries({ queryKey: ['recurring_issues'] })
    queryClient.invalidateQueries({ queryKey: ['prioritized_actions'] })
    queryClient.invalidateQueries({ queryKey: ['metrics'] })
    handleGenerateInsights()
  }

  // Demo Mode Handlers
  const handleDemoStepChange = (stepNumber: number) => {
    if (stepNumber === 1) {
      setViewMode('3-column')
      setActiveFilter('all')
      setSortBy('highest_priority')
    } else if (stepNumber === 2) {
      setViewMode('inbox')
      setActiveFilter('all')
    } else if (stepNumber === 3) {
      setViewMode('inbox')
      if (allReviews.length > 0) {
        setSelectedReview(allReviews[0])
        setIsModalOpen(true)
      }
    } else if (stepNumber === 4) {
      setIsModalOpen(false)
      setViewMode('inbox')
      setActiveFilter('critical')
      setSortBy('highest_priority')
    } else if (stepNumber === 5) {
      const criticalReview = allReviews.find((r) => r.analysis?.priority === 'critical' || r.rating === 1)
      if (criticalReview) {
        setSelectedReview(criticalReview)
        setIsModalOpen(true)
      }
    } else if (stepNumber === 6) {
      setIsModalOpen(false)
      setViewMode('problems')
    } else if (stepNumber === 7) {
      setIsModalOpen(false)
      setViewMode('insights')
    } else if (stepNumber === 8) {
      setIsModalOpen(false)
      setViewMode('assistant')
    } else if (stepNumber === 9) {
      setIsModalOpen(false)
      setViewMode('actions')
    }
  }

  const handleSimulateDemoReview = async () => {
    const res = await fetch('/api/reviews/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'billing' }),
    })
    const json = await res.json()
    if (json.success && json.review) {
      handleReviewSimulated()
      setSelectedReview(json.review)
      setIsModalOpen(true)
    }
  }

  const handleResetDemoData = async () => {
    await fetch('/api/demo/reset', { method: 'POST' })
    queryClient.invalidateQueries({ queryKey: ['reviews_all'] })
    queryClient.invalidateQueries({ queryKey: ['health_score'] })
    queryClient.invalidateQueries({ queryKey: ['recurring_issues'] })
    queryClient.invalidateQueries({ queryKey: ['prioritized_actions'] })
    handleResetFilters()
    setIsModalOpen(false)
    setViewMode('3-column')
  }

  // Mutation: Update AI Action Status
  const updateActionStatusMutation = useMutation({
    mutationFn: async ({ actionId, status }: { actionId: string; status: ActionStatus }) => {
      const res = await fetch('/api/actions/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId, status }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prioritized_actions'] })
    },
  })

  const handleUpdateActionStatus = async (actionId: string, status: ActionStatus) => {
    await updateActionStatusMutation.mutateAsync({ actionId, status })
  }

  // Function to generate AI business insights
  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true)
    try {
      const res = await fetch('/api/insights/generate', { method: 'POST' })
      const json = await res.json()
      if (json.success && json.insights) {
        setInsightsData(json.insights)
      } else {
        console.warn('AI Insights generation returned fallback or warning:', json.error)
      }
    } catch (err) {
      console.error('Failed to fetch AI insights:', err)
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  // Pre-load insights on first render if empty
  useEffect(() => {
    if (!insightsData && reviewsResponse?.data && reviewsResponse.data.length > 0) {
      handleGenerateInsights()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewsResponse?.data?.length])

  // 6. Mutation: Analyze Review via Gemini Agent API
  const analyzeMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      setAnalyzingIds((prev) => ({ ...prev, [reviewId]: true }))
      const res = await fetch('/api/reviews/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to analyze review.')
      }
      return json
    },
    onSettled: (_, __, reviewId) => {
      setAnalyzingIds((prev) => ({ ...prev, [reviewId]: false }))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews_all'] })
      queryClient.invalidateQueries({ queryKey: ['health_score'] })
      queryClient.invalidateQueries({ queryKey: ['recurring_issues'] })
      queryClient.invalidateQueries({ queryKey: ['prioritized_actions'] })
    },
  })

  // 7. Mutation: Generate Review Response via POST /api/reviews/respond
  const generateResponseMutation = useMutation({
    mutationFn: async ({
      reviewId,
      tone,
      userNotes,
    }: {
      reviewId: string
      tone?: SupportedTone | string
      userNotes?: string
    }) => {
      setGeneratingIds((prev) => ({ ...prev, [reviewId]: true }))
      const res = await fetch('/api/reviews/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, tone, userNotes }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate response.')
      }
      return json
    },
    onSettled: (_, __, variables) => {
      setGeneratingIds((prev) => ({ ...prev, [variables.reviewId]: false }))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews_all'] })
      queryClient.invalidateQueries({ queryKey: ['health_score'] })
    },
  })

  // 8. Mutation: Update Review Response Status / Text
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      reviewId,
      status,
      updatedAiResponse,
    }: {
      reviewId: string
      status: 'pending' | 'approved' | 'sent'
      updatedAiResponse?: string
    }) => {
      setApprovingIds((prev) => ({ ...prev, [reviewId]: true }))
      return updateReviewStatus(reviewId, status, updatedAiResponse)
    },
    onSettled: (_, __, variables) => {
      setApprovingIds((prev) => ({ ...prev, [variables.reviewId]: false }))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews_all'] })
      queryClient.invalidateQueries({ queryKey: ['health_score'] })
    },
  })

  // Action Handlers
  const handleAnalyze = async (reviewId: string) => {
    try {
      await analyzeMutation.mutateAsync(reviewId)
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleGenerateResponseDirect = async (reviewId: string, tone?: string, userNotes?: string) => {
    try {
      const review = allReviews.find((r) => r.id === reviewId)
      const selectedTone: SupportedTone =
        (tone as SupportedTone) || (review && review.rating <= 2 ? 'empathetic' : 'friendly')
      await generateResponseMutation.mutateAsync({
        reviewId,
        tone: selectedTone,
        userNotes,
      })
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleGenerateAIResponseInModal = async (
    reviewId: string,
    tone: SupportedTone,
    userNotes?: string
  ): Promise<string> => {
    const res = await generateResponseMutation.mutateAsync({
      reviewId,
      tone,
      userNotes,
    })
    return res.aiResponse
  }

  const handleApprove1Click = async (reviewId: string) => {
    try {
      await updateStatusMutation.mutateAsync({ reviewId, status: 'approved' })
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleUpdateStatus = async (
    reviewId: string,
    status: 'pending' | 'approved' | 'sent',
    updatedAiResponse?: string
  ) => {
    await updateStatusMutation.mutateAsync({ reviewId, status, updatedAiResponse })
  }

  const handleOpenDetails = (review: Review) => {
    setSelectedReview(review)
    setIsModalOpen(true)
  }

  const handleOpenDetailsById = (reviewId: string) => {
    const rev = allReviews.find((r) => r.id === reviewId)
    if (rev) {
      setSelectedReview(rev)
      setIsModalOpen(true)
    }
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setActiveFilter('all')
    setSelectedPlatform('all')
    setSortBy('highest_priority')
  }

  const allReviews = useMemo(() => reviewsResponse?.data || [], [reviewsResponse?.data])
  const issues = useMemo(() => issuesResponse?.data || [], [issuesResponse?.data])
  const isUsingFallback = reviewsResponse?.isUsingFallback ?? true

  // Filter & Sort Logic
  const filteredAndSortedReviews = useMemo(() => {
    let result = [...allReviews]

    // Platform Filter
    if (selectedPlatform !== 'all') {
      result = result.filter((r) => r.platform.toLowerCase() === selectedPlatform.toLowerCase())
    }

    // Quick Filter
    if (activeFilter === 'critical') {
      result = result.filter(
        (r) => r.analysis?.priority === 'critical' || r.analysis?.priority === 'P1'
      )
    } else if (activeFilter === 'high') {
      result = result.filter(
        (r) => r.analysis?.priority === 'high' || r.analysis?.priority === 'P2'
      )
    } else if (activeFilter === 'medium') {
      result = result.filter((r) => r.analysis?.priority === 'medium')
    } else if (activeFilter === 'low') {
      result = result.filter(
        (r) => r.analysis?.priority === 'low' || r.analysis?.priority === 'P3'
      )
    } else if (activeFilter === 'negative') {
      result = result.filter((r) => r.analysis?.sentiment === 'negative')
    } else if (activeFilter === 'positive') {
      result = result.filter((r) => r.analysis?.sentiment === 'positive')
    } else if (activeFilter === 'unanswered') {
      result = result.filter((r) => r.response_status === 'pending')
    }

    // Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((r) => {
        const nameMatch = r.customer_name?.toLowerCase().includes(q)
        const textMatch = r.review_text?.toLowerCase().includes(q)
        const issueMatch =
          r.analysis?.issue?.toLowerCase().includes(q) ||
          r.analysis?.primary_issue?.toLowerCase().includes(q)
        const subIssuesMatch = r.analysis?.sub_issues?.some((s) => s.toLowerCase().includes(q))
        const keywordsMatch = r.analysis?.extracted_keywords?.some((k) => k.toLowerCase().includes(q))

        return nameMatch || textMatch || issueMatch || subIssuesMatch || keywordsMatch
      })
    }

    // Sorting
    if (sortBy === 'highest_priority') {
      const priorityWeight: Record<string, number> = {
        critical: 4,
        P1: 4,
        high: 3,
        P2: 3,
        medium: 2,
        low: 1,
        P3: 1,
      }
      result.sort((a, b) => {
        const weightA = a.analysis?.priority ? priorityWeight[a.analysis.priority] || 0 : 0
        const weightB = b.analysis?.priority ? priorityWeight[b.analysis.priority] || 0 : 0
        if (weightB !== weightA) return weightB - weightA
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    } else if (sortBy === 'most_recent') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === 'lowest_rating') {
      result.sort((a, b) => a.rating - b.rating)
    } else if (sortBy === 'highest_urgency') {
      result.sort((a, b) => {
        const urgA =
          a.analysis?.urgency_score ??
          (a.analysis?.urgency === 'high' ? 8 : a.analysis?.urgency === 'medium' ? 5 : 2)
        const urgB =
          b.analysis?.urgency_score ??
          (b.analysis?.urgency === 'high' ? 8 : b.analysis?.urgency === 'medium' ? 5 : 2)
        return urgB - urgA
      })
    }

    return result
  }, [allReviews, selectedPlatform, activeFilter, searchQuery, sortBy])

  // Synchronize active modal with refreshed review data
  const currentModalReview = useMemo(() => {
    if (!selectedReview) return null
    return allReviews.find((r) => r.id === selectedReview.id) || selectedReview
  }, [allReviews, selectedReview])

  return (
    <div className="min-h-screen transition-colors duration-200 bg-slate-50 dark:bg-[#06080e] text-slate-900 dark:text-gray-100 flex flex-col font-sans pb-28 selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200">
      {/* HEADER: Rewply AI, Business Context, Demo Mode Toggle & Simulate Review Button */}
      <Header
        isUsingFallback={isUsingFallback}
        isDemoModeActive={isDemoModeActive}
        onToggleDemoMode={() => setIsDemoModeActive(!isDemoModeActive)}
      >
        <SimulateReviewButton
          onReviewSimulated={handleReviewSimulated}
          onOpenDetails={handleOpenDetails}
        />
      </Header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 w-full">
        {/* Title Bar & Layout Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-gray-50 tracking-tight">
                Review Intelligence
              </h1>
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5" /> Google Gemini AI
              </span>
              {isDemoModeActive && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                  Demo Guide Active
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
              Automated review triage, recurring problems intelligence, and brand-aligned response drafts for{' '}
              <strong className="text-slate-800 dark:text-gray-200">BurgerHub Delivery</strong>.
            </p>
          </div>

          {/* View Mode Controls */}
          <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 self-start md:self-auto flex-wrap gap-1 shadow-sm">
            <button
              onClick={() => setViewMode('3-column')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                viewMode === '3-column'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800/50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Overview Grid</span>
            </button>
            <button
              onClick={() => setViewMode('inbox')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                viewMode === 'inbox'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800/50'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Inbox</span>
            </button>
            <button
              onClick={() => setViewMode('actions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                viewMode === 'actions'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Action Center</span>
            </button>
            <button
              onClick={() => setViewMode('problems')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                viewMode === 'problems'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Recurring Problems</span>
            </button>
            <button
              onClick={() => setViewMode('insights')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                viewMode === 'insights'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800/50'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>AI Insights</span>
            </button>
            <button
              onClick={() => setViewMode('assistant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                viewMode === 'assistant'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800/50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Reviews</span>
            </button>
          </div>
        </div>

        {/* TOP METRICS: Reputation Health, Total, Negative, Critical, Unanswered */}
        <section aria-label="Top Operational Metrics">
          <MetricCards
            reviews={allReviews}
            healthScore={healthScoreData}
            isLoading={isReviewsLoading || isHealthScoreLoading}
          />
        </section>

        {/* PROMINENT AI ACTION CENTER SECTION (Overview Mode & Dedicated Mode) */}
        {(viewMode === '3-column' || viewMode === 'actions') && (
          <section aria-label="AI Action Center" className="pt-2">
            <AIActionCenter
              actions={actionsData || []}
              onUpdateStatus={handleUpdateActionStatus}
              onSelectReview={handleOpenDetailsById}
              isLoading={isActionsLoading}
            />
          </section>
        )}

        {/* MAIN CONTENT AREA */}
        {viewMode === '3-column' ? (
          /* SaaS 3-Column Command Center Grid */
          <section className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: Review Inbox (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <Inbox className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Review Inbox</h3>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                    {filteredAndSortedReviews.length} of {allReviews.length}
                  </span>
                </div>

                <ReviewInboxFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  selectedPlatform={selectedPlatform}
                  onPlatformChange={setSelectedPlatform}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  reviews={allReviews}
                  onReset={handleResetFilters}
                />

                <ReviewList
                  reviews={filteredAndSortedReviews}
                  onOpenDetails={handleOpenDetails}
                  onAnalyze={handleAnalyze}
                  onGenerateResponse={handleGenerateResponseDirect}
                  onApproveResponse={handleApprove1Click}
                  analyzingIds={analyzingIds}
                  generatingIds={generatingIds}
                  approvingIds={approvingIds}
                  isLoading={isReviewsLoading}
                  isError={isReviewsError}
                  onRetry={() => refetchReviews()}
                />
              </div>

              {/* MIDDLE COLUMN: Recurring Problems (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Recurring Problems</h3>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                    {recurringIssuesData?.length || 0} Clusters
                  </span>
                </div>

                <RecurringProblems
                  issues={recurringIssuesData || []}
                  onSelectReview={handleOpenDetailsById}
                  isLoading={isRecurringIssuesLoading}
                />
              </div>

              {/* RIGHT COLUMN: AI Insights / Recommended Actions (3 cols) */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">AI Insights</h3>
                  </div>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Gemini 2.5</span>
                </div>

                <AIInsightsSection
                  insights={insightsData}
                  isLoading={isGeneratingInsights}
                  onGenerateInsights={handleGenerateInsights}
                />
              </div>
            </div>

            {/* Embedded "Ask Your Reviews" Interactive Assistant */}
            <div className="pt-2">
              <AskYourReviews />
            </div>
          </section>
        ) : viewMode === 'inbox' ? (
          <section className="space-y-6">
            <ReviewInboxFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              selectedPlatform={selectedPlatform}
              onPlatformChange={setSelectedPlatform}
              sortBy={sortBy}
              onSortChange={setSortBy}
              reviews={allReviews}
              onReset={handleResetFilters}
            />

            <ReviewList
              reviews={filteredAndSortedReviews}
              onOpenDetails={handleOpenDetails}
              onAnalyze={handleAnalyze}
              onGenerateResponse={handleGenerateResponseDirect}
              onApproveResponse={handleApprove1Click}
              analyzingIds={analyzingIds}
              generatingIds={generatingIds}
              approvingIds={approvingIds}
              isLoading={isReviewsLoading}
              isError={isReviewsError}
              onRetry={() => refetchReviews()}
            />
          </section>
        ) : viewMode === 'problems' ? (
          <section className="space-y-6">
            <RecurringProblems
              issues={recurringIssuesData || []}
              onSelectReview={handleOpenDetailsById}
              isLoading={isRecurringIssuesLoading}
            />
          </section>
        ) : viewMode === 'insights' ? (
          <section className="space-y-6">
            <AIInsightsSection
              insights={insightsData}
              isLoading={isGeneratingInsights}
              onGenerateInsights={handleGenerateInsights}
            />
          </section>
        ) : viewMode === 'actions' ? (
          <section className="space-y-6">
            <AIActionCenter
              actions={actionsData || []}
              onUpdateStatus={handleUpdateActionStatus}
              onSelectReview={handleOpenDetailsById}
              isLoading={isActionsLoading}
            />
          </section>
        ) : (
          <section className="space-y-6">
            <AskYourReviews />
          </section>
        )}

        {/* BELOW: Recharts Visualizations (Sentiment over time, Rating distribution, Issue distribution, Response performance) */}
        <section aria-label="Analytics & Chart Diagnostics" className="space-y-4 pt-4 border-t border-slate-200 dark:border-gray-800/80">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
              Operational Analytics &amp; Visualizations
            </h3>
            <span className="text-xs text-slate-500 dark:text-gray-500">Live Supabase Telemetry</span>
          </div>

          <AnalyticsCharts reviews={allReviews} issues={issues} />
        </section>
      </main>

      {/* Guided 3-Minute Demo Mode Stepper Bar */}
      <DemoModeGuide
        isActive={isDemoModeActive}
        onClose={() => setIsDemoModeActive(false)}
        onStepChange={handleDemoStepChange}
        onResetData={handleResetDemoData}
        onSimulateCriticalReview={handleSimulateDemoReview}
        onOpenFirstReview={() => {
          if (allReviews.length > 0) {
            setSelectedReview(allReviews[0])
            setIsModalOpen(true)
          }
        }}
        onAskQuestion={async () => {
          setViewMode('assistant')
        }}
        reviews={allReviews}
      />

      {/* Review Details & AI Response Studio Modal */}
      <ReviewModal
        review={currentModalReview}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedReview(null)
        }}
        onUpdateStatus={handleUpdateStatus}
        onGenerateAIResponse={handleGenerateAIResponseInModal}
        onAnalyzeReview={handleAnalyze}
      />
    </div>
  )
}
