import { NextRequest, NextResponse } from 'next/server'
import { getReviews } from '@/lib/api/reviews'
import { generateLinkedInPost } from '@/lib/ai'
import { GenerateLinkedInPostParams } from '@/lib/ai/types'

interface LinkedInRequestBody {
  style?: 'customer_spotlight' | 'turnaround_story' | 'team_milestone' | 'thought_leadership'
  tone?: 'inspiring' | 'professional' | 'celebratory' | 'authentic'
  customNote?: string
  businessName?: string
  industry?: string
}

export async function POST(req: NextRequest) {
  try {
    let body: LinkedInRequestBody = {}
    try {
      body = await req.json()
    } catch {
      // Default body
    }

    const {
      style = 'customer_spotlight',
      tone = 'inspiring',
      customNote = '',
      businessName = 'BurgerHub Delivery',
      industry = 'Food Delivery & Restaurant Services',
    } = body

    // Fetch positive reviews from database
    const { data: allReviews } = await getReviews()
    const positiveReviews = allReviews
      .filter((r) => r.rating >= 4 || r.analysis?.sentiment === 'positive')
      .slice(0, 5)

    const params: GenerateLinkedInPostParams = {
      businessName,
      industry,
      style,
      tone,
      customNote,
      reviews: positiveReviews.map((r) => ({
        customer_name: r.customer_name,
        review_text: r.review_text,
        rating: r.rating,
        platform: r.platform,
      })),
    }

    const result = await generateLinkedInPost(params)

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in POST /api/linkedin/generate:', error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to generate LinkedIn post.',
      },
      { status: 500 }
    )
  }
}
