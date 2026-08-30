'use client'

import React from 'react'
import { Sparkles, Database, Store, Play } from 'lucide-react'

interface HeaderProps {
  isUsingFallback?: boolean
  isDemoModeActive?: boolean
  onToggleDemoMode?: () => void
  children?: React.ReactNode
}

export function Header({
  isUsingFallback = true,
  isDemoModeActive = false,
  onToggleDemoMode,
  children,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-sm border border-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">Rewply AI</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Buildathon
                </span>
              </div>
              <p className="text-xs text-gray-400">Intelligent Review Reputation Engine</p>
            </div>
          </div>

          {/* Right Actions, Demo Mode Toggle & DB Status */}
          <div className="flex items-center gap-2.5">
            {/* Demo Mode Button */}
            {onToggleDemoMode && (
              <button
                onClick={onToggleDemoMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isDemoModeActive
                    ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/20'
                    : 'bg-gray-950 hover:bg-gray-900 text-amber-400/90 border border-amber-500/20 hover:border-amber-500/40'
                }`}
                title="Launch 3-Minute Guided Buildathon Demo"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isDemoModeActive ? 'Exit Demo' : 'Demo Mode'}</span>
              </button>
            )}

            {children}

            {/* Active Business Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-950/50 border border-white/5 text-xs text-gray-400">
              <Store className="w-3.5 h-3.5 text-gray-500" />
              <span className="font-medium text-gray-200">BurgerHub Delivery</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            </div>

            {/* Supabase Connection Status Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                !isUsingFallback
                  ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                  : 'bg-indigo-950/40 border-indigo-800/50 text-indigo-300'
              }`}
              title={
                !isUsingFallback
                  ? 'Connected to Live Supabase DB'
                  : 'Running in Local Dataset Mode (Provide Supabase env keys to sync live)'
              }
            >
              <Database className="w-3.5 h-3.5" />
              <span>{!isUsingFallback ? 'Supabase Live' : 'Database Ready'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
