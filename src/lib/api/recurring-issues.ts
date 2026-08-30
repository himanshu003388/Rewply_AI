import { Review } from '@/types/database.types'
import { getReviews } from './reviews'
import { createClient } from '@/lib/supabase/client'

export interface RecurringIssueDetail {
  id: string
  issue_type: string
  category: string
  mention_count: number
  percentage_of_negative_reviews: number
  average_rating: number
  average_urgency: number
  severity_score: number
  severity_level: 'Critical' | 'High' | 'Medium' | 'Low'
  trend_direction: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data'
  trend_change_percentage: number | null
  sub_issues_breakdown: Array<{ name: string; count: number }>
  example_reviews: Array<{
    id: string
    customer_name: string
    platform: string
    rating: number
    review_text: string
    created_at: string
    priority?: string
    urgency_score?: number
    ai_response?: string | null
  }>
}

const CATEGORY_MAPPINGS: Record<string, { label: string; category: string }> = {
  delivery: { label: 'Delivery & Logistics Delays', category: 'Delivery' },
  food_quality: { label: 'Food Quality & Preparation', category: 'Food Quality' },
  billing: { label: 'Billing, Promo & Payment Issues', category: 'Billing' },
  app_technical: { label: 'App, Checkout & GPS Glitches', category: 'App/Technical' },
  packaging: { label: 'Packaging & Damaged Orders', category: 'Packaging' },
  customer_service: { label: 'Customer Support & Courier Attitude', category: 'Customer Service' },
  order_accuracy: { label: 'Missing & Incorrect Order Items', category: 'Order Accuracy' },
  pricing: { label: 'Pricing & Fee Transparency', category: 'Pricing' },
  other: { label: 'General Operational Feedback', category: 'General' },
}

/**
 * Categorize a review into a primary issue key based on structured analysis
 */
function resolveIssueKey(review: Review): string {
  if (review.analysis?.primary_issue && CATEGORY_MAPPINGS[review.analysis.primary_issue]) {
    return review.analysis.primary_issue
  }

  const text = (review.review_text + ' ' + (review.analysis?.issue || '')).toLowerCase()

  if (text.includes('deliver') || text.includes('late') || text.includes('courier') || text.includes('driver') || text.includes('cold food') || text.includes('door')) {
    return 'delivery'
  }
  if (text.includes('meat') || text.includes('patty') || text.includes('undercook') || text.includes('bun') || text.includes('soggy') || text.includes('taste') || text.includes('stale') || text.includes('flavor')) {
    return 'food_quality'
  }
  if (text.includes('charge') || text.includes('bill') || text.includes('refund') || text.includes('promo') || text.includes('coupon') || text.includes('discount') || text.includes('fee')) {
    return 'billing'
  }
  if (text.includes('app') || text.includes('crash') || text.includes('otp') || text.includes('login') || text.includes('gps') || text.includes('tracking')) {
    return 'app_technical'
  }
  if (text.includes('packag') || text.includes('spill') || text.includes('crush') || text.includes('mess')) {
    return 'packaging'
  }
  if (text.includes('rude') || text.includes('shout') || text.includes('attitude') || text.includes('support')) {
    return 'customer_service'
  }
  if (text.includes('miss') || text.includes('forgot') || text.includes('wrong item')) {
    return 'order_accuracy'
  }

  return 'other'
}

/**
 * Calculate recurring issues intelligence across all analyzed reviews
 */
