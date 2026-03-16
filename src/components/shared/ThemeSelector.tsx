'use client'

import { Moon, Sun, Cloud } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useState } from 'react'

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const themes = [
    { id: 'light' as const, label: 'Claro', icon: Sun },
    { id: 'auto' as const, label: 'Intermediário', icon: Cloud },
    { id: 'dark' as const, label: 'Escuro', icon: Moon },
  ]

  const currentThemeObj = themes.find(t => t.id === theme)
  const CurrentIcon = currentThemeObj?.icon || Moon

  return (
    <div className="relative">
      {/* Botão Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-all"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          color: 'var(--text-primary)',
        }}
        title="Alterar tema"
      >
        <CurrentIcon size={18} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 rounded-lg border z-50"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-md)',
            minWidth: '140px',
          }}
        >
          {themes.map((t) => {
            const Icon = t.icon
            const isActive = theme === t.id
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id)
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2.5 flex items-center gap-2 transition-all"
                style={{
                  background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  borderRadius: t === themes[0] ? '6px 6px 0 0' : t === themes[themes.length - 1] ? '0 0 6px 6px' : '0',
                }}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
