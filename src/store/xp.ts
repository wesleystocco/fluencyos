// XP Store — persiste em localStorage até migrar para Supabase
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type XPAction =
  | 'daily_challenge'   // +30 XP
  | 'lesson_complete'   // +50 XP
  | 'quiz_correct'      // +10 XP por questão certa
  | 'streak_7'          // +100 XP
  | 'streak_30'         // +300 XP

const XP_VALUES: Record<XPAction, number> = {
  daily_challenge: 30,
  lesson_complete: 50,
  quiz_correct:    10,
  streak_7:       100,
  streak_30:      300,
}

export interface XPEntry { action: XPAction; xp: number; at: number }

interface XPState {
  userId:         string | null
  totalXP:        number
  level:          number
  streak:         number
  lastActivityDate: string | null
  history:        XPEntry[]
  completedLessons: string[]
  completedChallenges: string[]  // "YYYY-MM-DD-level"
  setUser:       (userId: string | null) => void
  reset:         () => void
  addXP:         (action: XPAction, extra?: number) => void
  completeLesson: (lessonId: string) => void
  completeChallenge: (key: string) => void
  checkStreak:   () => void
}

function calcLevel(xp: number) { return Math.floor(Math.sqrt(xp / 50)) + 1 }

const initialState = {
  userId: null as string | null,
  totalXP: 0,
  level: 1,
  streak: 0,
  lastActivityDate: null as string | null,
  history: [] as XPEntry[],
  completedLessons: [] as string[],
  completedChallenges: [] as string[],
}

export const useXPStore = create<XPState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser(userId) {
        const current = get().userId
        if (current !== userId) {
          // Troca de usuÃ¡rio: limpa progresso local para evitar XP vazando entre contas.
          set({ ...initialState, userId })
        }
      },

      reset() {
        set({ ...initialState, userId: get().userId })
      },

      addXP(action, extra = 0) {
        const earned = XP_VALUES[action] + extra
        set(s => ({
          totalXP: s.totalXP + earned,
          level: calcLevel(s.totalXP + earned),
          history: [{ action, xp: earned, at: Date.now() }, ...s.history].slice(0, 50),
        }))
        get().checkStreak()
      },

      completeLesson(lessonId) {
        if (get().completedLessons.includes(lessonId)) return
        set(s => ({ completedLessons: [...s.completedLessons, lessonId] }))
        get().addXP('lesson_complete')
      },

      completeChallenge(key) {
        if (get().completedChallenges.includes(key)) return
        set(s => ({ completedChallenges: [...s.completedChallenges, key] }))
        get().addXP('daily_challenge')
      },

      checkStreak() {
        const today = new Date().toISOString().split('T')[0]
        const last = get().lastActivityDate
        if (last === today) return
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const newStreak = last === yesterday ? get().streak + 1 : 1
        set({ streak: newStreak, lastActivityDate: today })
        if (newStreak === 7)  get().addXP('streak_7')
        if (newStreak === 30) get().addXP('streak_30')
      },
    }),
    { name: 'fluencyos-xp' }
  )
)
