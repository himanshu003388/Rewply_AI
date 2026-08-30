import { NextRequest, NextResponse } from 'next/server'
import { updateActionStatus, ActionStatus } from '@/lib/api/actions'

const VALID_STATUSES: ActionStatus[] = ['pending', 'investigating', 'dismissed', 'completed']

export async function POST(req: NextRequest) {
  try {
    let body
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON request body.' }, { status: 400 })
    }

    const { actionId, status } = body || {}

    if (!actionId || typeof actionId !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing required field: actionId' }, { status: 400 })
    }

    if (!status || !VALID_STATUSES.includes(status as ActionStatus)) {
      return NextResponse.json(
        { success: false, error: `Invalid status: must be one of ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const result = await updateActionStatus(actionId, status as ActionStatus)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in POST /api/actions/status:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to update action status.' },
      { status: 500 }
    )
  }
}
