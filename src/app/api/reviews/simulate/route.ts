import { NextRequest, NextResponse } from 'next/server'
import { insertReview, updateReviewAnalysis } from '@/lib/api/reviews'
import { analyzeReview } from '@/lib/ai'
import { Review } from '@/types/database.types'

export type DemoScenarioType = 'billing' | 'delivery' | 'food_quality' | 'positive' | 'app_technical'

interface ScenarioTemplate {
  type: DemoScenarioType
  label: string
  customer_name: string
  platform: 'google' | 'yelp' | 'trustpilot'
  rating: number
  review_text: string
}

const DEMO_SCENARIOS: ScenarioTemplate[] = [
  {
    type: 'billing',
    label: 'Critical Billing Dispute',
    customer_name: 'Derek M.',
    platform: 'google',
    rating: 1,
    review_text:
      'I was double charged $84.50 on my credit card when my order failed at checkout. I called customer service immediately and the representative was dismissive and refused to issue a refund. This is completely unacceptable and I will dispute the charge with my bank.',
  },
  {
    type: 'delivery',
    label: 'Extreme Peak-Hour Delivery Delay',
    customer_name: 'Sophia Chen',
    platform: 'yelp',
    rating: 1,
    review_text:
      'The app tracker showed my driver picked up the food at 7:10 PM, but the courier was clearly stacking deliveries across town. The burger and loaded fries did not arrive until 8:40 PM—nearly 90 minutes late, stone cold, and the drink had spilled all over the bag.',
  },
  {
    type: 'food_quality',
    label: 'Food Quality & Underdone Meat Complaint',
    customer_name: 'Liam Walker',
    platform: 'google',
    rating: 1,
    review_text:
      'Ordered the Double Bacon Smash and the center of the patty was completely raw, slimy, and pink. The fries were soaked in grease and tasted like burnt oil. We had to throw the entire meal away. A severe health hazard that needs immediate kitchen inspection.',
  },
  {
    type: 'positive',
    label: '5-Star Brand Advocacy Review',
    customer_name: 'Hannah Brooks',
    platform: 'google',
    rating: 5,
    review_text:
      'Absolutely phenomenal burger! The truffle aioli and crispy caramelized smash edges were cooked to absolute perfection. The delivery arrived blazing hot in only 18 minutes. BurgerHub is easily the best burger in the city right now!',
  },
  {
    type: 'app_technical',
    label: 'App Crash & Checkout Promo Failure',
    customer_name: 'Alex Rivera',
    platform: 'trustpilot',
    rating: 2,
    review_text:
      'The BurgerHub mobile app crashed three times right on the payment screen. When it finally processed, my promotional code SAVE20 was stripped without warning and I was charged full price. Please fix your checkout bugs.',
  },
]

export async function POST(req: NextRequest) {
  try {
    let scenarioType: DemoScenarioType | undefined
    try {
      const body = await req.json()
      scenarioType = body?.scenario
    } catch {
      // Body is optional
    }

    // 1. Pick scenario template
    let selected: ScenarioTemplate
    if (scenarioType) {
      selected = DEMO_SCENARIOS.find((s) => s.type === scenarioType) || DEMO_SCENARIOS[0]
    } else {
      const randomIndex = Math.floor(Math.random() * DEMO_SCENARIOS.length)
      selected = DEMO_SCENARIOS[randomIndex]
    }

    // Suffix customer name with a randomized ID to make each simulation unique
    const uniqueSuffix = Math.floor(100 + Math.random() * 900)
    const uniqueCustomerName = `${selected.customer_name} (#${uniqueSuffix})`

    // 2. Insert new review into Supabase / Local database
    const initialReview: Omit<Review, 'id'> = {
      customer_name: uniqueCustomerName,
      platform: selected.platform,
      rating: selected.rating,
      review_text: selected.review_text,
      created_at: new Date().toISOString(),
      response_status: 'pending',
      ai_response: null,
      analysis: {
        sentiment: selected.rating >= 4 ? 'positive' : 'negative',
        sentiment_score: selected.rating >= 4 ? 0.9 : -0.85,
        emotion: selected.rating >= 4 ? 'delighted' : 'frustrated',
        primary_issue:
          selected.type === 'delivery'
            ? 'delivery'
            : selected.type === 'food_quality'
            ? 'food_quality'
            : selected.type === 'billing'
            ? 'billing'
            : selected.type === 'app_technical'
            ? 'app_technical'
            : 'other',
        sub_issues: [],
        intent: selected.rating >= 4 ? 'praise' : 'complaint',
        urgency_score: selected.rating === 1 ? 9 : 2,
        urgency_reason: 'Processing live triage with Gemini AI...',
        priority: selected.rating === 1 ? 'critical' : 'low',
        extracted_keywords: [],
        estimated_business_impact: 'Pending Gemini assessment',
        suggested_action: selected.rating === 1 ? 'escalate' : 'respond',
        response_tone: selected.rating === 1 ? 'apologetic' : 'grateful',
      },
    }

    const createdReview = await insertReview(initialReview)

    // 3. Automatically run the full Gemini review analysis pipeline
    let analysis
    try {
      analysis = await analyzeReview({
        reviewText: createdReview.review_text,
        rating: createdReview.rating,
        customerName: createdReview.customer_name,
        platform: createdReview.platform,
      })

      // 4. Save Gemini analysis to Supabase
      await updateReviewAnalysis(createdReview.id, analysis)
      createdReview.analysis = analysis
    } catch (aiErr) {
      console.warn('Gemini analysis during simulation had error, keeping initial triage:', aiErr)
    }

    const isCriticalOrHigh =
      createdReview.analysis?.priority === 'critical' ||
      createdReview.analysis?.priority === 'high' ||
      createdReview.analysis?.priority === 'P1' ||
      createdReview.analysis?.priority === 'P2'

    return NextResponse.json({
      success: true,
      review: createdReview,
      scenario: selected.label,
      scenarioType: selected.type,
      isCriticalOrHigh,
    })
  } catch (error) {
    console.error('Error in /api/reviews/simulate:', error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to simulate review.',
      },
      { status: 500 }
    )
  }
}
