'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Home, Zap } from 'lucide-react'

export function NavbarAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  if (loading) return null

  if (!user) return null

  return (
    <div className="flex items-center gap-2">
      <Link href="/dashboard"
        className="flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all px-3 py-2 rounded-lg">
        <Zap size={13} />
        Dashboard
      </Link>
      <Link href="/"
        className="flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all px-3 py-2 rounded-lg">
        <Home size={13} />
        Início
      </Link>
      <button onClick={handleLogout}
        className="flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-red-400 hover:bg-red-400/[0.05] transition-all px-3 py-2 rounded-lg">
        <LogOut size={13} />
        Sair
      </button>
    </div>
  )
}
