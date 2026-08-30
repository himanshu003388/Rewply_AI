'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  Copy,
  Check,
  Share2,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  Star,
  Award,
  TrendingUp,
  RefreshCw,
  Zap,
  Building2,
  Sliders,
} from 'lucide-react'
import { Review } from '@/types/database.types'

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z" />
    </svg>
  )
}

type PostStyle = 'customer_spotlight' | 'turnaround_story' | 'team_milestone' | 'thought_leadership'
type PostTone = 'inspiring' | 'authentic' | 'professional' | 'celebratory'

interface LinkedInBoastProps {
  reviews: Review[]
  businessName?: string
}

export function LinkedInBoast({ reviews, businessName = 'BurgerHub Delivery' }: LinkedInBoastProps) {
  const [selectedStyle, setSelectedStyle] = useState<PostStyle>('customer_spotlight')
  const [selectedTone, setSelectedTone] = useState<PostTone>('inspiring')
  const [customNote, setCustomNote] = useState('')
  const [generatedPost, setGeneratedPost] = useState('')
  const [postHeadline, setPostHeadline] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview')

  const positiveReviews = reviews.filter((r) => r.rating >= 4 || r.analysis?.sentiment === 'positive').slice(0, 3)
  const featuredReview = positiveReviews[0] || reviews[0]

  const styleOptions: Array<{ id: PostStyle; label: string; desc: string; icon: React.ReactNode }> = [
    {
      id: 'customer_spotlight',
      label: 'Customer Spotlight',
      desc: 'Highlight 5-star customer praise and thank loyal customers',
      icon: <Star className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'turnaround_story',
      label: 'Turnaround Story',
      desc: 'How we listened to feedback and fixed kitchen bottlenecks',
      icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 'team_milestone',
      label: 'Team Milestone',
      desc: 'Celebrate 500+ positive reviews & praise frontline staff',
      icon: <Award className="w-4 h-4 text-indigo-500" />,
    },
    {
      id: 'thought_leadership',
      label: 'AI & CX Innovation',
      desc: 'How AI review triage cut response time from days to 5 mins',
      icon: <Zap className="w-4 h-4 text-blue-500" />,
    },
  ]

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/linkedin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style: selectedStyle,
          tone: selectedTone,
          customNote,
          businessName,
        }),
      })
      const data = await res.json()
      if (data.success && data.result) {
        setGeneratedPost(data.result.post)
        setPostHeadline(data.result.headline || '')
        setHashtags(data.result.hashtags || [])
      } else {
        // Fallback
        generateLocalFallback()
      }
    } catch {
      generateLocalFallback()
    } finally {
      setIsGenerating(false)
    }
  }

  const generateLocalFallback = () => {
    const q1 = positiveReviews[0]?.review_text || 'Incredible service, juicy burgers and super fast delivery!'
    const a1 = positiveReviews[0]?.customer_name || 'Sarah M.'
    const q2 = positiveReviews[1]?.review_text || 'Resolved my order issue in under 5 minutes. Outstanding customer care!'
    const a2 = positiveReviews[1]?.customer_name || 'Mike D.'

    let template = ''
    if (selectedStyle === 'turnaround_story') {
      template = `📈 How we turned customer feedback into a 30% faster delivery turnaround at ${businessName}:

A month ago, a customer pointed out that weekend peak delivery was hitting 50+ mins. 

Instead of hiding from constructive reviews, we used AI review triage to pinpoint the exact kitchen bottleneck. Within 72 hours, we redesigned our dispatch workflow and added dedicated prep stations.

Today's feedback speaks for itself:
"${q1}" — ${a1}

The biggest lesson? Listen faster, adapt immediately, and treat customer reviews as free operational consulting.

How does your team handle negative review turnarounds?

#SmallBusiness #CustomerExperience #OperationalExcellence #ContinuousImprovement #Leadership`
    } else if (selectedStyle === 'thought_leadership') {
      template = `⚡ Why small businesses can no longer afford to let negative reviews sit unanswered for days:

According to industry data, 88% of consumers check review responses before ordering. Yet, busy business owners rarely have hours every evening to manually craft thoughtful replies across Google, Yelp, and DoorDash.

At ${businessName}, we deployed Rewply AI to:
✅ Monitor all review channels in real-time
✅ Triage urgent complaints with high-priority escalation
✅ Generate brand-aligned, empathetic responses in seconds
✅ Uncover root-cause recurring bottlenecks before they become PR issues

Result? Response SLA reduced by 85% and our customer retention reached an all-time high.

Are you using AI to safeguard your brand reputation yet?

#AIForBusiness #CustomerSuccess #SmallBusinessGrowth #ReputationManagement #Innovation`
    } else if (selectedStyle === 'team_milestone') {
      template = `🎉 Proud moment: We just crossed 500+ five-star reviews at ${businessName}!

Behind every 5-star rating is a kitchen team that showed up at 6 AM and courier drivers who braved the evening rush with a smile.

"${q1}" — ${a1}
"${q2}" — ${a2}

A heartfelt thank you to our entire crew for putting customer satisfaction at the heart of everything we do! 🙌

#TeamAppreciation #Milestone #CustomerLoyalty #SmallBusinessVictory #CompanyCulture`
    } else {
      template = `🚀 Customer obsession is our #1 growth engine at ${businessName}!

When we see feedback like this coming through our channels, it reminds us why our team works tirelessly every single day:

"${q1}" — ${a1}
"${q2}" — ${a2}

${customNote ? `💡 Note: ${customNote}\n` : ''}
We take every single review seriously—using AI intelligence to spot trends early and continuous feedback loops to keep quality at the highest standard.

A massive shoutout to our community for trusting us! ❤️

#CustomerObsession #SmallBusiness #CustomerExperience #GrowthMindset #BrandTrust`
    }

    setGeneratedPost(template)
    setPostHeadline(`🚀 Customer Success & Operational Excellence at ${businessName}`)
    setHashtags(['#CustomerObsession', '#SmallBusiness', '#CustomerExperience', '#AIForBusiness', '#Leadership'])
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const wordCount = generatedPost ? generatedPost.split(/\s+/).filter(Boolean).length : 0
  const charCount = generatedPost.length

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20 shadow-sm shadow-[#0A66C2]/20">
              <LinkedInIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  LinkedIn Social Showcase & Thought Leadership Generator
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20">
                  <Sparkles className="w-3 h-3" /> Viral AI Copywriter
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Transform positive customer reviews, team milestones, and operational turnaround wins into high-engagement LinkedIn posts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              ★ {positiveReviews.length} 5-Star Reviews Available
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls on Left, LinkedIn Mockup on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Style & Tone Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Post Style Selector */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              1. Select Post Narrative Style
            </label>
            <div className="space-y-2.5">
              {styleOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedStyle(opt.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    selectedStyle === opt.id
                      ? 'border-[#0A66C2] bg-[#0A66C2]/5 dark:bg-[#0A66C2]/10 shadow-sm'
                      : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 bg-slate-50/50 dark:bg-gray-900/30'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shrink-0">
                    {opt.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                      <span>{opt.label}</span>
                      {selectedStyle === opt.id && (
                        <span className="w-2 h-2 rounded-full bg-[#0A66C2]"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tone & Custom Note */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider block mb-2">
                2. Tone of Voice
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['inspiring', 'authentic', 'professional', 'celebratory'] as PostTone[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTone(t)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                      selectedTone === t
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider block mb-1.5">
                3. Additional Founder / Context Note (Optional)
              </label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. We added 2 extra couriers on Friday nights to eliminate delivery delays..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#0A66C2] hover:bg-[#084e96] text-sm font-bold text-white shadow-lg shadow-[#0A66C2]/25 transition-all hover-lift disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Viral Post via Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {generatedPost ? 'Regenerate LinkedIn Post' : 'Generate LinkedIn Post'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Interactive LinkedIn Post Preview Mockup (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
            
            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <LinkedInIcon className="w-4 h-4 text-[#0A66C2]" />
                  LinkedIn Feed Preview
                </span>
                {generatedPost && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    ({wordCount} words • {charCount} chars)
                  </span>
                )}
              </div>

              {generatedPost && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-xs font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-100 transition-colors shadow-sm"
                    title="Copy to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <a
                    href="https://www.linkedin.com/feed/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-xs font-bold text-white shadow-sm transition-all hover-lift"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Post to Feed</span>
                  </a>
                </div>
              )}
            </div>

            {/* LinkedIn Post Box Container */}
            {!generatedPost ? (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-2xl bg-slate-50/50 dark:bg-[#06080e]/50 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center border border-[#0A66C2]/20">
                  <LinkedInIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-gray-200">No Post Generated Yet</h4>
                  <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm mt-1">
                    Select your preferred storytelling style on the left and click &quot;Generate LinkedIn Post&quot; to create a viral, brand-building update.
                  </p>
                </div>
                <button
                  onClick={handleGenerate}
                  className="px-5 py-2.5 rounded-xl bg-[#0A66C2] text-white text-xs font-bold shadow-md shadow-[#0A66C2]/20 hover-lift"
                >
                  Generate First Post
                </button>
              </div>
            ) : (
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#06080e] shadow-sm space-y-4 animate-in fade-in duration-300">
                
                {/* LinkedIn Author Header Mockup */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{businessName}</span>
                        <span className="text-[10px] text-slate-400">• 1st</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-gray-400">
                        Food Delivery & Restaurant Services • 1,420 followers
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        Just now • 🌐 Public
                      </p>
                    </div>
                  </div>

                  <div className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                    •••
                  </div>
                </div>

                {/* Post Body */}
                <div className="text-xs sm:text-sm text-slate-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed font-sans select-text">
                  {generatedPost}
                </div>

                {/* Embedded Visual Graphic Card Mockup */}
                {featuredReview && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-[#0A66C2]/40 text-white border border-indigo-500/20 shadow-md relative overflow-hidden">
                    <div className="absolute top-2 right-3 text-[10px] font-bold text-indigo-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Customer Verified
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs italic text-slate-100 line-clamp-3 mb-2 font-serif">
                      &quot;{featuredReview.review_text}&quot;
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-indigo-200">
                      <span className="font-semibold">{featuredReview.customer_name} • {featuredReview.platform}</span>
                      <span className="font-bold text-white">{businessName}</span>
                    </div>
                  </div>
                )}

                {/* LinkedIn Engagement Bar Mockup */}
                <div className="border-t border-slate-100 dark:border-gray-800/80 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400 px-1">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px]">👍</div>
                      <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px]">❤️</div>
                      <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px]">👏</div>
                      <span className="ml-1 text-[10px]">You and 84 others</span>
                    </div>
                    <span className="text-[10px]">19 comments • 6 reposts</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-gray-800/60 pt-2 text-slate-600 dark:text-gray-400 text-xs font-semibold">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors">
                      <ThumbsUp className="w-4 h-4 text-blue-600" /> Like
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors">
                      <MessageSquare className="w-4 h-4" /> Comment
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors">
                      <Repeat2 className="w-4 h-4" /> Repost
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors">
                      <Send className="w-4 h-4" /> Send
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
