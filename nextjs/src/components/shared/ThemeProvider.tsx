'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'viox-crm-theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  // Read saved theme on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
      if (saved === 'light' || saved === 'dark') {
        setThemeState(saved)
        document.documentElement.setAttribute('data-theme', saved)
      } else {
        // Default to dark
        document.documentElement.setAttribute('data-theme', 'dark')
      }
    } catch {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {
      // localStorage may be unavailable
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  // The context is ALWAYS provided, including on the server.
  //
  // This used to return bare `children` until a `mounted` flag flipped in an
  // effect, meaning that during every server render — i.e. every hard refresh,
  // every pasted URL, every back-navigation that re-renders — there was no
  // context at all. `useTheme()` throws when it finds none, and ThemeToggle
  // lives in the Sidebar and TopBar, which are in the CRM layout. So every
  // refresh of every CRM page threw inside the layout, escaped the route's
  // own error boundary (a layout's error does), and landed on the global one:
  // "Something went wrong". Client-side navigation was fine, because by then
  // the effect had run.
  //
  // It was never protecting against a flash of the wrong theme either. Page
  // colours come from `data-theme` on <html>, which the inline script in the
  // root layout sets before first paint. Withholding the context only ever
  // cost the toggle its context.
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
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