export async function calculateRecurringIssues(): Promise<{
  issues: RecurringIssueDetail[]
  totalAnalyzed: number
  negativeReviewsCount: number
  timeWindowDays: number
}> {
  const { data: allReviews } = await getReviews()

  const negativeReviews = allReviews.filter(
    (r) => r.analysis?.sentiment === 'negative' || r.rating <= 2
  )
  const totalNegativeCount = Math.max(negativeReviews.length, 1)

  // 1. Determine time periods for trend calculation
  const timestamps = allReviews.map((r) => new Date(r.created_at).getTime()).filter((t) => !isNaN(t))
  const minTime = Math.min(...timestamps)
  const maxTime = Math.max(...timestamps)
  const timeSpanMs = maxTime - minTime
  const timeWindowDays = Math.max(1, Math.round(timeSpanMs / (1000 * 60 * 60 * 24)))

  const hasSufficientTrendData = allReviews.length >= 6 && timeSpanMs >= 1000 * 60 * 60 * 24 * 3
  const midPointTime = minTime + timeSpanMs / 2

  // 2. Group reviews into issue clusters
  const clusters: Record<
    string,
    {
      reviews: Review[]
      recentReviews: Review[]
      previousReviews: Review[]
      subIssuesCount: Record<string, number>
    }
  > = {}

  for (const review of allReviews) {
    // Only cluster reviews that indicate an issue or negative/neutral experience
    if (review.rating > 4 && review.analysis?.sentiment === 'positive') {
      continue
    }

    const key = resolveIssueKey(review)
    if (!clusters[key]) {
      clusters[key] = {
        reviews: [],
        recentReviews: [],
        previousReviews: [],
        subIssuesCount: {},
      }
    }

    clusters[key].reviews.push(review)

    const reviewTime = new Date(review.created_at).getTime()
    if (reviewTime >= midPointTime) {
      clusters[key].recentReviews.push(review)
    } else {
      clusters[key].previousReviews.push(review)
    }

    // Tally sub-issues
    if (review.analysis?.sub_issues && Array.isArray(review.analysis.sub_issues)) {
      for (const sub of review.analysis.sub_issues) {
        const cleanSub = sub.trim()
        if (cleanSub) {
          clusters[key].subIssuesCount[cleanSub] = (clusters[key].subIssuesCount[cleanSub] || 0) + 1
        }
      }
    } else if (review.analysis?.issue) {
      const cleanSub = review.analysis.issue.trim()
      clusters[key].subIssuesCount[cleanSub] = (clusters[key].subIssuesCount[cleanSub] || 0) + 1
    }
  }

  // 3. Compute metrics for each cluster
  const issueDetails: RecurringIssueDetail[] = []

  for (const [key, cluster] of Object.entries(clusters)) {
    if (cluster.reviews.length === 0) continue

    const config = CATEGORY_MAPPINGS[key] || { label: key, category: 'General' }
    const mentionCount = cluster.reviews.length
    const negativeInCluster = cluster.reviews.filter((r) => r.rating <= 2 || r.analysis?.sentiment === 'negative').length
    const percentageOfNegative = Math.round((negativeInCluster / totalNegativeCount) * 100)

    const avgRating = Number(
      (cluster.reviews.reduce((acc, r) => acc + r.rating, 0) / mentionCount).toFixed(1)
    )

    const avgUrgency = Number(
      (
        cluster.reviews.reduce((acc, r) => {
          const u =
            r.analysis?.urgency_score ??
            (r.analysis?.urgency === 'high' ? 8 : r.analysis?.urgency === 'medium' ? 5 : 2)
          return acc + u
        }, 0) / mentionCount
      ).toFixed(1)
    )

    // Calculate Severity Score (1 - 10)
    // Weighted formula:
    // - Urgency contribution: (avgUrgency / 10) * 4.0
    // - Frequency contribution: Math.min((mentionCount / 15) * 3.0, 3.0)
    // - Low rating penalty: ((5 - avgRating) / 4) * 2.0
    // - Critical priority boost: 1.0 if has any critical/P1 review
    const hasCritical = cluster.reviews.some((r) => r.analysis?.priority === 'critical' || r.analysis?.priority === 'P1')
    const rawSeverity =
      (avgUrgency / 10) * 4.0 +
      Math.min(mentionCount / 12, 1.0) * 3.0 +
      ((5 - avgRating) / 4.0) * 2.0 +
      (hasCritical ? 1.0 : 0.0)

    const severityScore = Math.max(1, Math.min(10, Math.round(rawSeverity)))

    const severityLevel: 'Critical' | 'High' | 'Medium' | 'Low' =
      severityScore >= 8 ? 'Critical' : severityScore >= 6 ? 'High' : severityScore >= 4 ? 'Medium' : 'Low'

    // Calculate Trend
    let trendDirection: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data' = 'insufficient_data'
    let trendChangePercentage: number | null = null

    if (hasSufficientTrendData) {
      const recentCount = cluster.recentReviews.length
      const prevCount = cluster.previousReviews.length

      if (prevCount === 0 && recentCount > 0) {
        trendChangePercentage = 100
        trendDirection = 'increasing'
      } else if (prevCount > 0) {
        trendChangePercentage = Math.round(((recentCount - prevCount) / prevCount) * 100)
        trendDirection =
          trendChangePercentage > 8 ? 'increasing' : trendChangePercentage < -8 ? 'decreasing' : 'stable'
      } else {
        trendDirection = 'stable'
        trendChangePercentage = 0
      }
    }

    // Top sub-issues breakdown
    const subIssuesBreakdown = Object.entries(cluster.subIssuesCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Representative example reviews (sorted by urgency descending)
    const exampleReviews = [...cluster.reviews]
      .sort((a, b) => {
        const uA = a.analysis?.urgency_score ?? (a.rating === 1 ? 9 : 3)
        const uB = b.analysis?.urgency_score ?? (b.rating === 1 ? 9 : 3)
        return uB - uA
      })
      .slice(0, 6)
      .map((r) => ({
        id: r.id,
        customer_name: r.customer_name,
        platform: r.platform,
        rating: r.rating,
        review_text: r.review_text,
        created_at: r.created_at,
        priority: r.analysis?.priority,
        urgency_score: r.analysis?.urgency_score,
        ai_response: r.ai_response,
      }))

    issueDetails.push({
      id: `issue-${key}`,
      issue_type: config.label,
      category: config.category,
      mention_count: mentionCount,
      percentage_of_negative_reviews: percentageOfNegative,
      average_rating: avgRating,
      average_urgency: avgUrgency,
      severity_score: severityScore,
      severity_level: severityLevel,
      trend_direction: trendDirection,
      trend_change_percentage: trendChangePercentage,
      sub_issues_breakdown: subIssuesBreakdown,
      example_reviews: exampleReviews,
    })
  }

  // Sort by severity score descending, then mention count
  issueDetails.sort((a, b) => {
    if (b.severity_score !== a.severity_score) {
      return b.severity_score - a.severity_score
    }
    return b.mention_count - a.mention_count
  })

  // 4. Update the issues table in Supabase / Local storage
  await syncIssuesToDatabase(issueDetails)

  return {
    issues: issueDetails,
    totalAnalyzed: allReviews.length,
    negativeReviewsCount: negativeReviews.length,
    timeWindowDays,
  }
}

/**
 * Synchronize calculated recurring issues to the issues table
 */
async function syncIssuesToDatabase(issueDetails: RecurringIssueDetail[]): Promise<void> {
  const supabase = createClient()
  if (supabase) {
    try {
      for (const issue of issueDetails.slice(0, 8)) {
        const trend =
          issue.trend_direction === 'increasing'
            ? 'up'
            : issue.trend_direction === 'decreasing'
            ? 'down'
            : 'stable'

        await supabase.from('issues').upsert({
          issue_type: issue.issue_type,
          category: issue.category,
          mention_count: issue.mention_count,
          trend_direction: trend,
          severity_score: issue.severity_score,
          created_at: new Date().toISOString(),
        } as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    } catch (err) {
      console.warn('Failed to upsert issues in Supabase:', err)
    }
  }
}
