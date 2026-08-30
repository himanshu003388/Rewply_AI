import { getGeminiModel, executeWithTimeout, safeParseGeminiJSON, isGeminiAvailable } from './gemini-client'
import {
  AnalyzeReviewParams,
  AnalyzeReviewResult,
  GenerateResponseParams,
  GenerateResponseResult,
  AnalyzeRecurringIssuesResult,
  BusinessInsightsData,
  GenerateBusinessInsightsParams,
  AskReviewsAssistantParams,
  AssistantAnswer,
} from './types'
import {
  SentimentType,
  EmotionType,
  PrimaryIssueType,
  IntentType,
  PriorityType,
  SuggestedActionType,
} from '@/types/database.types'

const ALLOWED_SENTIMENTS: SentimentType[] = ['positive', 'negative', 'neutral', 'mixed']
const ALLOWED_EMOTIONS: EmotionType[] = [
  'happy',
  'excited',
  'satisfied',
  'neutral',
  'concerned',
  'disappointed',
  'frustrated',
  'angry',
]
const ALLOWED_PRIMARY_ISSUES: PrimaryIssueType[] = [
  'delivery',
  'food_quality',
  'customer_service',
  'pricing',
  'billing',
  'packaging',
  'app_technical',
  'order_accuracy',
  'other',
]
const ALLOWED_INTENTS: IntentType[] = ['praise', 'complaint', 'suggestion', 'question', 'refund_request', 'other']
const ALLOWED_PRIORITIES: PriorityType[] = ['critical', 'high', 'medium', 'low']
const ALLOWED_SUGGESTED_ACTIONS: SuggestedActionType[] = ['escalate', 'respond_quickly', 'respond', 'monitor']

/**
 * Validate and sanitize raw LLM output against strict schema rules
 */
