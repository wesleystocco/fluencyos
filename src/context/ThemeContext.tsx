'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('fluencyos-theme')
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      setTheme(saved)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('fluencyos-theme', theme)

    // Apply theme class to <html> so CSS variables in theme.css take effect.
    const root = document.documentElement
    root.classList.remove('light', 'dark', 'auto')
    root.classList.add(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve estar dentro de ThemeProvider')
  }
  return context
}
