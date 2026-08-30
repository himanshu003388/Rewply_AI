import { NextResponse } from 'next/server'
import { getPrioritizedActions } from '@/lib/api/actions'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const actions = await getPrioritizedActions()
    return NextResponse.json({
      success: true,
      actions,
      totalCount: actions.length,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in GET /api/actions:', error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to fetch AI Action Center items.',
      },
      { status: 500 }
    )
  }
}
