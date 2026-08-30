import { Review, BusinessMetric } from '@/types/database.types'
import { getReviews } from '@/lib/api/reviews'
import { createClient } from '@/lib/supabase/client'

/**
 * Configurable weights for the Reputation Health Score calculation.
 * All weights must sum to 1.0.
 */
export const HEALTH_SCORE_WEIGHTS = {
  sentiment: 0.25,        // 25% weight: Sentiment distribution
  ratings: 0.25,          // 25% weight: Star rating average
  responsiveness: 0.20,   // 20% weight: Response rate across reviews
  issue_management: 0.15, // 15% weight: Critical issue burden & resolution
  trend: 0.15,            // 15% weight: Period velocity & momentum
} as const

export const MIN_REVIEWS_FOR_SUFFICIENT_DATA = 5

export interface ReputationHealthScoreResult {
  overall: number
  sentiment: number
  ratings: number
  responsiveness: number
  issue_management: number
  trend: number
  trend_direction: 'up' | 'down' | 'stable'
  is_sufficient_data: boolean
  total_reviews: number
  average_rating: number
  response_rate: number
  weights: typeof HEALTH_SCORE_WEIGHTS
  calculated_at: string
}

/**
 * Deterministically compute the Reputation Health Score from raw review records
 */
export function calculateReputationHealthScore(reviews: Review[]): ReputationHealthScoreResult {
  const totalReviews = reviews.length
  const calculatedAt = new Date().toISOString()

  // Insufficient Data Guard
  if (totalReviews < MIN_REVIEWS_FOR_SUFFICIENT_DATA) {
    return {
      overall: 0,
      sentiment: 0,
      ratings: 0,
      responsiveness: 0,
      issue_management: 0,
      trend: 0,
      trend_direction: 'stable',
      is_sufficient_data: false,
      total_reviews: totalReviews,
      average_rating: 0,
      response_rate: 0,
      weights: HEALTH_SCORE_WEIGHTS,
      calculated_at: calculatedAt,
    }
  }

  // 1. Sentiment Health (0 - 100)
  let sentimentPoints = 0
  let validSentimentCount = 0

  for (const r of reviews) {
    if (r.analysis?.sentiment_score !== undefined && !isNaN(r.analysis.sentiment_score)) {
      // Map [-1.0, +1.0] to [0, 100]
      sentimentPoints += ((r.analysis.sentiment_score + 1) / 2) * 100
      validSentimentCount++
    } else {
      const sentiment = r.analysis?.sentiment || (r.rating >= 4 ? 'positive' : r.rating <= 2 ? 'negative' : 'neutral')
      if (sentiment === 'positive') sentimentPoints += 100
      else if (sentiment === 'neutral') sentimentPoints += 50
      else if (sentiment === 'mixed') sentimentPoints += 45
      else sentimentPoints += 0
      validSentimentCount++
    }
  }

  const sentimentScore = Math.round(sentimentPoints / Math.max(validSentimentCount, 1))

  // 2. Star Ratings Health (0 - 100)
  const totalStars = reviews.reduce((acc, r) => acc + (r.rating || 0), 0)
  const averageRating = Number((totalStars / totalReviews).toFixed(2))
  // Map 1.0 - 5.0 stars to 0 - 100
  const ratingsScore = Math.round(Math.max(0, Math.min(100, ((averageRating - 1) / 4) * 100)))

  // 3. Responsiveness Rate (0 - 100)
  const respondedCount = reviews.filter(
    (r) => r.response_status === 'approved' || r.response_status === 'sent' || Boolean(r.ai_response && r.ai_response.trim().length > 0)
  ).length
  const responseRate = Math.round((respondedCount / totalReviews) * 100)
  const responsivenessScore = responseRate

  // 4. Critical Issue Burden & Management (0 - 100)
  let issuePenalty = 0
  for (const r of reviews) {
    const priority = (r.analysis?.priority || '').toLowerCase()
    const isHandled = r.response_status === 'approved' || r.response_status === 'sent'

    if (priority === 'critical' || priority === 'p1') {
      // Critical reviews carry a heavy 10-point penalty; reduced to 5 if handled
      issuePenalty += isHandled ? 5 : 10
    } else if (priority === 'high' || priority === 'p2') {
      // High reviews carry a 4-point penalty; reduced to 2 if handled
      issuePenalty += isHandled ? 2 : 4
    }
  }

  // Normalize penalty relative to review volume
  const normalizedPenalty = (issuePenalty / totalReviews) * 50
  const issueManagementScore = Math.round(Math.max(0, Math.min(100, 100 - normalizedPenalty)))

  // 5. Recent Trend & Velocity (0 - 100)
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  const midPoint = Math.floor(sortedReviews.length / 2)
  const olderBatch = sortedReviews.slice(0, midPoint)
  const recentBatch = sortedReviews.slice(midPoint)

  const avgOld = olderBatch.length > 0 ? olderBatch.reduce((acc, r) => acc + r.rating, 0) / olderBatch.length : averageRating
  const avgRecent = recentBatch.length > 0 ? recentBatch.reduce((acc, r) => acc + r.rating, 0) / recentBatch.length : averageRating
  const ratingDelta = avgRecent - avgOld

  let trendDirection: 'up' | 'down' | 'stable' = 'stable'
  let trendScore = 70

  if (ratingDelta >= 0.2) {
    trendDirection = 'up'
    trendScore = Math.min(100, Math.round(75 + ratingDelta * 40))
  } else if (ratingDelta <= -0.2) {
    trendDirection = 'down'
    trendScore = Math.max(15, Math.round(55 + ratingDelta * 40))
  } else {
    trendDirection = 'stable'
    trendScore = 70
  }

  // 6. Overall Weighted Sum
  const rawOverall =
    sentimentScore * HEALTH_SCORE_WEIGHTS.sentiment +
    ratingsScore * HEALTH_SCORE_WEIGHTS.ratings +
    responsivenessScore * HEALTH_SCORE_WEIGHTS.responsiveness +
    issueManagementScore * HEALTH_SCORE_WEIGHTS.issue_management +
    trendScore * HEALTH_SCORE_WEIGHTS.trend

  const overall = Math.round(Math.max(0, Math.min(100, rawOverall)))

  return {
    overall,
    sentiment: sentimentScore,
    ratings: ratingsScore,
    responsiveness: responsivenessScore,
    issue_management: issueManagementScore,
    trend: trendScore,
    trend_direction: trendDirection,
    is_sufficient_data: true,
    total_reviews: totalReviews,
    average_rating: averageRating,
    response_rate: responseRate,
    weights: HEALTH_SCORE_WEIGHTS,
    calculated_at: calculatedAt,
  }
}

/**
 * Fetch data, calculate reputation health score, and sync with business_metrics table
 */
export async function getAndSyncReputationHealthScore(): Promise<ReputationHealthScoreResult> {
  const { data: reviews } = await getReviews()
  const scoreResult = calculateReputationHealthScore(reviews)

  if (scoreResult.is_sufficient_data) {
    const supabase = createClient()
    if (supabase) {
      try {
        const positiveCount = reviews.filter((r) => r.analysis?.sentiment === 'positive' || r.rating >= 4).length
        const negativeCount = reviews.filter((r) => r.analysis?.sentiment === 'negative' || r.rating <= 2).length
        const neutralCount = reviews.length - positiveCount - negativeCount

        const metricPayload: Partial<BusinessMetric> = {
          reputation_score: scoreResult.overall,
          total_reviews: scoreResult.total_reviews,
          sentiment_breakdown: {
            positive: positiveCount,
            neutral: neutralCount,
            negative: negativeCount,
          },
          calculated_at: scoreResult.calculated_at,
        }

        await supabase.from('business_metrics').insert(metricPayload as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      } catch (err) {
        console.warn('Failed to persist health score in Supabase business_metrics:', err)
      }
    }
  }

  return scoreResult
}
