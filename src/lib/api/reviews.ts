import { createClient } from '@/lib/supabase/client'
import { Review, ReviewUpdate, Issue, BusinessMetric, ReviewAnalysis } from '@/types/database.types'
import { sampleReviews, sampleIssues, sampleBusinessMetrics } from '@/data/seed-data'

// Local in-memory store for fallback preview state mutations
const localReviews: Review[] = [...sampleReviews]
const localIssues: Issue[] = [...sampleIssues]
const localMetrics: BusinessMetric = { ...sampleBusinessMetrics }

export interface ReviewFilters {
  platform?: string
  rating?: number | 'all'
  sentiment?: string
  status?: string
  search?: string
}

export async function getReviews(filters?: ReviewFilters): Promise<{ data: Review[]; isUsingFallback: boolean }> {
  const supabase = createClient()

  if (supabase) {
    try {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false })

      if (filters?.platform && filters.platform !== 'all') {
        query = query.eq('platform', filters.platform)
      }
      if (filters?.rating && filters.rating !== 'all') {
        query = query.eq('rating', filters.rating)
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('response_status', filters.status)
      }

      const { data, error } = await query

      if (!error && data) {
        let results = data as Review[]
        if (filters?.sentiment && filters.sentiment !== 'all') {
          results = results.filter((r) => r.analysis?.sentiment === filters.sentiment)
        }
        if (filters?.search) {
          const q = filters.search.toLowerCase()
          results = results.filter(
            (r) =>
              r.customer_name.toLowerCase().includes(q) ||
              r.review_text.toLowerCase().includes(q) ||
              r.analysis?.issue?.toLowerCase().includes(q) ||
              r.analysis?.primary_issue?.toLowerCase().includes(q)
          )
        }
        return { data: results, isUsingFallback: false }
      }
    } catch (err) {
      console.warn('Supabase query failed, using local mock data:', err)
    }
  }

  // Fallback to local dataset
  let results = [...localReviews]

  if (filters?.platform && filters.platform !== 'all') {
    results = results.filter((r) => r.platform.toLowerCase() === filters.platform?.toLowerCase())
  }
  if (filters?.rating && filters.rating !== 'all') {
    results = results.filter((r) => r.rating === Number(filters.rating))
  }
  if (filters?.status && filters.status !== 'all') {
    results = results.filter((r) => r.response_status === filters.status)
  }
  if (filters?.sentiment && filters.sentiment !== 'all') {
    results = results.filter((r) => r.analysis?.sentiment === filters.sentiment)
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    results = results.filter(
      (r) =>
        r.customer_name.toLowerCase().includes(q) ||
        r.review_text.toLowerCase().includes(q) ||
        r.analysis?.issue?.toLowerCase().includes(q) ||
        r.analysis?.primary_issue?.toLowerCase().includes(q)
    )
  }

  return { data: results, isUsingFallback: !supabase }
}

export async function getReviewById(reviewId: string): Promise<Review | null> {
  const supabase = createClient()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single()

      if (!error && data) {
        return data as Review
      }
    } catch (err) {
      console.warn('Supabase getReviewById failed, checking local fallback:', err)
    }
  }

  const local = localReviews.find((r) => r.id === reviewId)
  return local || null
}

export async function updateReviewAnalysis(
  reviewId: string,
  analysis: ReviewAnalysis
): Promise<Review | null> {
  const supabase = createClient()
  if (supabase) {
    try {
      const updatePayload: ReviewUpdate = {
        analysis: analysis as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('reviews') as any)
        .update(updatePayload)
        .eq('id', reviewId)
        .select()
        .single()

      if (!error && data) {
        return data as Review
      }
    } catch (err) {
      console.warn('Supabase updateReviewAnalysis failed, mutating local fallback:', err)
    }
  }

  const idx = localReviews.findIndex((r) => r.id === reviewId)
  if (idx !== -1) {
    localReviews[idx] = {
      ...localReviews[idx],
      analysis,
    }
    return localReviews[idx]
  }
  return null
}

export async function getIssues(): Promise<{ data: Issue[]; isUsingFallback: boolean }> {
  const supabase = createClient()
  if (supabase) {
    try {
      const { data, error } = await supabase.from('issues').select('*').order('severity_score', { ascending: false })
      if (!error && data) {
        return { data: data as Issue[], isUsingFallback: false }
      }
    } catch (err) {
      console.warn('Supabase issues query failed, using fallback:', err)
    }
  }
  return { data: localIssues, isUsingFallback: !supabase }
}

export async function getBusinessMetrics(): Promise<{ data: BusinessMetric; isUsingFallback: boolean }> {
  const supabase = createClient()
  if (supabase) {
    try {
      const { data, error } = await supabase.from('business_metrics').select('*').order('calculated_at', { ascending: false }).limit(1).single()
      if (!error && data) {
        return { data: data as BusinessMetric, isUsingFallback: false }
      }
    } catch (err) {
      console.warn('Supabase business metrics query failed, using fallback:', err)
    }
  }
  return { data: localMetrics, isUsingFallback: !supabase }
}

export async function updateReviewStatus(
  reviewId: string,
  status: 'pending' | 'approved' | 'sent',
  updatedAiResponse?: string
): Promise<Review | null> {
  const supabase = createClient()
  if (supabase) {
    try {
      const updatePayload: ReviewUpdate = { response_status: status }
      if (updatedAiResponse !== undefined) {
        updatePayload.ai_response = updatedAiResponse
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('reviews') as any)
        .update(updatePayload)
        .eq('id', reviewId)
        .select()
        .single()

      if (!error && data) {
        return data as Review
      }
    } catch (err) {
      console.warn('Supabase update failed, mutating local fallback:', err)
    }
  }

  // Update in local fallback
  const idx = localReviews.findIndex((r) => r.id === reviewId)
  if (idx !== -1) {
    localReviews[idx] = {
      ...localReviews[idx],
      response_status: status,
      ...(updatedAiResponse !== undefined ? { ai_response: updatedAiResponse } : {}),
    }
    return localReviews[idx]
  }
  return null
}

export async function insertReview(review: Omit<Review, 'id'> & { id?: string }): Promise<Review> {
  const supabase = createClient()
  const newId = review.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  const newReview: Review = {
    ...review,
    id: newId,
    created_at: review.created_at || new Date().toISOString(),
    response_status: review.response_status || 'pending',
    ai_response: review.ai_response || null,
  }

  if (supabase) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('reviews') as any).insert(newReview).select().single()
      if (!error && data) {
        return data as Review
      }
    } catch (err) {
      console.warn('Supabase insertReview failed, adding to local fallback:', err)
    }
  }

  localReviews.unshift(newReview)
  return newReview
}

export async function resetDemoReviews(): Promise<{ count: number }> {
  localReviews.length = 0
  localReviews.push(...JSON.parse(JSON.stringify(sampleReviews)))
  return { count: localReviews.length }
}


