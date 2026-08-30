'use client'

import React from 'react'
import {
  Sparkles,
  Play,
  Sun,
  Moon,
  Menu,
  ChevronRight,
} from 'lucide-react'
import { useTheme } from '@/lib/providers/theme-provider'

interface HeaderProps {
  isDemoModeActive?: boolean
  onToggleDemoMode?: () => void
  onOpenMobileSidebar?: () => void
  currentViewTitle?: string
  children?: React.ReactNode
}

export function Header({
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
                <span>Rewply AI</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-gray-600" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                  {currentViewTitle}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-3 h-3" /> Gemini 2.5
                </span>
              </div>
            </div>
          </div>

          {/* Right Actions: Demo Tour, Simulate Review, DB Status Chip & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Demo Tour Button */}
            {onToggleDemoMode && (
              <button
                onClick={onToggleDemoMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isDemoModeActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:border-amber-500/50'
                }`}
                title="Launch 3-Minute Guided Buildathon Demo"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden xs:inline">{isDemoModeActive ? 'Exit Tour' : 'Demo Tour'}</span>
              </button>
            )}

            {/* Simulate Review Action Button */}
            {children}



            {/* Dark / Light Mode Toggle Button with Smooth Transform Animation */}
            <button
              onClick={toggleTheme}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 dark:border-gray-800 dark:hover:border-gray-700 bg-slate-100 hover:bg-slate-200/80 dark:bg-gray-900 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 overflow-hidden"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <Sun
                className={`w-4 h-4 text-amber-400 fill-amber-400/20 absolute transition-all duration-300 transform ${
                  isDark
                    ? 'rotate-0 scale-100 opacity-100'
                    : 'rotate-90 scale-0 opacity-0'
                }`}
              />
              <Moon
                className={`w-4 h-4 text-indigo-600 fill-indigo-600/20 absolute transition-all duration-300 transform ${
                  !isDark
                    ? 'rotate-0 scale-100 opacity-100'
                    : '-rotate-90 scale-0 opacity-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
