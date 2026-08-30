'use client'

import React from 'react'
import {
  LayoutGrid,
  Inbox,
  Zap,
  BarChart3,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  PlusCircle,
  Play,
  Database,
  Store,
  Sun,
  Moon,
  Flame,
  Clock,
  ThumbsDown,
  Layers,
  Filter,
} from 'lucide-react'
import { useTheme } from '@/lib/providers/theme-provider'
import { QuickFilter } from './ReviewInboxFilters'

export type ViewMode =
  | '3-column'
  | 'inbox'
  | 'actions'
  | 'problems'
  | 'insights'
  | 'assistant'
  | 'analytics'

interface SidebarProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  isMobileOpen: boolean
  onCloseMobile: () => void
  // Counts for badges
  totalReviews?: number
  unansweredReviews?: number
  criticalReviews?: number
  actionsCount?: number
  problemsCount?: number
  // Quick Filters
  activeFilter?: QuickFilter
  onFilterChange?: (filter: QuickFilter) => void
  selectedPlatform?: string
  onPlatformChange?: (platform: string) => void
  // Demo & Simulation
  isDemoModeActive?: boolean
  onToggleDemoMode?: () => void
  onOpenSimulate?: () => void
  isUsingFallback?: boolean
}

export function Sidebar({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  totalReviews = 0,
  unansweredReviews = 0,
  criticalReviews = 0,
  actionsCount = 0,
  problemsCount = 0,
  activeFilter = 'all',
  onFilterChange,
  selectedPlatform = 'all',
  onPlatformChange,
  isDemoModeActive = false,
  onToggleDemoMode,
  onOpenSimulate,
  isUsingFallback = true,
}: SidebarProps) {
  const { toggleTheme, isDark } = useTheme()

  const navItems = [
    {
      id: '3-column' as ViewMode,
      label: 'Overview Grid',
      icon: LayoutGrid,
      badge: null,
      description: 'Unified command center',
    },
    {
      id: 'inbox' as ViewMode,
      label: 'Review Inbox',
      icon: Inbox,
      badge: unansweredReviews > 0 ? `${unansweredReviews} unhandled` : `${totalReviews}`,
      badgeColor: unansweredReviews > 0 ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400',
      description: 'Stream & AI triage',
    },
    {
      id: 'actions' as ViewMode,
      label: 'AI Action Center',
      icon: Zap,
      badge: actionsCount > 0 ? `${actionsCount} actions` : null,
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      description: 'One-click operational tasks',
    },
    {
      id: 'problems' as ViewMode,
      label: 'Recurring Problems',
      icon: BarChart3,
      badge: problemsCount > 0 ? `${problemsCount} clusters` : null,
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      description: 'Root causes & churn risks',
    },
    {
      id: 'insights' as ViewMode,
      label: 'AI Insights',
      icon: Lightbulb,
      badge: 'Gemini 2.5',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
      description: 'Strategic summaries',
    },
    {
      id: 'assistant' as ViewMode,
      label: 'Ask AI Assistant',
      icon: MessageSquare,
      badge: 'Chat',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      description: 'Natural language queries',
    },
    {
      id: 'analytics' as ViewMode,
      label: 'Analytics & Charts',
      icon: TrendingUp,
      badge: null,
      description: 'Telemetry visualizations',
    },
  ]

  const platforms = [
    { id: 'all', label: 'All Channels', icon: '🌐' },
    { id: 'google', label: 'Google', icon: '🔍' },
    { id: 'yelp', label: 'Yelp', icon: '⭐' },
    { id: 'ubereats', label: 'Uber Eats', icon: '🛵' },
    { id: 'deliveroo', label: 'Deliveroo', icon: '🦘' },
    { id: 'doordash', label: 'DoorDash', icon: '🚪' },
  ]

  const quickFilterShortcuts: Array<{
    id: QuickFilter
    label: string
    icon: React.ComponentType<{ className?: string }>
    color: string
  }> = [
    { id: 'critical', label: 'Critical (P1)', icon: Flame, color: 'text-rose-500' },
    { id: 'unanswered', label: 'Pending Reply', icon: Clock, color: 'text-indigo-500' },
    { id: 'negative', label: 'Negative Sentiment', icon: ThumbsDown, color: 'text-amber-500' },
  ]

  const handleNavClick = (viewId: ViewMode) => {
    onViewChange(viewId)
    if (isMobileOpen) {
      onCloseMobile()
    }
  }

  const handlePlatformClick = (platformId: string) => {
    if (onPlatformChange) {
      onPlatformChange(platformId)
      if (currentView !== 'inbox' && currentView !== '3-column') {
        onViewChange('inbox')
      }
    }
    if (isMobileOpen) {
      onCloseMobile()
    }
  }

  const handleFilterClick = (filterId: QuickFilter) => {
    if (onFilterChange) {
      onFilterChange(activeFilter === filterId ? 'all' : filterId)
      if (currentView !== 'inbox' && currentView !== '3-column') {
        onViewChange('inbox')
      }
    }
    if (isMobileOpen) {
      onCloseMobile()
    }
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:sticky top-0 z-40 h-screen flex flex-col justify-between
          bg-white dark:bg-[#070a12] border-r border-slate-200/90 dark:border-white/5
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64 lg:w-72'}
        `}
      >
        {/* Top Header / Brand */}
        <div className="flex flex-col">
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-white/5">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20 border border-indigo-400/30">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight truncate">
                      Rewply AI
                    </span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      v2.0
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-gray-400 truncate">
                    Reputation Command
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle / Mobile Close Button */}
            <div className="flex items-center">
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>

              <button
                onClick={onToggleCollapse}
                className="hidden md:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-gray-500 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Action Buttons (Simulate & Demo) */}
          {(!isCollapsed || isMobileOpen) ? (
            <div className="p-3 border-b border-slate-200/80 dark:border-white/5 space-y-2">
              {onOpenSimulate && (
                <button
                  onClick={onOpenSimulate}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Simulate Live Review</span>
                </button>
              )}

              {onToggleDemoMode && (
                <button
                  onClick={onToggleDemoMode}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isDemoModeActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isDemoModeActive ? 'Exit Demo Guide' : 'Guided Demo Tour'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-2 border-b border-slate-200/80 dark:border-white/5 flex flex-col items-center gap-1.5">
              {onOpenSimulate && (
                <button
                  onClick={onOpenSimulate}
                  title="Simulate Live Review"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              )}
              {onToggleDemoMode && (
                <button
                  onClick={onToggleDemoMode}
                  title={isDemoModeActive ? 'Exit Demo' : 'Start Demo Tour'}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                    isDemoModeActive
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Navigation Views */}
          <div className="space-y-1">
            {(!isCollapsed || isMobileOpen) && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-2">
                Core Navigation
              </p>
            )}
            {navItems.map((item) => {
              const isActive = currentView === item.id
              const Icon = item.icon

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? `${item.label} - ${item.description}` : undefined}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative
                    ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                        : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5'
                    }
                    ${isCollapsed ? 'justify-center px-2' : ''}
                  `}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                    }`}
                  />

                  {(!isCollapsed || isMobileOpen) && (
                    <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 ml-1.5 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badgeColor || 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Collapsed Active Indicator Dot */}
                  {isCollapsed && isActive && (
                    <span className="absolute right-1.5 w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Quick Platform Filter Channels */}
          {(!isCollapsed || isMobileOpen) && onPlatformChange && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center justify-between px-3 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                  Review Channels
                </span>
                <Layers className="w-3 h-3 text-slate-400 dark:text-gray-500" />
              </div>
              <div className="grid grid-cols-2 gap-1.5 px-1">
                {platforms.map((p) => {
                  const isSelected = selectedPlatform.toLowerCase() === p.id.toLowerCase()
                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePlatformClick(p.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800/60 dark:text-indigo-300 font-semibold'
                          : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="text-xs">{p.icon}</span>
                      <span className="truncate">{p.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quick Priority Shortcuts */}
          {(!isCollapsed || isMobileOpen) && onFilterChange && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-white/5">
              <div className="flex items-center justify-between px-3 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                  Urgency Triage
                </span>
                <Filter className="w-3 h-3 text-slate-400 dark:text-gray-500" />
              </div>
              <div className="space-y-1 px-1">
                {quickFilterShortcuts.map((q) => {
                  const isSelected = activeFilter === q.id
                  const Icon = q.icon
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleFilterClick(q.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        isSelected
                          ? 'bg-slate-200 dark:bg-gray-800 text-slate-900 dark:text-white font-bold'
                          : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${q.color}`} />
                        <span>{q.label}</span>
                      </div>
                      {q.id === 'critical' && criticalReviews > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400">
                          {criticalReviews}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section: Active Business, Telemetry & Theme Switch */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-[#05070c]/50 space-y-2">
          {(!isCollapsed || isMobileOpen) ? (
            <>
              {/* Business Badge */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-center flex-shrink-0">
                    <Store className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      BurgerHub Delivery
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate">
                      Central London Branch
                    </p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] flex-shrink-0" />
              </div>

              {/* Status & Theme Toggle Bar */}
              <div className="flex items-center justify-between pt-1 text-xs">
                {/* Database Indicator */}
                <div
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold border ${
                    !isUsingFallback
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-300'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800/40 dark:text-indigo-300'
                  }`}
                  title={!isUsingFallback ? 'Connected to live Supabase DB' : 'Dataset Ready mode'}
                >
                  <Database className="w-3 h-3" />
                  <span>{!isUsingFallback ? 'Supabase Live' : 'DB Ready'}</span>
                </div>

                {/* Theme Mode Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle dark/light theme"
                >
                  {isDark ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] font-medium">Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[10px] font-medium">Dark</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
