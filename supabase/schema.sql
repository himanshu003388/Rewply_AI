-- =======================================================
-- Rewply AI Database Schema (Supabase PostgreSQL)
-- =======================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL CHECK (platform IN ('google', 'yelp', 'trustpilot')),
    customer_name TEXT NOT NULL,
    review_text TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
    ai_response TEXT,
    response_status TEXT NOT NULL DEFAULT 'pending' CHECK (response_status IN ('pending', 'approved', 'sent'))
);

-- Indexes for fast querying & filtering
CREATE INDEX IF NOT EXISTS idx_reviews_platform ON public.reviews(platform);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_response_status ON public.reviews(response_status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_analysis_sentiment ON public.reviews USING gin (analysis);

-- 2. ISSUES TABLE
CREATE TABLE IF NOT EXISTS public.issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_type TEXT NOT NULL,
    category TEXT NOT NULL,
    mention_count INTEGER NOT NULL DEFAULT 0,
    trend_direction TEXT NOT NULL DEFAULT 'stable' CHECK (trend_direction IN ('up', 'down', 'stable')),
    severity_score INTEGER NOT NULL CHECK (severity_score >= 1 AND severity_score <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issues_category ON public.issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_severity ON public.issues(severity_score DESC);

-- 3. BUSINESS METRICS TABLE
CREATE TABLE IF NOT EXISTS public.business_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reputation_score INTEGER NOT NULL,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    sentiment_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;

-- Public read / write policies for development / dashboard access
CREATE POLICY "Allow public read access on reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert on reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on reviews" ON public.reviews FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on issues" ON public.issues FOR SELECT USING (true);
CREATE POLICY "Allow public insert on issues" ON public.issues FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on issues" ON public.issues FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on business_metrics" ON public.business_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public insert on business_metrics" ON public.business_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on business_metrics" ON public.business_metrics FOR UPDATE USING (true);
