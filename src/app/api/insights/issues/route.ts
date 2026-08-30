import { NextResponse } from 'next/server'
import { calculateRecurringIssues } from '@/lib/api/recurring-issues'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await calculateRecurringIssues()

    return NextResponse.json({
      success: true,
      issues: result.issues,
      meta: {
        totalAnalyzed: result.totalAnalyzed,
        negativeReviewsCount: result.negativeReviewsCount,
        timeWindowDays: result.timeWindowDays,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/insights/issues:', error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to calculate recurring problems intelligence.',
      },
      { status: 500 }
    )
  }
}
