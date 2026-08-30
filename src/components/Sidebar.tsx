'use client'

import React from 'react'
import {
  Inbox,
  BarChart3,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Store,
} from 'lucide-react'

export type ViewMode =
  | 'inbox'
  | 'problems'
  | 'assistant'

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
  problemsCount?: number
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
  problemsCount = 0,
}: SidebarProps) {
  const navItems = [
    {
      id: 'inbox' as ViewMode,
      label: 'Review Inbox',
      icon: Inbox,
      badge: unansweredReviews > 0 ? `${unansweredReviews} need reply` : `${totalReviews} total`,
      badgeColor:
        unansweredReviews > 0
          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
          : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400',
      description: 'Read and reply to reviews',
    },
    {
      id: 'problems' as ViewMode,
      label: 'Top Problems',
      icon: BarChart3,
      badge: problemsCount > 0 ? `${problemsCount} issues found` : null,
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      description: 'See what needs fixing',
    },
    {
      id: 'assistant' as ViewMode,
      label: 'Ask AI',
      icon: MessageSquare,
      badge: null,
      badgeColor: '',
      description: 'Ask questions about your business',
    },
  ]

  const handleNavClick = (viewId: ViewMode) => {
    onViewChange(viewId)
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
        <div>
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
                    Review Manager
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
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {(!isCollapsed || isMobileOpen) && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-2">
              Navigation
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
                    isActive
                      ? 'text-white'
                      : 'text-slate-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
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
                            : item.badgeColor ||
                              'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300'
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

        {/* Bottom Section: Active Workspace / Business Context */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-[#05070c]/50">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-center flex-shrink-0">
                  <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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
              <span
                className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] flex-shrink-0"
                title="Branch Active & Connected"
              />
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <div
                className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-center relative"
                title="BurgerHub Delivery (Central London)"
              >
                <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
