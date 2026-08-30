import { NextRequest, NextResponse } from 'next/server'
import { generateReviewResponse, analyzeReview } from '@/lib/ai'
import { getReviewById, updateReviewStatus, updateReviewAnalysis } from '@/lib/api/reviews'
import { SupportedTone } from '@/lib/ai/types'

const ALLOWED_TONES: SupportedTone[] = ['professional', 'friendly', 'empathetic', 'apologetic', 'grateful']

interface RespondRequestBody {
  reviewId?: string
  tone?: SupportedTone | string
}

export async function POST(req: NextRequest) {
  try {
    let body: RespondRequestBody
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.' },
        { status: 400 }
      )
    }

    const { reviewId, tone } = body || {}

    // 1. Validation: reviewId
    if (!reviewId || typeof reviewId !== 'string' || reviewId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: "reviewId" must be a valid UUID string.' },
        { status: 400 }
      )
    }

    // 2. Validate Tone
    let validatedTone: SupportedTone = 'professional'
    if (tone && ALLOWED_TONES.includes(tone as SupportedTone)) {
      validatedTone = tone as SupportedTone
    }

    // 3. Fetch review
    const review = await getReviewById(reviewId.trim())
    if (!review) {
      return NextResponse.json(
        { success: false, error: `Review with ID "${reviewId}" was not found.` },
        { status: 404 }
      )
    }

    // 4. Ensure review has analysis; if missing, run analysis first to extract context
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

    // 5. Generate personalized response with Google Gemini
    let result
    try {
      result = await generateReviewResponse({
        reviewText: review.review_text,
        rating: review.rating,
        customerName: review.customer_name,
        platform: review.platform,
        businessName: 'BurgerHub Delivery',
        industry: 'Food Delivery & Restaurant Services',
        sentiment: analysis?.sentiment,
        emotion: analysis?.emotion,
        primaryIssue: analysis?.primary_issue || analysis?.issue,
        urgency: analysis?.urgency_score ?? analysis?.urgency,
        suggestedAction: analysis?.suggested_action,
        tone: validatedTone,
      })
    } catch (aiErr) {
      console.error('Gemini Response Generation Error:', aiErr)
      return NextResponse.json(
        {
          success: false,
          error: (aiErr as Error).message || 'Failed to generate response with Gemini AI.',
        },
        { status: 502 }
      )
    }

    // 6. Save in database: update ai_response and set response_status = "pending"
    try {
      await updateReviewStatus(reviewId.trim(), 'pending', result.response)
    } catch (dbErr) {
      console.error('Failed to update review response status in database:', dbErr)
      return NextResponse.json(
        {
          success: false,
          error: 'Response generated but failed to persist to database.',
          aiResponse: result.response,
        },
        { status: 500 }
      )
    }

    // 7. Return generated response
    return NextResponse.json({
      success: true,
      aiResponse: result.response,
      toneUsed: result.toneUsed,
      status: 'pending',
      wordCount: result.wordCount,
    })
  } catch (err) {
    console.error('Unhandled error in /api/reviews/respond:', err)
    return NextResponse.json(
      {
        success: false,
        error: (err as Error).message || 'Internal server error while generating response.',
      },
      { status: 500 }
    )
  }
}