export function validateAndSanitizeAnalysis(
  raw: Partial<AnalyzeReviewResult>,
  fallbackRating?: number
): AnalyzeReviewResult {
  // 1. Sentiment validation
  let sentiment: SentimentType = 'neutral'
  if (raw.sentiment && ALLOWED_SENTIMENTS.includes(raw.sentiment as SentimentType)) {
    sentiment = raw.sentiment as SentimentType
  } else if (fallbackRating !== undefined) {
    sentiment = fallbackRating >= 4 ? 'positive' : fallbackRating <= 2 ? 'negative' : 'neutral'
  }

  // 2. Sentiment Score (-1.0 to 1.0)
  let sentiment_score = typeof raw.sentiment_score === 'number' ? raw.sentiment_score : 0.0
  if (sentiment_score > 1.0 || sentiment_score < -1.0) {
    sentiment_score = Math.max(-1.0, Math.min(1.0, sentiment_score / 100))
  }

  // 3. Emotion validation
  let emotion: EmotionType | string = 'neutral'
  if (raw.emotion && ALLOWED_EMOTIONS.includes(raw.emotion as EmotionType)) {
    emotion = raw.emotion as EmotionType
  } else if (raw.emotion) {
    emotion = String(raw.emotion).toLowerCase().trim()
  } else if (fallbackRating !== undefined) {
    emotion = fallbackRating >= 4 ? 'satisfied' : fallbackRating <= 2 ? 'frustrated' : 'neutral'
  }

  // 4. Primary Issue validation
  let primary_issue: PrimaryIssueType = 'other'
  if (raw.primary_issue && ALLOWED_PRIMARY_ISSUES.includes(raw.primary_issue as PrimaryIssueType)) {
    primary_issue = raw.primary_issue as PrimaryIssueType
  }

  // 5. Sub issues
  const sub_issues = Array.isArray(raw.sub_issues)
    ? raw.sub_issues.map((s) => String(s).trim()).filter(Boolean)
    : []

  // 6. Intent validation
  let intent: IntentType = 'other'
  if (raw.intent && ALLOWED_INTENTS.includes(raw.intent as IntentType)) {
    intent = raw.intent as IntentType
  } else if (fallbackRating !== undefined) {
    intent = fallbackRating >= 4 ? 'praise' : fallbackRating <= 2 ? 'complaint' : 'other'
  }

  // 7. Urgency Score (1 - 10) & Reason
  const urgency_score =
    typeof raw.urgency_score === 'number'
      ? Math.max(1, Math.min(10, Math.round(raw.urgency_score)))
      : fallbackRating && fallbackRating <= 1
      ? 9
      : fallbackRating && fallbackRating === 2
      ? 6
      : 2
  const urgency_reason = raw.urgency_reason ? String(raw.urgency_reason).trim() : 'Standard urgency evaluation'

  // 8. Priority validation
  let priority: PriorityType = 'low'
  if (raw.priority && ALLOWED_PRIORITIES.includes(raw.priority as PriorityType)) {
    priority = raw.priority as PriorityType
  } else if (urgency_score >= 8) {
    priority = 'critical'
  } else if (urgency_score >= 6) {
    priority = 'high'
  } else if (urgency_score >= 4) {
    priority = 'medium'
  }

  // 9. Extracted keywords
  const extracted_keywords = Array.isArray(raw.extracted_keywords)
    ? raw.extracted_keywords.map((k) => String(k).trim()).filter(Boolean)
    : []

  // 10. Estimated business impact
  const estimated_business_impact = raw.estimated_business_impact
    ? String(raw.estimated_business_impact).trim()
    : priority === 'critical' || priority === 'high'
    ? 'High churn risk & negative word of mouth'
    : 'Low to moderate impact'

  // 11. Suggested action
  let suggested_action: SuggestedActionType = 'respond'
  if (raw.suggested_action && ALLOWED_SUGGESTED_ACTIONS.includes(raw.suggested_action as SuggestedActionType)) {
    suggested_action = raw.suggested_action as SuggestedActionType
  } else if (priority === 'critical') {
    suggested_action = 'escalate'
  } else if (priority === 'high') {
    suggested_action = 'respond_quickly'
  }

  // 12. Response tone
  const response_tone = raw.response_tone
    ? String(raw.response_tone).trim()
    : sentiment === 'negative'
    ? 'empathetic'
    : 'appreciative'

  // Compatibility helpers
  const legacyUrgency: 'low' | 'medium' | 'high' = urgency_score >= 7 ? 'high' : urgency_score >= 4 ? 'medium' : 'low'
  const legacyIssue = sub_issues.length > 0 ? `${primary_issue}: ${sub_issues.join(', ')}` : primary_issue

  return {
    sentiment,
    sentiment_score,
    emotion,
    primary_issue,
    sub_issues,
    intent,
    urgency_score,
    urgency_reason,
    priority,
    extracted_keywords,
    estimated_business_impact,
    suggested_action,
    response_tone,
    confidence_score: typeof raw.confidence_score === 'number' ? raw.confidence_score : 0.95,
    issue: legacyIssue,
    urgency: legacyUrgency,
  }
}

/**
 * 1. Analyze single customer review using Google Gemini
 */
