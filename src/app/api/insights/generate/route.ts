import { NextResponse } from 'next/server'
import { getReviews } from '@/lib/api/reviews'
import { calculateRecurringIssues } from '@/lib/api/recurring-issues'
import { generateBusinessInsights } from '@/lib/ai'
import { GenerateBusinessInsightsParams } from '@/lib/ai/types'

export async function POST() {
  try {
    // 1. Fetch all reviews and calculate recurring issues
    const { data: allReviews } = await getReviews()
    const { issues: recurringIssues } = await calculateRecurringIssues()

    const totalReviews = allReviews.length

    if (totalReviews === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No customer reviews available to generate insights.',
        },
        { status: 400 }
      )
    }

    // 2. Aggregate Sentiment Breakdown
    let positiveCount = 0
    let neutralCount = 0
    let negativeCount = 0

    let criticalCount = 0
    let highCount = 0
    let totalRating = 0

    const issueBreakdown: Record<string, number> = {}

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
      issueBreakdown[issueKey] = (issueBreakdown[issueKey] || 0) + 1
    }

    const avgRating = totalRating / totalReviews
    const positivePercentage = Math.round((positiveCount / totalReviews) * 100)
    const negativePercentage = Math.round((negativeCount / totalReviews) * 100)

    const trendChanges = recurringIssues.map((issue) => ({
      issue: issue.issue_type,
      trend: issue.trend_direction,
      changePercentage: issue.trend_change_percentage,
    }))

    // 3. Assemble parameters for Gemini AI
    const params: GenerateBusinessInsightsParams = {
      businessName: 'BurgerHub Delivery',
      industry: 'Food Delivery & Restaurant Services',
      totalReviews,
      sentimentBreakdown: {
        positive: positiveCount,
        neutral: neutralCount,
        negative: negativeCount,
        positivePercentage,
        negativePercentage,
      },
      issueBreakdown,
      recurringIssues: recurringIssues.map((iss) => ({
        issue_type: iss.issue_type,
        category: iss.category,
        mention_count: iss.mention_count,
        severity_score: iss.severity_score,
        severity_level: iss.severity_level,
        trend_direction: iss.trend_direction,
        trend_change_percentage: iss.trend_change_percentage,
      })),
      trendChanges,
      averageRating: avgRating,
      criticalReviewCount: criticalCount,
      highPriorityReviewCount: highCount,
    }

    // 4. Generate Structured Executive Insights with Google Gemini
    const insights = await generateBusinessInsights(params)

    return NextResponse.json({
      success: true,
      insights,
      metadata: {
        totalReviewsAnalyzed: totalReviews,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error in POST /api/insights/generate:', error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to generate AI Business Insights.',
      },
      { status: 500 }
    )
  }
}
