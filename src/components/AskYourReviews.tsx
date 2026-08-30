'use client'

import React, { useState } from 'react'
import {
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
  BarChart2,
  Quote,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Tag,
} from 'lucide-react'
import { AssistantAnswer } from '@/lib/ai/types'

const QUICK_PROMPTS = [
  'What should we fix first?',
  'Biggest problem?',
  'What’s getting worse?',
  'Why are customers unhappy?',
  'What are customers saying about delivery?',
  'Are our reviews improving?',
]

interface MessageEntry {
  question: string
  answer: AssistantAnswer
  timestamp: string
}

export function AskYourReviews() {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<MessageEntry[]>([])
  const [activeAnswer, setActiveAnswer] = useState<AssistantAnswer | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<string>('')

  const handleAsk = async (queryToAsk?: string) => {
    const q = (queryToAsk || question).trim()
    if (!q || isLoading) return

    setIsLoading(true)
    setCurrentQuestion(q)
    setQuestion('')

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })

      const json = await res.json()
      if (json.success && json.answer) {
        setActiveAnswer(json.answer)
        setHistory((prev) => [
          { question: q, answer: json.answer, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          ...prev,
        ])
      } else {
        alert(json.error || 'Failed to get an answer from Ask Your Reviews.')
      }
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Ask Your Reviews</h3>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-3 h-3" /> Data-Grounded AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Query aggregated customer intelligence and root causes in natural language
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-gray-400 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          <span>Strict non-hallucination filter</span>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider block">
          Suggested Questions:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(prompt)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-indigo-400 dark:bg-[#06080e] dark:border-white/5 dark:hover:border-indigo-500/50 dark:hover:bg-gray-900/50 text-xs font-medium dark:text-gray-300 dark:hover:text-white transition-all disabled:opacity-50 text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleAsk()
        }}
        className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 dark:bg-[#06080e] border border-slate-300 dark:border-white/5 focus-within:border-indigo-500 transition-colors"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything about your reviews (e.g. 'What should we fix first?', 'Why are ratings dropping?')..."
          className="flex-1 px-3.5 py-2 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Ask</span>
        </button>
      </form>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 animate-pulse space-y-3">
          <div className="h-4 w-1/3 bg-slate-200 dark:bg-gray-800 rounded"></div>
          <div className="h-3 w-full bg-slate-200 dark:bg-gray-800/80 rounded"></div>
          <div className="h-3 w-5/6 bg-slate-200 dark:bg-gray-800/60 rounded"></div>
        </div>
      )}

      {/* Active Answer Card */}
      {activeAnswer && !isLoading && (
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-[#06080e] border border-slate-200 dark:border-white/5 shadow-sm space-y-4 animate-in fade-in duration-200">
          {/* Question Tag */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-3">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>&ldquo;{currentQuestion}&rdquo;</span>
            </span>
            <span className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">Data-Grounded Response</span>
          </div>

          {/* 1. Concise Answer */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 tracking-wider block">
              Direct Answer
            </span>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-gray-100 leading-relaxed font-normal">
              {activeAnswer.concise_answer}
            </p>
          </div>

          {/* 2. Supporting Statistics & Relevant Evidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Statistics */}
            {activeAnswer.supporting_statistics && activeAnswer.supporting_statistics.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider flex items-center gap-1">
                  <BarChart2 className="w-3 h-3" /> Supporting Statistics
                </span>
                <ul className="space-y-1 text-[11px] text-slate-700 dark:text-gray-300">
                  {activeAnswer.supporting_statistics.map((stat, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{stat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Evidence & Quotes */}
            {activeAnswer.relevant_evidence && activeAnswer.relevant_evidence.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1">
                  <Quote className="w-3 h-3" /> Customer Feedback Evidence
                </span>
                <ul className="space-y-1 text-[11px] text-slate-700 dark:text-gray-300">
                  {activeAnswer.relevant_evidence.map((ev, i) => (
                    <li key={i} className="flex items-start gap-1.5 italic">
                      <span className="text-amber-500 dark:text-amber-400 shrink-0">•</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 3. Recommended Action */}
          {activeAnswer.recommended_action && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 tracking-wider flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Recommended Action
              </span>
              <p className="text-xs text-indigo-950 dark:text-indigo-100 font-medium leading-relaxed">
                {activeAnswer.recommended_action}
              </p>
            </div>
          )}

          {/* Referenced Issues */}
          {activeAnswer.referenced_issues && activeAnswer.referenced_issues.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <Tag className="w-3 h-3 text-slate-400 dark:text-gray-500" />
              <span className="text-[10px] text-slate-500 dark:text-gray-500">Referenced Categories:</span>
              {activeAnswer.referenced_issues.map((iss, i) => (
                <span
                  key={i}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-gray-900/50 border border-slate-300 dark:border-white/5 text-slate-700 dark:text-gray-300"
                >
                  {iss}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Drawer Accordion (if multiple queries made) */}
      {history.length > 1 && (
        <div className="border-t border-slate-200 dark:border-white/5 pt-4 space-y-2">
          <span className="text-[11px] uppercase font-bold text-slate-500 dark:text-gray-500 tracking-wider block">
            Previous Inquiries in this Session:
          </span>
          <div className="space-y-1.5">
            {history.slice(1, 4).map((h, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentQuestion(h.question)
                  setActiveAnswer(h.answer)
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#06080e] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 text-left flex items-center justify-between text-xs text-slate-700 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                <span className="truncate">&ldquo;{h.question}&rdquo;</span>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-gray-500 shrink-0 ml-2">
                  <span>{h.timestamp}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 dark:text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