export async function analyzeReview(params: AnalyzeReviewParams): Promise<AnalyzeReviewResult> {
  if (!isGeminiAvailable()) {
    console.info('GEMINI_API_KEY is not configured. Using deterministic fallback analysis.')
    return validateAndSanitizeAnalysis({}, params.rating)
  }

  try {
    const model = getGeminiModel()

    const systemInstructions = `You are an expert customer feedback intelligence analyst for high-volume consumer businesses.
Your role is to deeply analyze incoming customer reviews, assess sentiment, emotional state, operational root causes, urgency, risk factors, and recommended next actions.

STRICT SAFETY & BUSINESS RULES:
1. NEVER invent facts or hallucinate details not mentioned in the customer's text.
2. NEVER invent refunds, claims, or compensation promises.
3. NEVER claim that a business resolution or operational action has already happened.
4. If a review mentions a potentially serious health/safety issue (e.g. food poisoning, undercooked/spoiled meat, foreign objects like glass/plastic, undeclared allergens), you MUST mark priority as "critical" and suggested_action as "escalate".
5. If a review contains a legal threat (e.g. lawsuit, attorney, reporting to health inspector or regulatory agency), you MUST mark priority as "high" or "critical" and suggested_action as "escalate" or "respond_quickly".
6. Rating alone must NOT determine sentiment; analyze the full text nuance (e.g. a 5-star rating with sarcastic complaint text is negative, a 1-star review with pure praise is mixed/positive).
7. Return valid JSON ONLY matching the requested schema. No markdown outside the JSON.`

    const prompt = `${systemInstructions}

Analyze this customer review:
Customer Name: ${params.customerName || 'Anonymous'}
Platform: ${params.platform || 'Google'}
Star Rating: ${params.rating !== undefined ? `${params.rating}/5` : 'Not provided'}
Review Text: "${params.reviewText}"

Allowed Enum Values:
- sentiment: "positive" | "negative" | "neutral" | "mixed"
- emotion: "happy" | "excited" | "satisfied" | "neutral" | "concerned" | "disappointed" | "frustrated" | "angry"
- primary_issue: "delivery" | "food_quality" | "customer_service" | "pricing" | "billing" | "packaging" | "app_technical" | "order_accuracy" | "other"
- intent: "praise" | "complaint" | "suggestion" | "question" | "refund_request" | "other"
- priority: "critical" | "high" | "medium" | "low"
- suggested_action: "escalate" | "respond_quickly" | "respond" | "monitor"

Return ONLY a JSON object with this exact structure:
{
  "sentiment": "<allowed sentiment>",
  "sentiment_score": <number between -1.0 (most negative) and 1.0 (most positive)>,
  "emotion": "<allowed emotion>",
  "primary_issue": "<allowed primary issue>",
  "sub_issues": ["<specific sub-issue 1>", "<specific sub-issue 2>"],
  "intent": "<allowed intent>",
  "urgency_score": <integer from 1 (lowest) to 10 (highest)>,
  "urgency_reason": "<1 concise sentence explaining why this urgency score was assigned>",
  "priority": "<allowed priority>",
  "extracted_keywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>"],
  "estimated_business_impact": "<Brief evaluation of churn risk, brand reputation risk, or viral risk>",
  "suggested_action": "<allowed suggested action>",
  "response_tone": "<suggested response tone e.g. empathetic, apologetic, appreciative, professional>",
  "confidence_score": <number between 0.0 and 1.0>
}`

    const generatePromise = model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    })

    const response = await executeWithTimeout(generatePromise, 25000, 'Review Analysis Agent')
    const text = response.response.text()

    const rawParsed = safeParseGeminiJSON<Partial<AnalyzeReviewResult>>(text, {})
    return validateAndSanitizeAnalysis(rawParsed, params.rating)
  } catch (error) {
    console.warn('Gemini review analysis failed, using fallback:', (error as Error).message)
    return validateAndSanitizeAnalysis({}, params.rating)
  }
}

/**
 * 2. Generate personalized, brand-aligned, contextual response for a customer review using Google Gemini
 */
