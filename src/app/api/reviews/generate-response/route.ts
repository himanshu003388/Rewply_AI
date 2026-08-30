import { NextRequest, NextResponse } from 'next/server'
import { generateReviewResponse, analyzeReview } from '@/lib/ai'
import { getReviewById, updateReviewStatus, updateReviewAnalysis } from '@/lib/api/reviews'

interface GenerateRequestBody {
  reviewId?: string
  tone?: string
  userNotes?: string
  notes?: string
}

export async function POST(req: NextRequest) {
  try {
    let body: GenerateRequestBody
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.' },
        { status: 400 }
      )
    }

    const { reviewId, tone, userNotes, notes } = body || {}
    const rawNotes = typeof userNotes === 'string' ? userNotes : typeof notes === 'string' ? notes : undefined

    if (!reviewId || typeof reviewId !== 'string' || reviewId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: "reviewId" must be a valid UUID string.' },
        { status: 400 }
      )
    }

    // 1. Fetch review
    const review = await getReviewById(reviewId.trim())
    if (!review) {
      return NextResponse.json(
        { success: false, error: `Review with ID "${reviewId}" was not found.` },
        { status: 404 }
      )
    }

    // 2. Ensure review has analysis; if missing, analyze it first
    let analysis = review.analysis
    if (!analysis || !analysis.sentiment) {
      try {
        analysis = await analyzeReview({
          reviewText: review.review_text,
          rating: review.rating,
          customerName: review.customer_name,
          platform: review.platform,
        })
        await updateReviewAnalysis(reviewId.trim(), analysis)
      } catch (err) {
        console.warn('Auto-analysis failed before response generation:', err)
      }
    }

    // 3. Generate brand-aligned response with Gemini
    const result = await generateReviewResponse({
      reviewText: review.review_text,
      rating: review.rating,
      customerName: review.customer_name,
      platform: review.platform,
      analysis,
      tone: tone || 'professional',
      userNotes: rawNotes,
    })

    // 4. Save response to Supabase
    await updateReviewStatus(reviewId.trim(), 'pending', result.response)

    return NextResponse.json({
      success: true,
      aiResponse: result.response,
      toneUsed: result.toneUsed,
      wordCount: result.wordCount,
    })
  } catch (err) {
    console.error('Error in /api/reviews/generate-response:', err)
    return NextResponse.json(
      {
        success: false,
        error: (err as Error).message || 'Failed to generate AI review response.',
      },
      { status: 500 }
    )
  }
}
