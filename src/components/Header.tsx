'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  Play,
  Sun,
  Moon,
  Menu,
  ChevronRight,
  MapPin,
  Keyboard,
  ChevronDown,
  Building,
} from 'lucide-react'
import { useTheme } from '@/lib/providers/theme-provider'
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal'

interface HeaderProps {
  isDemoModeActive?: boolean
  onToggleDemoMode?: () => void
  onOpenMobileSidebar?: () => void
  currentViewTitle?: string
  selectedLocation?: string
  onLocationChange?: (location: string) => void
  children?: React.ReactNode
}

export function Header({
  isDemoModeActive = false,
  onToggleDemoMode,
  onOpenMobileSidebar,
  currentViewTitle = 'Command Center',
  selectedLocation = 'all',
  onLocationChange,
  children,
}: HeaderProps) {
  const { toggleTheme, isDark } = useTheme()
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false)

  const locations = [
    { id: 'all', label: 'All Branches (3 Locations)', tag: 'Enterprise' },
    { id: 'downtown', label: 'Downtown Flagship', tag: 'High Volume' },
    { id: 'westside', label: 'Westside Cloud Kitchen', tag: 'Delivery Only' },
    { id: 'airport', label: 'Airport Express Kiosk', tag: 'Fast Casual' },
  ]

  const currentLocationLabel = locations.find((l) => l.id === selectedLocation)?.label || 'All Branches (3 Locations)'

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-white/5 bg-white/85 dark:bg-[#06080e]/85 backdrop-blur-md transition-colors duration-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            
            {/* Left: Mobile Hamburger, Breadcrumb & Location Switcher */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {onOpenMobileSidebar && (
                <button
                  onClick={onOpenMobileSidebar}
                  className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                  aria-label="Open navigation sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400 font-medium shrink-0">
                  <span>Rewply AI</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-gray-600" />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate">
                    {currentViewTitle}
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                    <Sparkles className="w-3 h-3" /> Gemini 2.5
                  </span>
                </div>
              </div>

              {/* Multi-Location Switcher */}
              <div className="relative hidden xl:block">
                <button
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/60 hover:bg-slate-100 dark:hover:bg-gray-800 text-xs font-semibold text-slate-700 dark:text-gray-300 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span className="truncate max-w-[150px]">{currentLocationLabel}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isLocationDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-64 p-2 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Select Store / Location
                    </div>
                    {locations.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          onLocationChange?.(loc.id)
                          setIsLocationDropdownOpen(false)
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium text-left transition-colors ${
                          selectedLocation === loc.id
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="truncate">{loc.label}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-gray-800 text-slate-500">
                          {loc.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right Actions: Shortcuts, Auto-Pilot, Demo Tour, Simulate Review & Theme Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* Keyboard Shortcuts Trigger */}
              <button
                onClick={() => setIsShortcutsOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-semibold"
                title="View Keyboard Hotkeys (?)"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <kbd className="text-[10px] font-mono font-bold px-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded shadow-2xs">
                  ?
                </kbd>
              </button>

              {/* Auto-Pilot Indicator */}
              <div
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-500/20 group cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors"
                title="AI automatically drafts and sends replies to 5-star reviews"
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Auto-Pilot</span>
                <div className="w-7 h-4 bg-indigo-500 rounded-full relative ml-1 shadow-inner shadow-indigo-700/20">
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>

              {/* Business Impact SLA Badge */}
              <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 group cursor-help transition-all">
                <span className="text-xs font-bold">Live SLA:</span>
                <span className="text-[11px] font-medium opacity-90">&lt;5 min response time</span>
              </div>

              {/* Demo Tour Button */}
              {onToggleDemoMode && (
                <button
                  onClick={onToggleDemoMode}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    isDemoModeActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:border-amber-500/50'
                  }`}
                  title="Launch 3-Minute Guided Buildathon Demo"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">{isDemoModeActive ? 'Exit Tour' : 'Demo Tour'}</span>
                </button>
              )}

              {/* Simulate Review Action Button */}
              {children}

              {/* Dark / Light Mode Toggle Button */}
              <button
                onClick={toggleTheme}
                className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 hover:border-slate-300 dark:border-gray-800 dark:hover:border-gray-700 bg-slate-100 hover:bg-slate-200/80 dark:bg-gray-900 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 overflow-hidden shrink-0"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <Sun
                  className={`w-4 h-4 text-amber-400 fill-amber-400/20 absolute transition-all duration-300 transform ${
                    isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
                  }`}
                />
                <Moon
                  className={`w-4 h-4 text-indigo-600 fill-indigo-600/20 absolute transition-all duration-300 transform ${
                    !isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                  }`}
                />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  )
}