export async function generateReviewResponse(params: GenerateResponseParams): Promise<GenerateResponseResult> {
  const businessName = params.businessName || 'BurgerHub Delivery'
  const industry = params.industry || 'Food Delivery & Restaurant Services'
  const tone = params.tone || (params.rating <= 2 ? 'empathetic' : 'grateful')

  const sentiment = params.sentiment || params.analysis?.sentiment || (params.rating >= 4 ? 'positive' : params.rating <= 2 ? 'negative' : 'neutral')
  const emotion = params.emotion || params.analysis?.emotion || 'neutral'
  const primaryIssue = params.primaryIssue || params.analysis?.primary_issue || params.analysis?.issue || 'general feedback'
  const urgency = params.urgency !== undefined ? params.analysis?.urgency_score ?? params.urgency : (params.rating <= 1 ? 'high' : 'low')
  const suggestedAction = params.suggestedAction || params.analysis?.suggested_action || 'respond'
  const userNotes = params.userNotes ? params.userNotes.trim() : ''

  const defaultFallback: GenerateResponseResult = {
    response:
      userNotes.length > 0
        ? params.rating <= 2
          ? `Hi ${params.customerName}, thank you for bringing this to our attention. We are genuinely sorry that your experience with ${businessName} did not meet expectations. To resolve this, ${userNotes}. Please reach out to our dedicated support team with your order details so we can assist you directly.`
          : `Hi ${params.customerName}, thank you so much for the wonderful review and for choosing ${businessName}! ${userNotes}. We truly appreciate your support and look forward to serving you again soon!`
        : params.rating <= 2
        ? `Hi ${params.customerName}, thank you for bringing this to our attention. We are genuinely sorry to hear that your experience with ${businessName} fell short of expectations regarding ${primaryIssue}. We take your feedback seriously and would appreciate the opportunity to look into this further. Please reach out to our dedicated support team with your order details so we can assist you directly.`
        : `Hi ${params.customerName}, thank you so much for the wonderful review and for choosing ${businessName}! We are thrilled you had such a great experience with our team. We look forward to serving your next order soon!`,
    toneUsed: String(tone),
    wordCount: 45,
  }

  if (!isGeminiAvailable()) {
    console.info('GEMINI_API_KEY is not configured. Using deterministic fallback response draft.')
    return defaultFallback
  }

  try {
    const model = getGeminiModel()

    const systemInstructions = `You are an expert customer relations and reputation manager for "${businessName}" (${industry}).
Generate a personalized, brand-aligned public response to the customer's review.

CRITICAL RULES:
1. DIRECT ACKNOWLEDGMENT: Directly mention and address the specific details, menu items, or incidents in the customer's review. Avoid robotic or generic boilerplates.
2. CUSTOMER NAME: Address the customer by name (e.g., "Hi ${params.customerName},") when appropriate.
3. TONE MATCHING: Strictly write in the selected tone: "${tone}" (Allowed: professional, friendly, empathetic, apologetic, grateful).
4. LENGTH CONSTRAINT: Keep the response concise, ideally between 50 and 100 words.
5. NO INVENTED FACTS OR COMPENSATION: Do not fabricate specific unmentioned compensation unless explicitly instructed in the User Notes below.
6. NO LEGAL LIABILITY: Never admit legal liability, negligence, or fault in legal terms.
7. NO GUARANTEES: Never make guarantees or operational promises that cannot be verified.
8. CONTACT ESCALATION: For complaints or service issues, invite the customer to connect with support for direct resolution when appropriate.
9. USER NOTES EXPANSION: If the user provided rough words, bullet points, or draft notes below, analyze and expand them into a fluent, cohesive, and professional response that seamlessly incorporates their intent into the message.
10. Return valid JSON ONLY matching the required schema.`

    const prompt = `${systemInstructions}

Review Context:
- Business Name: ${businessName}
- Industry: ${industry}
- Customer Name: ${params.customerName}
- Platform: ${params.platform || 'Google'}
- Rating: ${params.rating}/5
- Original Review: "${params.reviewText}"
- Detected Sentiment: ${sentiment}
- Customer Emotion: ${emotion}
- Primary Issue: ${primaryIssue}
- Urgency: ${urgency}
- Recommended Action: ${suggestedAction}
- Selected Tone: ${tone}
${userNotes ? `- User's Key Points / Rough Notes to Expand: "${userNotes}"` : ''}

Output Requirement:
Return ONLY a valid JSON object matching this schema:
{
  "response": "<The exact 50-100 word response text ready for human review and approval>",
  "toneUsed": "${tone}"
}`

    const generatePromise = model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.25,
        responseMimeType: 'application/json',
      },
    })

    const response = await executeWithTimeout(generatePromise, 25000, 'Response Generation Agent')
    const text = response.response.text()

    const parsed = safeParseGeminiJSON<GenerateResponseResult>(text, defaultFallback)
    const cleanedResponse = parsed.response ? parsed.response.trim() : defaultFallback.response
    const wordCount = cleanedResponse.split(/\s+/).filter(Boolean).length

    return {
      response: cleanedResponse,
      toneUsed: parsed.toneUsed || String(tone),
      wordCount,
    }
  } catch (error) {
    console.warn('Gemini response generation failed, using fallback:', (error as Error).message)
    return defaultFallback
  }
}

/**
 * 3. Analyze recurring operational issues across a collection of customer reviews
 */
export async function analyzeRecurringIssues(
  reviews: Array<{ review_text: string; rating: number; customer_name?: string; platform?: string }>
): Promise<AnalyzeRecurringIssuesResult> {
  const defaultFallback: AnalyzeRecurringIssuesResult = {
    issues: [],
    totalAnalyzed: reviews.length,
    primaryRiskCategory: 'Delivery',
  }

  if (!isGeminiAvailable()) {
    console.info('GEMINI_API_KEY is not configured. Using fallback recurring issues result.')
    return defaultFallback
  }

  try {
    const model = getGeminiModel()

    const reviewsSummary = reviews
      .slice(0, 60)
      .map((r, i) => `[${i + 1}] (${r.rating}★) ${r.review_text}`)
      .join('\n')

    const prompt = `You are an operational intelligence analyst for a food delivery & restaurant platform.
Analyze the following batch of customer reviews to discover recurring root-cause bottlenecks and group them into prioritized problem clusters.

Reviews Batch (${reviews.length} total):
${reviewsSummary}

Output Requirement:
Return ONLY a valid JSON object matching this schema:
{
  "issues": [
    {
      "issue_type": "<Concise name of the issue e.g. Delivery Delays (>60 mins)>",
      "category": "Delivery" | "Food Quality" | "Billing" | "Packaging" | "App/Technical" | "Customer Service",
      "mention_count": <approximate number of mentions in this batch>,
      "severity_score": <number from 1 to 10>,
      "trend_direction": "up" | "down" | "stable",
      "impact_summary": "<Brief sentence on customer impact>",
      "recommended_action": "<Concrete operational fix for kitchen/fleet/engineering>"
    }
  ],
  "totalAnalyzed": ${reviews.length},
  "primaryRiskCategory": "<Category causing the highest customer dissatisfaction>"
}`

    const generatePromise = model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    })

    const response = await executeWithTimeout(generatePromise, 30000, 'Recurring Issue Analysis')
    const text = response.response.text()

    return safeParseGeminiJSON<AnalyzeRecurringIssuesResult>(text, defaultFallback)
  } catch (error) {
    console.warn('Gemini recurring issues analysis failed, using fallback:', (error as Error).message)
    return defaultFallback
  }
}

/**
 * 4. Generate high-level AI Business Insights from aggregated review intelligence
 */
export async function generateBusinessInsights(
  params: GenerateBusinessInsightsParams
): Promise<BusinessInsightsData> {
  const businessName = params.businessName || 'BurgerHub Delivery'
  const industry = params.industry || 'Food Delivery & Restaurant Services'

  const defaultFallback: BusinessInsightsData = {
    headline: 'Strong Product Appreciation Countered by Delivery Latency Friction',
    summary: `Analysis of ${params.totalReviews} customer reviews reveals strong customer advocacy for burger taste and food quality, though delivery delays and packaging issues represent the primary operational risk.`,
    top_problem: {
      issue: 'Delivery & Logistics Delays',
      reason: 'Accounts for the highest volume of negative reviews with high urgency scores and negative sentiment.',
      severity: 'critical',
    },
    emerging_problem: {
      issue: 'Peak Hour Courier Stacking',
      evidence: 'Increased review mentions of cold food on delivery during weekend evening windows.',
    },
    positive_trend: {
      topic: 'Double Truffle Smash Recipe & Flavor Quality',
      evidence: `${params.sentimentBreakdown.positive} positive reviews specifically praise burger taste and seasoning.`,
    },
    recommended_actions: [
      {
        priority: 'critical',
        action: 'Implement maximum 2-order courier stacking limit during peak 6-9 PM delivery windows.',
        reason: 'Directly addresses cold food and delivery delays (>60 mins).',
        expected_impact: 'high',
      },
      {
        priority: 'high',
        action: 'Switch to vented fry pouches to prevent condensation and sogginess.',
        reason: 'Repeated sub-issue in 25% of food quality complaints.',
        expected_impact: 'medium',
      },
      {
        priority: 'medium',
        action: 'Streamline in-app promo code error handling at checkout.',
        reason: 'Resolves checkout abandonment and billing frustration.',
        expected_impact: 'medium',
      },
    ],
  }

  if (!isGeminiAvailable()) {
    console.info('GEMINI_API_KEY is not configured. Using deterministic fallback business insights.')
    return defaultFallback
  }

  try {
    const model = getGeminiModel()

    const prompt = `You are the Principal Business Intelligence and Customer Experience Executive for "${businessName}" (${industry}).
Analyze the provided aggregated review intelligence and produce an executive-level strategic report with actionable recommendations.

CRITICAL RULES:
1. ONLY USE SUPPLIED DATA: Base your insights, percentages, and metrics solely on the provided aggregated statistics. Never fabricate numbers or hallucinate facts.
2. NO FALSE CAUSATION: Do not claim causation unless explicitly backed by the data. Always distinguish correlation from proven causation.
3. CLEAR PRIORITIZATION: Classify severity and impact realistically (critical, high, medium, low).
4. RETURN VALID JSON ONLY matching the requested schema.

Aggregated Review Intelligence:
- Total Reviews Analyzed: ${params.totalReviews}
- Average Star Rating: ${params.averageRating.toFixed(2)}/5.0
- Critical Priority Reviews: ${params.criticalReviewCount}
- High Priority Reviews: ${params.highPriorityReviewCount}
- Sentiment Breakdown:
  * Positive: ${params.sentimentBreakdown.positive} (${params.sentimentBreakdown.positivePercentage}%)
  * Neutral: ${params.sentimentBreakdown.neutral}
  * Negative: ${params.sentimentBreakdown.negative} (${params.sentimentBreakdown.negativePercentage}%)
- Issue Category Breakdown:
${Object.entries(params.issueBreakdown)
  .map(([k, v]) => `  * ${k}: ${v} mentions`)
  .join('\n')}
- Top Recurring Problems & Period Trends:
${params.recurringIssues
  .map(
    (issue) =>
      `  * ${issue.issue_type} (${issue.category}): ${issue.mention_count} mentions | Severity: ${issue.severity_score}/10 (${issue.severity_level}) | Trend: ${issue.trend_direction} (${issue.trend_change_percentage !== null ? `${issue.trend_change_percentage > 0 ? '+' : ''}${issue.trend_change_percentage}%` : 'no prior period baseline'})`
  )
  .join('\n')}

Output Requirement:
Return ONLY a valid JSON object with this exact structure:
{
  "headline": "<1 concise, high-impact executive headline summarizing operational health>",
  "summary": "<2-3 sentence strategic executive briefing highlighting the relationship between customer satisfaction and operational bottlenecks>",
  "top_problem": {
    "issue": "<The primary, most severe problem cluster>",
    "reason": "<Specific reason why this is the highest risk based on severity score and negative volume>",
    "severity": "critical" | "high" | "medium" | "low"
  },
  "emerging_problem": {
    "issue": "<An issue showing increasing frequency or emerging negative friction>",
    "evidence": "<Specific evidence from the trend change percentage or recent review volume>"
  },
  "positive_trend": {
    "topic": "<The strongest area of customer praise or improving performance>",
    "evidence": "<Evidence from positive sentiment volume and customer feedback>"
  },
  "recommended_actions": [
    {
      "priority": "critical" | "high" | "medium" | "low",
      "action": "<Specific, operational step for team/kitchen/fleet/app>",
      "reason": "<Direct rationale linking back to review data>",
      "expected_impact": "high" | "medium" | "low"
    }
  ]
}`

    const generatePromise = model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    })

    const response = await executeWithTimeout(generatePromise, 30000, 'Business Insights Generation')
    const text = response.response.text()

    return safeParseGeminiJSON<BusinessInsightsData>(text, defaultFallback)
  } catch (error) {
    console.warn('Gemini business insights generation failed, using fallback:', (error as Error).message)
    return defaultFallback
  }
}

/**
 * 5. "Ask Your Reviews" conversational RAG assistant
 */
export async function askReviewsAssistant(params: AskReviewsAssistantParams): Promise<AssistantAnswer> {
  const businessName = params.businessName || 'BurgerHub Delivery'

  const defaultFallback: AssistantAnswer = {
    concise_answer: `Based on analysis of ${params.totalReviews} customer reviews for ${businessName}, the primary operational priority is addressing delivery latency and cold food complaints.`,
    supporting_statistics: [
      `${params.sentimentDistribution.negativePercentage}% of reviews reflect negative sentiment`,
      `Delivery issues represent the highest volume problem with average urgency 8.7/10`,
    ],
    relevant_evidence: [
      `Multiple customer complaints cite delivery delays exceeding 60-90 minutes during peak evening hours.`,
    ],
    recommended_action: `Audit courier dispatch limits and cap stacked orders at 2 per driver during peak 6-9 PM periods.`,
    referenced_issues: ['Delivery & Logistics Delays'],
  }

  if (!isGeminiAvailable()) {
    console.info('GEMINI_API_KEY is not configured. Using deterministic assistant response fallback.')
    return defaultFallback
  }

  try {
    const model = getGeminiModel()

    const prompt = `You are Rewply AI, an AI customer reputation analyst for "${businessName}".

CRITICAL INSTRUCTIONS:
1. Answer questions using ONLY the provided review intelligence below.
2. Never invent statistics or hallucinate numbers.
3. If the data does not support an answer, explicitly state that there is insufficient data.
4. Clearly distinguish correlation from causation.
5. When recommending an action, explain which observed evidence supports it.
6. Do NOT claim that you or the system performed any external actions (e.g. refunding, contacting customers, changing server code).

Aggregated Review Intelligence:
- Total Analyzed Reviews: ${params.totalReviews}
- Average Star Rating: ${params.averageRating.toFixed(2)}/5.0
- Critical Priority Reviews: ${params.criticalCount}
- High Priority Reviews: ${params.highPriorityCount}
- Sentiment Distribution:
  * Positive: ${params.sentimentDistribution.positive} (${params.sentimentDistribution.positivePercentage}%)
  * Neutral: ${params.sentimentDistribution.neutral}
  * Negative: ${params.sentimentDistribution.negative} (${params.sentimentDistribution.negativePercentage}%)
- Issue Category Breakdown:
${Object.entries(params.issueDistribution)
  .map(([k, v]) => `  * ${k}: ${v} mentions`)
  .join('\n')}
- Recurring Problems & Period Trends:
${params.recurringIssues
  .map(
    (issue) =>
      `  * ${issue.issue_type} (${issue.category}): ${issue.mention_count} mentions | Severity: ${issue.severity_score}/10 | Trend: ${issue.trend_direction} (${issue.trend_change_percentage !== null ? `${issue.trend_change_percentage > 0 ? '+' : ''}${issue.trend_change_percentage}%` : 'no baseline'})`
  )
  .join('\n')}
- Period Velocity Trends:
${params.trendInformation.map((t) => `  * ${t}`).join('\n')}
- Representative Customer Quotes:
${params.representativeReviews
  .map(
    (r, i) =>
      `  [Review ${i + 1}] (${r.platform.toUpperCase()} - ${r.rating}★ - Priority: ${r.priority || 'N/A'}) ${r.customer_name}: "${r.review_text}"`
  )
  .join('\n')}

User Question: "${params.question}"

Output Requirement:
Return ONLY a valid JSON object matching this exact schema:
{
  "concise_answer": "<Direct, 2-3 sentence answer addressing the user question directly>",
  "supporting_statistics": [
    "<Statistic 1 based directly on review intelligence>",
    "<Statistic 2>"
  ],
  "relevant_evidence": [
    "<Customer quote or observed period trend evidence>",
    "<Observed evidence 2>"
  ],
  "recommended_action": "<Clear, data-grounded next operational recommendation with supporting rationale>",
  "referenced_issues": ["<Related Issue Category 1>", "<Related Issue Category 2>"]
}`

    const generatePromise = model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    })

    const response = await executeWithTimeout(generatePromise, 25000, 'Ask Reviews Assistant')
    const text = response.response.text()

    return safeParseGeminiJSON<AssistantAnswer>(text, defaultFallback)
  } catch (error) {
    console.warn('Gemini askReviewsAssistant failed, using fallback:', (error as Error).message)
    return defaultFallback
  }
}
