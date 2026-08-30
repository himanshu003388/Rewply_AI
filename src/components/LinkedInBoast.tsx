'use client'

import React, { useState } from 'react'
import { Linkedin, Sparkles, Copy, Check, Share2 } from 'lucide-react'
import { Review } from '@/types/database.types'

interface LinkedInBoastProps {
  reviews: Review[]
}

export function LinkedInBoast({ reviews }: LinkedInBoastProps) {
  const [generatedPost, setGeneratedPost] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const positiveReviews = reviews.filter(r => r.rating === 5 || r.analysis?.sentiment === 'positive').slice(0, 3)

  const handleGenerate = () => {
    setIsGenerating(true)
    // Simulate AI generation delay
    setTimeout(() => {
      const template = `🚀 Excited to share some incredible customer feedback we've received at our business recently!

Customer obsession is our #1 priority. When we see feedback like this, it reminds us why we do what we do:

"${positiveReviews[0]?.review_text || 'Incredible service and amazing food!'}" - ${positiveReviews[0]?.customer_name || 'Sarah'}
"${positiveReviews[1]?.review_text || 'They resolved my issue in under 5 minutes.'}" - ${positiveReviews[1]?.customer_name || 'Mike'}

We are constantly monitoring our reviews and using AI to identify areas where we can improve faster. A huge shoutout to the team for maintaining our high standards! 

#CustomerSuccess #SmallBusiness #CustomerExperience #Growth #AI`
      setGeneratedPost(template)
      setIsGenerating(false)
    }, 1500)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm space-y-6 hover-lift">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm shadow-blue-500/20">
          <Linkedin className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Social Showcase Generator</h3>
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Share2 className="w-3 h-3" /> Engagement
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Use AI to generate a viral LinkedIn post bragging about your 5-star customer service.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {!generatedPost ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-2xl bg-slate-50/50 dark:bg-[#06080e]/50">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white shadow-md shadow-blue-600/30 transition-all hover-lift disabled:opacity-50 disabled:pointer-events-none"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Generating Post...
                </>
              ) : (
                <>
                  <Linkedin className="w-4 h-4" />
                  Generate LinkedIn Post
                </>
              )}
            </button>
            <p className="mt-3 text-xs text-slate-500">Analyzes your recent positive reviews to draft a post.</p>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#06080e] border border-slate-200 dark:border-white/5 relative">
              <button 
                onClick={handleCopy}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-500 transition-colors"
                title="Copy to clipboard"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-gray-300">
                {generatedPost}
              </pre>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setGeneratedPost('')}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 text-xs font-semibold text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors hover-lift"
              >
                Discard
              </button>
              <a
                href="https://www.linkedin.com/feed/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all hover-lift"
              >
                <Share2 className="w-4 h-4" />
                Post to LinkedIn
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
