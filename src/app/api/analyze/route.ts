import { NextRequest, NextResponse } from 'next/server'
import { analyzeReview, generateReviewResponse } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { reviewText, rating, customerName, platform, generateResponse: shouldGenerate } = body

    if (!reviewText || typeof reviewText !== 'string') {
      return NextResponse.json(
        { error: 'reviewText is required and must be a string.' },
        { status: 400 }
      )
    }

    const analysis = await analyzeReview({
      reviewText,
      rating,
      customerName,
      platform,
    })

    let aiResponse = null
    if (shouldGenerate) {
      aiResponse = await generateReviewResponse({
        reviewText,
        rating: rating || 3,
        customerName: customerName || 'Valued Customer',
        analysis,
      })
    }

    return NextResponse.json({
      success: true,
      analysis,
      aiResponse,
    })
  } catch (error) {
    console.error('Error in /api/analyze route:', error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to process AI review analysis.',
      },
      { status: 500 }
    )
  }
}
