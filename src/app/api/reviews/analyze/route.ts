import { NextRequest, NextResponse } from 'next/server'
import { analyzeReview } from '@/lib/ai'
import { getReviewById, updateReviewAnalysis } from '@/lib/api/reviews'

interface AnalyzeRequestBody {
  reviewId?: string
}

export async function POST(req: NextRequest) {
  try {
    let body: AnalyzeRequestBody
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON request body.',
        },
        { status: 400 }
      )
    }

    const { reviewId } = body || {}

    // 1. Validation: reviewId required
    if (!reviewId || typeof reviewId !== 'string' || reviewId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: "reviewId" must be a valid UUID string.',
        },
        { status: 400 }
      )
    }

    // 2. Fetch review from database
    const review = await getReviewById(reviewId.trim())
    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: `Review with ID "${reviewId}" was not found.`,
        },
        { status: 404 }
      )
    }

    // 3. Send review to Gemini AI Review Analysis Agent
    let analysis
    try {
      analysis = await analyzeReview({
        reviewText: review.review_text,
        rating: review.rating,
        customerName: review.customer_name,
        platform: review.platform,
      })
    } catch (aiError) {
      console.error('Gemini Analysis Agent Error:', aiError)
      return NextResponse.json(
        {
          success: false,
          error: (aiError as Error).message || 'Failed to analyze review with Gemini AI.',
        },
        { status: 502 }
      )
    }

    // 4. Save analysis back into Supabase reviews.analysis
    try {
      await updateReviewAnalysis(reviewId.trim(), analysis)
    } catch (dbError) {
      console.error('Failed to update review analysis in database:', dbError)
      return NextResponse.json(
        {
          success: false,
          error: 'Analysis completed but failed to persist to database.',
          analysis,
        },
        { status: 500 }
      )
    }

    // 5. Return typed analysis
    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (err) {
    console.error('Unhandled error in /api/reviews/analyze:', err)
    return NextResponse.json(
      {
        success: false,
        error: (err as Error).message || 'Internal server error occurred while processing review analysis.',
      },
      { status: 500 }
    )
  }
}
