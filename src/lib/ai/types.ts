import {
  SentimentType,
  EmotionType,
  PrimaryIssueType,
  IntentType,
  PriorityType,
  SuggestedActionType,
  ReviewAnalysis,
} from '@/types/database.types'

export type SupportedTone = 'professional' | 'friendly' | 'empathetic' | 'apologetic' | 'grateful'

export interface AnalyzeReviewParams {
  reviewText: string
  rating?: number
  customerName?: string
  platform?: string
}

export interface AnalyzeReviewResult {
  sentiment: SentimentType
  sentiment_score: number
  emotion: EmotionType | string
  primary_issue: PrimaryIssueType
  sub_issues: string[]
  intent: IntentType
  urgency_score: number
  urgency_reason: string
  priority: PriorityType
  extracted_keywords: string[]
  estimated_business_impact: string
  suggested_action: SuggestedActionType
  response_tone: string
  confidence_score?: number
  // Legacy / UI compatibility fields
  issue?: string
  urgency?: 'low' | 'medium' | 'high'
}

export interface GenerateResponseParams {
  reviewText: string
  rating: number
  customerName: string
  platform?: string
  businessName?: string
  industry?: string
  analysis?: Partial<ReviewAnalysis>
  sentiment?: string
  emotion?: string
  primaryIssue?: string
  urgency?: string | number
  suggestedAction?: string
  tone?: SupportedTone | string
  userNotes?: string
}

export interface GenerateResponseResult {
  response: string
  toneUsed: SupportedTone | string
  wordCount?: number
}

export interface RecurringIssueCluster {
  issue_type: string
  category: 'Delivery' | 'Food Quality' | 'Billing' | 'Packaging' | 'App/Technical' | 'Customer Service' | string
  mention_count: number
  severity_score: number
  trend_direction: 'up' | 'down' | 'stable'
  impact_summary: string
  recommended_action: string
}

export interface AnalyzeRecurringIssuesResult {
  issues: RecurringIssueCluster[]
  totalAnalyzed: number
  primaryRiskCategory: string
}

export interface RecommendedAction {
  priority: 'critical' | 'high' | 'medium' | 'low'
  action: string
  reason: string
  expected_impact: 'high' | 'medium' | 'low'
}

export interface BusinessInsightsData {
  headline: string
  summary: string
  top_problem: {
    issue: string
    reason: string
    severity: 'critical' | 'high' | 'medium' | 'low' | string
  }
  emerging_problem: {
    issue: string
    evidence: string
  }
  positive_trend: {
    topic: string
    evidence: string
  }
  business_risk?: {
    risk: string
    impact_level: 'high' | 'medium' | 'low' | string
  }
  recommended_actions: RecommendedAction[]
}

export interface GenerateBusinessInsightsParams {
  businessName?: string
  industry?: string
  totalReviews: number
  sentimentBreakdown: {
    positive: number
    neutral: number
    negative: number
    positivePercentage: number
    negativePercentage: number
  }
  issueBreakdown: Record<string, number>
  recurringIssues: Array<{
    issue_type: string
    category: string
    mention_count: number
    severity_score: number
    severity_level: string
    trend_direction: string
    trend_change_percentage: number | null
  }>
  trendChanges: Array<{
    issue: string
    trend: string
    changePercentage: number | null
  }>
  averageRating: number
  criticalReviewCount: number
  highPriorityReviewCount: number
}

export interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

export interface AssistantAnswer {
  concise_answer: string
  supporting_statistics: string[]
  relevant_evidence: string[]
  recommended_action: string
  referenced_issues?: string[]
}

export interface AskReviewsAssistantParams {
  question: string
  businessName?: string
  totalReviews: number
  averageRating: number
  sentimentDistribution: {
    positive: number
    neutral: number
    negative: number
    positivePercentage: number
    negativePercentage: number
  }
  issueDistribution: Record<string, number>
  recurringIssues: Array<{
    issue_type: string
    category: string
    mention_count: number
    severity_score: number
    severity_level: string
    trend_direction: string
    trend_change_percentage: number | null
  }>
  trendInformation: string[]
  criticalCount: number
  highPriorityCount: number
  representativeReviews: Array<{
    customer_name: string
    platform: string
    rating: number
    review_text: string
    created_at: string
    issue?: string
    priority?: string
  }>
}

export interface GenerateLinkedInPostParams {
  businessName?: string
  industry?: string
  style: 'customer_spotlight' | 'turnaround_story' | 'team_milestone' | 'thought_leadership'
  reviews: Array<{
    customer_name: string
    review_text: string
    rating: number
    platform?: string
  }>
  resolvedIssue?: string
  tone?: 'inspiring' | 'professional' | 'celebratory' | 'authentic'
  customNote?: string
}

export interface GenerateLinkedInPostResult {
  headline: string
  post: string
  hashtags: string[]
  keyTakeaway: string
  characterCount: number
}
