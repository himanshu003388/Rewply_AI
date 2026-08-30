import { NextResponse } from 'next/server'
import { resetDemoReviews } from '@/lib/api/reviews'

export async function POST() {
  try {
    const result = await resetDemoReviews()
    return NextResponse.json({
      success: true,
      message: `Demo dataset reset to initial ${result.count} BurgerHub reviews.`,
      count: result.count,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in /api/demo/reset:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to reset demo dataset.' },
      { status: 500 }
    )
  }
}
