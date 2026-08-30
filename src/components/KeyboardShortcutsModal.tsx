'use client'

import React from 'react'
import { X, Keyboard, Sparkles } from 'lucide-react'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null

  const shortcuts = [
    { key: '/', desc: 'Focus live review search', category: 'Navigation' },
    { key: 'J / K', desc: 'Navigate between review cards up/down', category: 'Inbox Triage' },
    { key: 'Enter', desc: 'Open selected review details & AI draft', category: 'Inbox Triage' },
    { key: 'Cmd + Enter', desc: 'Approve & reply to AI draft immediately', category: 'Actions' },
    { key: 'R', desc: 'Regenerate AI response draft', category: 'Actions' },
    { key: '1 - 5', desc: 'Switch draft tone (Empathetic, Apologetic, etc.)', category: 'Response Editor' },
    { key: 'Esc', desc: 'Close any active modal or overlay', category: 'Global' },
    { key: '?', desc: 'Show this keyboard shortcuts cheat-sheet', category: 'Global' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Keyboard Power-User Hotkeys</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">Navigate and triage reviews 10x faster</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-gray-900/40 border border-slate-100 dark:border-white/5"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-slate-700 dark:text-gray-300 font-medium">{sc.desc}</span>
                <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-gray-800">
                  {sc.category}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs font-mono font-bold text-slate-800 dark:text-white shadow-xs">
                  {sc.key}
                </kbd>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-gray-800/80 pt-4">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Fast-triage enabled
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  )
}
