'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  isDark: boolean
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
    // Check saved theme in localStorage
    const savedTheme = localStorage.getItem('rewply_theme') as Theme | null
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setThemeState(savedTheme)
      applyTheme(savedTheme, false)
    } else {
      setThemeState('dark')
      applyTheme('dark', false)
    }
  }, [])

  const applyTheme = (newTheme: Theme, withTransition: boolean = true) => {
    const root = document.documentElement

    if (withTransition) {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
      root.classList.add('theme-transition')
    }

    if (newTheme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
      root.setAttribute('data-theme', 'dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
      root.setAttribute('data-theme', 'light')
      root.style.colorScheme = 'light'
    }

    if (withTransition) {
      transitionTimeoutRef.current = setTimeout(() => {
        root.classList.remove('theme-transition')
      }, 350)
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('rewply_theme', newTheme)
    applyTheme(newTheme, true)
  }

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isDark: theme === 'dark',
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
