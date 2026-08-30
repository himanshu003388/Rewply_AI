import { NextResponse } from 'next/server'
import { getAndSyncReputationHealthScore } from '@/lib/metrics/health-score'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const healthScore = await getAndSyncReputationHealthScore()
    return NextResponse.json(healthScore)
  } catch (error) {
    console.error('Error in GET /api/metrics/health-score:', error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to calculate reputation health score.',
      },
      { status: 500 }
    )
  }
}
