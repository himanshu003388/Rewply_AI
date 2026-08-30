import { calculateRecurringIssues } from '@/lib/api/recurring-issues'

export type ActionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type ActionImpact = 'HIGH' | 'MEDIUM' | 'LOW'
export type ActionStatus = 'pending' | 'investigating' | 'dismissed' | 'completed'

export interface AIActionItem {
  id: string
  priority: ActionPriority
  category: string
  problem: string
  evidence: string
  recommended_action: string
  expected_impact: ActionImpact
  status: ActionStatus
  updated_at?: string
  source_review_examples: Array<{
    id: string
    customer_name: string
    platform: string
    rating: number
    review_text: string
    created_at: string
  }>
}

// In-memory status store for session persistence
const actionStatusStore: Record<string, { status: ActionStatus; updated_at: string }> = {}

/**
 * Generate prioritized business actions from structured review intelligence and recurring issues
 */
export async function getPrioritizedActions(): Promise<AIActionItem[]> {
  const { issues } = await calculateRecurringIssues()

  const actions: AIActionItem[] = []

  // Generate actions from recurring problem clusters
  for (const issue of issues) {
    const isCritical = issue.severity_level === 'Critical' || issue.severity_score >= 8
    const isHigh = issue.severity_level === 'High' || issue.severity_score >= 6

    const priority: ActionPriority = isCritical
      ? 'CRITICAL'
      : isHigh
      ? 'HIGH'
      : issue.severity_level === 'Medium'
      ? 'MEDIUM'
      : 'LOW'

    const impact: ActionImpact = isCritical || isHigh ? 'HIGH' : 'MEDIUM'

    let problem = ''
    let recommendedAction = ''

    if (issue.category === 'Delivery') {
      problem = `Delivery delays are increasing (${issue.mention_count} mentions).`
      recommendedAction =
        'Review evening courier dispatch stacking limits and tighten promised delivery time algorithms during peak 6-9 PM hours.'
    } else if (issue.category === 'Food Quality') {
      problem = `Food quality and temperature complaints reported in ${issue.mention_count} customer reviews.`
      recommendedAction =
        'Audit kitchen grill timer calibration and transition to ventilated fry packaging to prevent sogginess.'
    } else if (issue.category === 'Billing') {
      problem = `Billing disputes and checkout promo friction affecting ${issue.mention_count} orders.`
      recommendedAction =
        'Streamline in-app coupon code validation and clarify refund policy messaging during checkout.'
    } else if (issue.category === 'Packaging') {
      problem = `Damaged packaging and drink spills noted in ${issue.mention_count} orders.`
      recommendedAction =
        'Implement spill-resistant drink cup holders and reinforced paper bags for multi-item orders.'
    } else if (issue.category === 'Customer Service') {
      problem = `Courier and customer support attitude friction reported in ${issue.mention_count} reviews.`
      recommendedAction =
        'Conduct refresher training on customer de-escalation for support reps and review courier partner rating thresholds.'
    } else if (issue.category === 'App/Technical') {
      problem = `App tracking glitches and login errors reported in ${issue.mention_count} reviews.`
      recommendedAction =
        'Deploy hotfix for courier GPS live tracking and optimize mobile checkout error handling.'
    } else {
      problem = `${issue.issue_type} reported across ${issue.mention_count} customer touchpoints.`
      recommendedAction = 'Investigate operational logs and implement preventive quality controls.'
    }

    const evidence = `${issue.mention_count} customer reviews mention ${issue.issue_type.toLowerCase()} with an average urgency score of ${issue.average_urgency}/10 (${issue.percentage_of_negative_reviews}% of all complaints). Trend is ${issue.trend_direction} (${issue.trend_change_percentage !== null ? `${issue.trend_change_percentage > 0 ? '+' : ''}${issue.trend_change_percentage}%` : 'stable'}).`

    const actionId = `act-${issue.id}`
    const storedStatus = actionStatusStore[actionId]?.status || 'pending'
    const storedTime = actionStatusStore[actionId]?.updated_at

    actions.push({
      id: actionId,
      priority,
      category: issue.category,
      problem,
      evidence,
      recommended_action: recommendedAction,
      expected_impact: impact,
      status: storedStatus,
      updated_at: storedTime,
      source_review_examples: issue.example_reviews.map((r) => ({
        id: r.id,
        customer_name: r.customer_name,
        platform: r.platform,
        rating: r.rating,
        review_text: r.review_text,
        created_at: r.created_at,
      })),
    })
  }

  // Sort: Critical -> High -> Medium -> Low, then active status
  const priorityWeight: Record<ActionPriority, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  }

  actions.sort((a, b) => {
    if (priorityWeight[b.priority] !== priorityWeight[a.priority]) {
      return priorityWeight[b.priority] - priorityWeight[a.priority]
    }
    return a.problem.localeCompare(b.problem)
  })

  return actions
}

/**
 * Update the status of an AI Action item
 */
export async function updateActionStatus(
  actionId: string,
  status: ActionStatus
): Promise<{ success: boolean; actionId: string; status: ActionStatus }> {
  actionStatusStore[actionId] = {
    status,
    updated_at: new Date().toISOString(),
  }
  return { success: true, actionId, status }
}
