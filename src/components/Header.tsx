'use client'

import React from 'react'
import {
  Sparkles,
  Database,
  Store,
  Play,
  Sun,
  Moon,
  Menu,
  ChevronRight,
} from 'lucide-react'
import { useTheme } from '@/lib/providers/theme-provider'

interface HeaderProps {
  isUsingFallback?: boolean
  isDemoModeActive?: boolean
  onToggleDemoMode?: () => void
  onOpenMobileSidebar?: () => void
  currentViewTitle?: string
  children?: React.ReactNode
}

export function Header({
  isUsingFallback = true,
  isDemoModeActive = false,
  onToggleDemoMode,
  onOpenMobileSidebar,
  currentViewTitle = 'Command Center',
  children,
}: HeaderProps) {
  const { toggleTheme, isDark } = useTheme()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-white/5 bg-white/85 dark:bg-[#06080e]/85 backdrop-blur-md transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Mobile Hamburger & Section Breadcrumb */}
          <div className="flex items-center gap-3">
            {onOpenMobileSidebar && (
              <button
                onClick={onOpenMobileSidebar}
                className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Open navigation sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400 font-medium">
                <span className="hover:text-slate-800 dark:hover:text-gray-200">Rewply AI</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-gray-600" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                  {currentViewTitle}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-3 h-3" /> Gemini 2.5 AI
                </span>
              </div>
            </div>
          </div>

          {/* Right Actions: Demo Mode, Simulate Review, Theme & Badges */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Demo Mode Button (if provided) */}
            {onToggleDemoMode && (
              <button
                onClick={onToggleDemoMode}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isDemoModeActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:border-amber-500/50'
                }`}
                title="Launch 3-Minute Guided Buildathon Demo"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isDemoModeActive ? 'Exit Demo' : 'Demo Tour'}</span>
              </button>
            )}

            {children}

            {/* Active Business Badge (Desktop) */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-gray-900/60 border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-gray-400">
              <Store className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
              <span className="font-medium text-slate-800 dark:text-gray-200">BurgerHub</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            </div>

            {/* Supabase Connection Status Badge */}
            <div
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium ${
                !isUsingFallback
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800/60 dark:text-emerald-300'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800/50 dark:text-indigo-300'
              }`}
              title={
                !isUsingFallback
                  ? 'Connected to Live Supabase DB'
                  : 'Running in Local Dataset Mode (Provide Supabase env keys to sync live)'
              }
            >
              <Database className="w-3.5 h-3.5" />
              <span>{!isUsingFallback ? 'Live' : 'Ready'}</span>
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 dark:border-gray-800 dark:hover:border-gray-700 bg-slate-100 hover:bg-slate-200/80 dark:bg-gray-900 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20 transition-transform duration-300 rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600/20 transition-transform duration-300 -rotate-12 hover:rotate-0" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
