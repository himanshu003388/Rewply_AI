import { NextRequest, NextResponse } from 'next/server'
import { getReviews } from '@/lib/api/reviews'
import { calculateRecurringIssues } from '@/lib/api/recurring-issues'
import { askReviewsAssistant } from '@/lib/ai'
import { AskReviewsAssistantParams } from '@/lib/ai/types'

interface AssistantRequestBody {
  question?: string
}

export async function POST(req: NextRequest) {
  try {
    let body: AssistantRequestBody
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body in request.' },
        { status: 400 }
      )
    }

    const { question } = body || {}

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: "question" must be a non-empty string.' },
        { status: 400 }
      )
    }

    // 1. Fetch all reviews and recurring issues
    const { data: allReviews } = await getReviews()
    const { issues: recurringIssues } = await calculateRecurringIssues()

    const totalReviews = allReviews.length

    if (totalReviews === 0) {
      return NextResponse.json({
        success: true,
        answer: {
          concise_answer: 'There are currently no customer reviews stored in the database to analyze.',
          supporting_statistics: ['0 total reviews recorded'],
          relevant_evidence: ['Awaiting incoming review sync'],
          recommended_action: 'Connect your Google, Yelp, or Trustpilot accounts to begin collecting review intelligence.',
          referenced_issues: [],
        },
      })
    }

    // 2. Aggregate statistics
    let positiveCount = 0
    let neutralCount = 0
    let negativeCount = 0
    let criticalCount = 0
    let highCount = 0
    let totalRating = 0
    const issueDistribution: Record<string, number> = {}

    for (const r of allReviews) {
      totalRating += r.rating
      const sentiment = r.analysis?.sentiment || (r.rating >= 4 ? 'positive' : r.rating <= 2 ? 'negative' : 'neutral')
      if (sentiment === 'positive') positiveCount++
      else if (sentiment === 'negative') negativeCount++
      else neutralCount++

      const priority = r.analysis?.priority
      if (priority === 'critical' || priority === 'P1') criticalCount++
      else if (priority === 'high' || priority === 'P2') highCount++

      const issueKey = r.analysis?.primary_issue || r.analysis?.issue || 'other'
      issueDistribution[issueKey] = (issueDistribution[issueKey] || 0) + 1
    }

    const avgRating = totalRating / totalReviews
    const positivePercentage = Math.round((positiveCount / totalReviews) * 100)
    const negativePercentage = Math.round((negativeCount / totalReviews) * 100)

    const trendInformation = recurringIssues.map(
      (iss) =>
        `${iss.issue_type}: ${iss.mention_count} mentions, trend is ${iss.trend_direction} (${iss.trend_change_percentage !== null ? `${iss.trend_change_percentage > 0 ? '+' : ''}${iss.trend_change_percentage}%` : 'stable'})`
    )

    // 3. Select relevant representative reviews based on question context
    const qLower = question.toLowerCase()
    let representative = allReviews.filter((r) => {
      const textMatch = r.review_text.toLowerCase().includes(qLower)
      const issueMatch = (r.analysis?.primary_issue || r.analysis?.issue || '').toLowerCase().includes(qLower)
      return textMatch || issueMatch
    })

    if (representative.length < 5) {
      // Add highest urgency or critical reviews
      const additional = [...allReviews]
        .sort((a, b) => {
          const uA = a.analysis?.urgency_score ?? (a.rating === 1 ? 9 : 3)
          const uB = b.analysis?.urgency_score ?? (b.rating === 1 ? 9 : 3)
          return uB - uA
        })
        .slice(0, 8)

      representative = Array.from(new Set([...representative, ...additional])).slice(0, 10)
    }

    // 4. Assemble parameters
    const params: AskReviewsAssistantParams = {
      question: question.trim(),
      businessName: 'BurgerHub Delivery',
      totalReviews,
      averageRating: avgRating,
      sentimentDistribution: {
        positive: positiveCount,
        neutral: neutralCount,
        negative: negativeCount,
        positivePercentage,
        negativePercentage,
      },
      issueDistribution,
      recurringIssues: recurringIssues.map((iss) => ({
        issue_type: iss.issue_type,
        category: iss.category,
        mention_count: iss.mention_count,
        severity_score: iss.severity_score,
        severity_level: iss.severity_level,
        trend_direction: iss.trend_direction,
        trend_change_percentage: iss.trend_change_percentage,
      })),
      trendInformation,
      criticalCount,
      highPriorityCount: highCount,
      representativeReviews: representative.map((r) => ({
        customer_name: r.customer_name,
        platform: r.platform,
        rating: r.rating,
        review_text: r.review_text,
        created_at: r.created_at,
        issue: r.analysis?.primary_issue || r.analysis?.issue,
        priority: r.analysis?.priority,
      })),
    }

    // 5. Query Gemini Assistant
    const answer = await askReviewsAssistant(params)

    return NextResponse.json({
      success: true,
      answer,
      question: question.trim(),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in POST /api/assistant:', error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to process question with Review Assistant.',
      },
      { status: 500 }
    )
  }
}
