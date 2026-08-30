export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SentimentType = 'positive' | 'negative' | 'neutral' | 'mixed'
export type EmotionType =
  | 'happy'
  | 'excited'
  | 'satisfied'
  | 'neutral'
  | 'concerned'
  | 'disappointed'
  | 'frustrated'
  | 'angry'

export type PrimaryIssueType =
  | 'delivery'
  | 'food_quality'
  | 'customer_service'
  | 'pricing'
  | 'billing'
  | 'packaging'
  | 'app_technical'
  | 'order_accuracy'
  | 'other'

export type IntentType =
  | 'praise'
  | 'complaint'
  | 'suggestion'
  | 'question'
  | 'refund_request'
  | 'other'

export type PriorityType = 'critical' | 'high' | 'medium' | 'low' | 'P1' | 'P2' | 'P3'
export type SuggestedActionType = 'escalate' | 'respond_quickly' | 'respond' | 'monitor'

export interface ReviewAnalysis {
  sentiment: SentimentType
  sentiment_score?: number
  emotion: EmotionType | string
  primary_issue?: PrimaryIssueType
  sub_issues?: string[]
  intent?: IntentType
  urgency_score?: number
  urgency_reason?: string
  priority: PriorityType
  extracted_keywords?: string[]
  estimated_business_impact?: string
  suggested_action?: SuggestedActionType
  response_tone?: string
  // Legacy / UI compatibility helper
  issue?: string
  urgency?: 'low' | 'medium' | 'high'
}

export interface SentimentBreakdown {
  positive: number
  neutral: number
  negative: number
}

export interface Database {
  public: {
    Tables: {
      reviews: {
        Row: {
          id: string
          platform: 'google' | 'yelp' | 'trustpilot' | string
          customer_name: string
          review_text: string
          rating: number
          created_at: string
          analysis: ReviewAnalysis
          ai_response: string | null
          response_status: 'pending' | 'approved' | 'sent'
        }
        Insert: {
          id?: string
          platform: 'google' | 'yelp' | 'trustpilot' | string
          customer_name: string
          review_text: string
          rating: number
          created_at?: string
          analysis: ReviewAnalysis | Json
          ai_response?: string | null
          response_status?: 'pending' | 'approved' | 'sent'
        }
        Update: {
          id?: string
          platform?: 'google' | 'yelp' | 'trustpilot' | string
          customer_name?: string
          review_text?: string
          rating?: number
          created_at?: string
          analysis?: ReviewAnalysis | Json
          ai_response?: string | null
          response_status?: 'pending' | 'approved' | 'sent'
        }
      }
      issues: {
        Row: {
          id: string
          issue_type: string
          category: string
          mention_count: number
          trend_direction: 'up' | 'down' | 'stable' | string
          severity_score: number
          created_at: string
        }
        Insert: {
          id?: string
          issue_type: string
          category: string
          mention_count?: number
          trend_direction?: 'up' | 'down' | 'stable' | string
          severity_score: number
          created_at?: string
        }
        Update: {
          id?: string
          issue_type?: string
          category?: string
          mention_count?: number
          trend_direction?: 'up' | 'down' | 'stable' | string
          severity_score?: number
          created_at?: string
        }
      }
      business_metrics: {
        Row: {
          id: string
          reputation_score: number
          total_reviews: number
          sentiment_breakdown: SentimentBreakdown
          calculated_at: string
        }
        Insert: {
          id?: string
          reputation_score: number
          total_reviews: number
          sentiment_breakdown: SentimentBreakdown | Json
          calculated_at?: string
        }
        Update: {
          id?: string
          reputation_score?: number
          total_reviews?: number
          sentiment_breakdown?: SentimentBreakdown | Json
          calculated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']

export type Issue = Database['public']['Tables']['issues']['Row']
export type IssueInsert = Database['public']['Tables']['issues']['Insert']
export type IssueUpdate = Database['public']['Tables']['issues']['Update']

export type BusinessMetric = Database['public']['Tables']['business_metrics']['Row']
export type BusinessMetricInsert = Database['public']['Tables']['business_metrics']['Insert']
export type BusinessMetricUpdate = Database['public']['Tables']['business_metrics']['Update']
