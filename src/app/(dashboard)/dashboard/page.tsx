'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useXPStore } from '@/store/xp'
import { syncXPFromSupabase, startXPSync } from '@/lib/xp-sync'
import { ThemeSelector } from '@/components/shared/ThemeSelector'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import {
  Flame, Zap, CheckCircle, Crown, Play,
  Calendar, TrendingUp, LogOut, Languages,
  RotateCcw, Lightbulb, Timer
} from 'lucide-react'

// ─── AVATAR URL ───────────────────────────────────────────────────────────────

function avatarUrl(cfgStr: string | null | undefined, username: string, size: number = 80): string {
  try {
    if (cfgStr) {
      const cfg = JSON.parse(cfgStr)
      const seed = 'fluencyos-' + Object.values(cfg).join('-')
      const p = new URLSearchParams({
        seed: seed,
        scale: '80',
        bgcolor: 'b6e3f5',
        size: String(size),
      })
      return `https://api.dicebear.com/9.x/avataaars/svg?${p}`
    }
  } catch {}
  // Fallback: usar username como seed
  const p = new URLSearchParams({
    seed: username,
    scale: '80',
    bgcolor: 'b6e3f5',
    size: String(size),
  })
  return `https://api.dicebear.com/9.x/avataaars/svg?${p}`
}

// ─── XP MATH ─────────────────────────────────────────────────────────────────

function xpForLevel(lv: number): number { return lv * lv * 50 }
function calcLevel(xp: number): number  { return Math.floor(Math.sqrt(xp / 50)) + 1 }
function levelProgress(xp: number): number {
  const lv   = calcLevel(xp)
  const curr = xpForLevel(lv - 1)
  const next = xpForLevel(lv)
  return Math.round(((xp - curr) / (next - curr)) * 100)
}

// ─── DAILY CHALLENGE ─────────────────────────────────────────────────────────

const CHALLENGE_POOL = {
  iniciante: [
    { term:'Good morning',   tip:'Use antes do meio-dia.',           options:['Boa tarde','Bom dia','Boa noite','Até logo'],           answer:1 },
    { term:'Thank you',      tip:'"Thanks" é a versão informal.',    options:['Desculpe','Com licença','Obrigado','De nada'],           answer:2 },
    { term:'How are you?',   tip:'Resposta padrão: "Fine, thanks!"', options:['Onde fica?','Como você está?','Qual seu nome?','Quanto?'], answer:1 },
    { term:'Please',         tip:'Torna qualquer pedido educado.',   options:['Sempre','Por favor','Nunca','Talvez'],                  answer:1 },
    { term:'Excuse me',      tip:'Para pedir passagem ou atenção.',  options:['Obrigado','Com licença','De nada','Por favor'],          answer:1 },
    { term:'Good afternoon', tip:'Use depois do meio-dia.',          options:['Bom dia','Boa tarde','Boa noite','Até logo'],             answer:1 },
    { term:'Sorry',          tip:'Para pedir desculpas.',            options:['Obrigado','Desculpa','Por favor','Com licença'],          answer:1 },
    { term:'Bathroom',       tip:'Útil para pedir direções.',        options:['Cozinha','Banheiro','Quarto','Sala'],                      answer:1 },
    { term:'See you later',  tip:'Despedida informal.',              options:['Até mais','Agora não','Amanhã','Tudo bem'],               answer:0 },
    { term:'I need water',   tip:'Frase simples para pedir água.',   options:['Preciso de água','Estou com fome','Quero sair','Estou bem'], answer:0 },
  ],
  basico: [
    { term:'Could you repeat?', tip:'"Could" soa mais educado que "can".', options:['Pode ajudar?','Pode repetir?','Onde fica?','Quanto?'], answer:1 },
    { term:'I would like',   tip:'Mais educado que "I want".',       options:['Eu preciso','Eu gostaria','Eu tenho','Eu sei'],          answer:1 },
    { term:"What time is it?", tip:`Resposta: "It's three o'clock"`, options:['Que dia?','Quanto tempo?','Que horas são?','Quando?'], answer:2 },
    { term:'Nice to meet you', tip:'Sempre responder com "too!"',    options:['Até logo','Boa sorte','Prazer','Me desculpe'],           answer:2 },
    { term:'Let me think',   tip:'Compra tempo para responder.',     options:['Não sei','Deixa eu pensar','Concordo','Vamos logo'],     answer:1 },
    { term:'Can you speak slowly?', tip:'Útil em conversas reais.', options:['Pode falar devagar?','Pode repetir?','Pode ajudar?','Pode esperar?'], answer:0 },
    { term:'I’d like a table for two', tip:'Frase comum em restaurantes.', options:['Quero uma mesa para dois','Quero pagar','Quero ir','Quero o cardápio'], answer:0 },
    { term:'Do you accept credit cards?', tip:'Pergunta sobre pagamento.', options:['Aceita cartão?','Tem troco?','É caro?','É perto?'], answer:0 },
    { term:'How far is it?', tip:'Pergunta sobre distância.', options:['É longe?','É tarde?','É caro?','É cedo?'], answer:0 },
    { term:'I’m looking for', tip:'Use para procurar algo.', options:['Estou procurando','Estou comprando','Estou vendendo','Estou esperando'], answer:0 },
  ],
  intermediario: [
    { term:'Nevertheless',   tip:'"Even so" — mais formal que "but".', options:['Therefore','Nevertheless','Meanwhile','Otherwise'],  answer:1 },
    { term:'Bear in mind',   tip:'"Lembre-se / tenha em mente."',    options:['Esqueça','Tenha em mente','Pense nisso','Desista'],     answer:1 },
    { term:'To cut corners', tip:'Fazer de forma mais fácil/barata.', options:['Trabalhar mais','Economizar','Dar um jeitinho','Melhorar'], answer:2 },
    { term:'Allegedly',      tip:'Afirmado mas não provado.',        options:['Definitivamente','Supostamente','Obviamente','Certamente'], answer:1 },
    { term:'To bring up',    tip:'Mencionar um tópico em conversa.', options:['Ignorar','Mencionar','Procurar','Desistir'],            answer:1 },
    { term:'On top of that', tip:'Para adicionar informação extra.', options:['Além disso','Apesar disso','Por isso','Enquanto isso'], answer:0 },
    { term:'In the long run', tip:'No longo prazo.', options:['No curto prazo','No longo prazo','No passado','No momento'], answer:1 },
    { term:'To get used to', tip:'Se acostumar com algo.', options:['Evitar','Se acostumar','Ignorar','Desistir'], answer:1 },
    { term:'To run out of', tip:'Ficar sem algo.', options:['Guardar','Ficar sem','Comprar','Descobrir'], answer:1 },
    { term:'From my perspective', tip:'Forma educada de dar opinião.', options:['Na minha opinião','Sem dúvidas','Com certeza','No geral'], answer:0 },
  ],
  fluente: [
    { term:'Serendipity',    tip:'Encontrar algo bom sem procurar.', options:['Azar','Sucesso planejado','Serendipidade','Infortúnio'], answer:2 },
    { term:'Ephemeral',      tip:'Que dura pouco tempo.',            options:['Eterno','Lento','Efêmero','Massivo'],                  answer:2 },
    { term:'Pragmatic',      tip:'Lidar de forma prática.',          options:['Idealista','Sonhador','Pragmático','Impraticável'],    answer:2 },
    { term:'Cathartic',      tip:'Proporcionar alívio emocional.',   options:['Estressante','Chato','Doloroso','Catártico'],          answer:3 },
    { term:'Ostensibly',     tip:'Aparentemente — mas não de verdade.', options:['Obviamente','Aparentemente','Certamente','Mal'],   answer:1 },
    { term:'Ubiquitous',     tip:'Presente em todo lugar.',           options:['Raro','Ubiquitous','Temporário','Frágil'],              answer:1 },
    { term:'Caveat',         tip:'Um aviso ou ressalva importante.',  options:['Garantia','Caveat','Solução','Recompensa'],             answer:1 },
    { term:'Mitigate',       tip:'Tornar algo menos grave.',          options:['Piorar','Mitigate','Ignorar','Resolver'],               answer:1 },
    { term:'Notwithstanding',tip:'Apesar de / não obstante.',         options:['Notwithstanding','Portanto','Além disso','Enquanto'],    answer:0 },
    { term:'Corroborate',    tip:'Confirmar com evidências.',         options:['Negar','Corroborate','Confundir','Ignorar'],             answer:1 },
  ],
}

const LEVELS = [
  { id:'iniciante',     label:'Iniciante',     color:'#10b981' },
  { id:'basico',        label:'Básico',        color:'#3b82f6' },
  { id:'intermediario', label:'Intermediário', color:'#8b5cf6' },
  { id:'fluente',       label:'Fluente',       color:'#f59e0b' },
]

const CYCLE_MS = 5 * 60 * 60 * 1000

function getCycleQuestions(level: string) {
  const pool = CHALLENGE_POOL[level as keyof typeof CHALLENGE_POOL]
  const levelSeed = ({ iniciante: 11, basico: 23, intermediario: 37, fluente: 51 } as Record<string, number>)[level] || 7
  const seed = Math.floor(Date.now() / CYCLE_MS) + levelSeed * 1000
  return shuffleWithSeed(pool, seed).slice(0, 5)
}

function seededRandom(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function shuffleWithSeed<T>(arr: T[], seed: number) {
  const a = [...arr]
  const rand = seededRandom(seed)
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = a[i]
    a[i] = a[j]
    a[j] = tmp
  }
  return a
}

function getCountdown(): { h: number; m: number; s: number } {
  const next = (Math.floor(Date.now() / CYCLE_MS) + 1) * CYCLE_MS
  const d = next - Date.now()
  return { h:Math.floor(d/3600000), m:Math.floor((d%3600000)/60000), s:Math.floor((d%60000)/1000) }
}

// ─── MODULES ─────────────────────────────────────────────────────────────────

const MODULES = [
  { id:'modulo-1', title:'Os Fundamentos',        sub:'Alfabeto, cumprimentos, números e dia a dia', color:'#3b82f6', xp:250, icon:'📖', lessons:5 },
  { id:'modulo-2', title:'Verbos Essenciais',     sub:'To be, to have, to go, can...',             color:'#10b981', xp:170, icon:'⚡', lessons:3 },
  { id:'modulo-3', title:'Cotidiano',             sub:'Família, comida, trabalho',                  color:'#8b5cf6', xp:180, icon:'🏠', lessons:3 },
  { id:'modulo-4', title:'Tempos Verbais I',      sub:'Present simple & continuous',       color:'#f59e0b', xp:300, icon:'⏰', lessons:0 },
  { id:'modulo-5', title:'Conversação Real',      sub:'Situações do dia a dia',             color:'#ef4444', xp:350, icon:'💬', lessons:0 },
  { id:'modulo-6', title:'Tempos Verbais II',     sub:'Past simple, present perfect',      color:'#ec4899', xp:400, icon:'📅', lessons:0 },
  { id:'modulo-7', title:'Expressões Idiomáticas',sub:'50 idioms essenciais',              color:'#06b6d4', xp:450, icon:'🎭', lessons:0 },
  { id:'modulo-8', title:'Fluência Avançada',     sub:'Escrita formal e vocabulário',      color:'#8b5cf6', xp:500, icon:'🎓', lessons:0 },
]

// ─── DAILY CHALLENGE WIDGET ───────────────────────────────────────────────────

function DailyChallenge({ username, todayPrefix }: { username: string; todayPrefix: string }) {
  const { addXP, completeChallenge, completedChallenges } = useXPStore()
  const [level,    setLevel]    = useState('iniciante')
  const [qIdx,     setQIdx]     = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [score,    setScore]    = useState(0)
  const [done,     setDone]     = useState(false)
  const [timer,    setTimer]    = useState(getCountdown())
  const [feedback, setFeedback] = useState<{ title: string; message: string; tone: 'success' | 'error' } | null>(null)
  const [cycleIdx, setCycleIdx] = useState(Math.floor(Date.now() / CYCLE_MS))

  useEffect(() => {
    const t = setInterval(() => {
      setTimer(getCountdown())
      const next = Math.floor(Date.now() / CYCLE_MS)
      if (next !== cycleIdx) {
        setCycleIdx(next)
        setQIdx(0); setSelected(null); setRevealed(false); setScore(0); setDone(false)
      }
    }, 1000)
    return () => clearInterval(t)
  }, [cycleIdx])

  const questions = getCycleQuestions(level)
  const q  = questions[qIdx]
  const lv = LEVELS.find(l => l.id === level)!
  const todayKey    = todayPrefix + '-' + level
  const alreadyDone = completedChallenges.includes(todayKey)

  function handleCheck() {
    if (selected === null) return
    setRevealed(true)
    if (selected === q.answer) { setScore(s => s + 1); addXP('quiz_correct') }
    const correctOption = q.options[q.answer]
    const message = selected === q.answer
      ? q.tip
      : `A correta é "${correctOption}". ${q.tip}`
    setFeedback({
      title: selected === q.answer ? 'Correto!' : 'Ops! Ainda não',
      message,
      tone: selected === q.answer ? 'success' : 'error',
    })
  }

  function handleNext() {
    if (qIdx < questions.length - 1) {
      setQIdx(i => i + 1); setSelected(null); setRevealed(false)
    } else {
      setDone(true); completeChallenge(todayKey)
    }
  }

  function resetLevel(l: string) {
    setLevel(l); setQIdx(0); setSelected(null); setRevealed(false); setScore(0); setDone(false)
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.07)' }}>
      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background:'rgba(5,5,14,0.7)', backdropFilter:'blur(6px)' }}>
          <div className="w-full max-w-md rounded-2xl p-6"
            style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-[11px] font-bold uppercase tracking-widest mb-2"
              style={{ color: feedback.tone === 'success' ? '#34d399' : '#f87171' }}>
              {feedback.tone === 'success' ? 'Resposta correta' : 'Resposta incorreta'}
            </div>
            <div className="text-xl font-black text-white mb-2">{feedback.title}</div>
            <p className="text-[13px] text-slate-400 leading-relaxed mb-5">{feedback.message}</p>
            <button
              onClick={() => setFeedback(null)}
              className="w-full py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: feedback.tone === 'success' ? '#10b981' : '#ef4444' }}>
              Continuar
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-0.5">Desafio do Dia</div>
          <div className="text-base font-black text-white">5 questões · {lv.label}</div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full"
          style={{ background:'rgba(37,99,235,0.1)', color:'#60a5fa', border:'1px solid rgba(37,99,235,0.2)' }}>
          <Timer size={10}/> {String(timer.h).padStart(2,'0')}:{String(timer.m).padStart(2,'0')}:{String(timer.s).padStart(2,'0')}
        </div>
      </div>

      {/* Level tabs */}
      <div className="flex gap-1 px-4 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
        {LEVELS.map(l => (
          <button key={l.id} onClick={() => resetLevel(l.id)}
            className="flex-1 text-[11px] font-semibold py-2 rounded-lg transition-all"
            style={level === l.id
              ? { background:`${l.color}18`, color:l.color, border:`1px solid ${l.color}30` }
              : { color:'#64748b', border:'1px solid transparent' }}>
            {l.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {alreadyDone && !done ? (
          <div className="text-center py-4">
            <CheckCircle size={28} className="mx-auto mb-2 text-green-400"/>
            <div className="text-sm font-bold text-white mb-1">Desafio concluído hoje!</div>
            <div className="text-[12px] text-slate-500">
              Volta em {String(timer.h).padStart(2,'0')}h {String(timer.m).padStart(2,'0')}min
            </div>
          </div>
        ) : done ? (
          <div className="text-center py-2">
            <div className="text-3xl font-black text-white mb-1">
              {score}<span className="text-slate-600">/{questions.length}</span>
            </div>
            <div className="text-[12px] text-slate-400 mb-3">
              {score === questions.length ? 'Perfeito!' : score >= 3 ? 'Muito bem!' : 'Continue praticando!'}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold mb-4"
              style={{ background:`${lv.color}15`, color:lv.color }}>
              <Zap size={11}/> +{score * 10 + 30} XP ganhos
            </div>
            <br/>
            <button onClick={() => resetLevel(level)}
              className="flex items-center gap-1.5 mx-auto text-[12px] text-slate-500 hover:text-white transition-colors mt-1">
              <RotateCcw size={11}/> Repetir
            </button>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width:`${(qIdx / questions.length) * 100}%`, background:lv.color }}/>
              </div>
              <span className="text-[10px] text-slate-600 tabular-nums">{qIdx + 1}/{questions.length}</span>
            </div>

            {/* Question card */}
            <div className="rounded-xl p-4 mb-4"
              style={{ background:'rgba(255,255,255,0.025)', border:`1px solid ${lv.color}20` }}>
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb size={13} style={{ color:lv.color }}/>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color:lv.color }}>
                  Palavra do dia
                </span>
              </div>
              <div className="text-xl font-black text-white mb-1">{q.term}</div>
              <div className="text-[12px] text-slate-500 leading-relaxed">{q.tip}</div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {q.options.map((opt, i) => {
                const isCrct = i === q.answer
                const isSel  = i === selected
                let bg = 'rgba(255,255,255,0.03)', bdr = 'rgba(255,255,255,0.07)', clr = '#94a3b8'
                if (revealed) {
                  if (isCrct)     { bg='rgba(16,185,129,0.1)'; bdr='rgba(16,185,129,0.35)'; clr='#34d399' }
                  else if (isSel) { bg='rgba(239,68,68,0.08)'; bdr='rgba(239,68,68,0.3)';   clr='#f87171' }
                } else if (isSel) { bg=`${lv.color}10`; bdr=`${lv.color}35`; clr='#f1f5f9' }
                return (
                  <button key={i} disabled={revealed} onClick={() => setSelected(i)}
                    className="text-left px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all"
                    style={{ background:bg, border:`1px solid ${bdr}`, color:clr }}>
                    {revealed && isCrct && <CheckCircle size={11} className="inline mr-1 mb-0.5"/>}
                    {opt}
                  </button>
                )
              })}
            </div>

            {!revealed ? (
              <button onClick={handleCheck} disabled={selected === null}
                className="cta-button w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background:lv.color, opacity:selected === null ? 0.4 : 1 }}>
                Verificar
              </button>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center"
                  style={{
                    background: selected === q.answer ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                    color:      selected === q.answer ? '#34d399' : '#f87171',
                    border:     `1px solid ${selected === q.answer ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  }}>
                  {selected === q.answer ? 'Correto! +10 XP' : 'Não dessa vez'}
                </div>
                <button onClick={handleNext} className="cta-button px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background:lv.color }}>
                  {qIdx < questions.length - 1 ? 'Próxima' : 'Finalizar'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { totalXP, streak, history, completedLessons } = useXPStore()
  
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      
      // Sincronizar XP do Supabase se autenticado
      if (data.user?.id) {
        console.log('👤 Usuário autenticado:', data.user.email)
        await syncXPFromSupabase(data.user.id)
        // Iniciar sync periódico
        startXPSync(data.user.id)
      }
      
      setLoading(false)
    }
    
    init()
    setMounted(true)
  }, [])

  const lvNum    = mounted ? calcLevel(totalXP) : 1
  const progress = mounted ? levelProgress(totalXP) : 0
  const xpCurr   = mounted ? xpForLevel(lvNum - 1) : 0
  const xpNext   = mounted ? xpForLevel(lvNum) : 50

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#05050e' }}>
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"/>
    </div>
  )

  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/login'
    return null
  }

  const meta      = user.user_metadata || {}
  const username  = meta.username || user.email?.split('@')[0] || 'usuário'
  const avatarSrc = avatarUrl(meta.avatar, username, 96)
  const completedByModule = (moduleId: string) =>
    (completedLessons || []).filter(l => l.startsWith(`${moduleId}-licao-`)).length

  const doneByModule = MODULES.reduce((acc, m) => {
    acc[m.id] = completedByModule(m.id) >= (m.lessons || 0)
    return acc
  }, {} as Record<string, boolean>)

  const modulesView = MODULES.map((m, idx) => {
    if (idx === 0) return { ...m, locked: false }
    const prev = MODULES[idx - 1]
    const prevDone = doneByModule[prev.id]
    return { ...m, locked: !prevDone }
  })

  const currentModule = modulesView.find(m => !m.locked) || modulesView[0]

  const todayPrefix    = mounted ? new Date().toISOString().split('T')[0] : ''
  const todayDone      = mounted && (useXPStore.getState().completedChallenges || []).some(k => k.startsWith(todayPrefix))
  const lessonDoneToday = mounted && (history || []).some(h => h.action === 'lesson_complete' && Date.now() - h.at < 86400000)

  return (
    <div className="min-h-screen" style={{ background:'#05050e' }}>

      {/* Nav */}
      <nav className="sticky top-0 z-40"
        style={{ background:'rgba(5,5,14,0.95)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Languages size={15} className="text-white"/>
            </div>
            <span className="font-bold text-white text-sm">Fluency<span className="text-blue-400">OS</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
              style={{ background:'rgba(245,158,11,0.1)', color:'#fbbf24', border:'1px solid rgba(245,158,11,0.15)' }}>
              <Flame size={12}/> {streak} dias
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
              style={{ background:'rgba(37,99,235,0.1)', color:'#60a5fa', border:'1px solid rgba(37,99,235,0.15)' }}>
              <Zap size={12}/> {totalXP.toLocaleString()} XP
            </div>
            <ThemeSelector />
            <div className="w-9 h-9 rounded-xl overflow-hidden"
              style={{ border:'2px solid rgba(37,99,235,0.35)', background:'#0d0d1a' }}>
              <img src={avatarSrc} alt="avatar" className="w-full h-full"/>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">

          {/* LEFT */}
          <div className="space-y-5">

            {/* Profile card */}
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
              className="rounded-2xl p-6" style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden"
                    style={{ border:'2px solid rgba(37,99,235,0.4)', background:'#05050e' }}>
                    <img src={avatarSrc} alt="avatar" className="w-full h-full"/>
                  </div>
                  {streak >= 7 && (
                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center"
                      style={{ boxShadow:'0 0 10px rgba(245,158,11,0.5)' }}>
                      <Crown size={11} className="text-white"/>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-0.5">Bem-vindo de volta</div>
                  <div className="text-xl font-black text-white truncate">@{username}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[12px] text-slate-400">Nível {lvNum}</span>
                    <span className="text-slate-700">·</span>
                    <span className="text-[12px] text-slate-400">{totalXP.toLocaleString()} XP</span>
                    {streak > 0 && (
                      <>
                        <span className="text-slate-700">·</span>
                        <span className="text-[12px] text-orange-400 flex items-center gap-1">
                          <Flame size={10}/> {streak} dias
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-3xl font-black text-white">Nv.{lvNum}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{progress}% para Nv.{lvNum + 1}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-[11px] text-slate-600 mb-1.5">
                  <span>{xpCurr.toLocaleString()} XP</span>
                  <span>{xpNext.toLocaleString()} XP</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background:'linear-gradient(90deg,#2563eb,#60a5fa)' }}
                    initial={{ width:0 }} animate={{ width:`${progress}%` }}
                    transition={{ duration:1, ease:[0.22,1,0.36,1] }}/>
                </div>
              </div>
            </motion.div>

            {/* Daily goals */}
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08, duration:0.5 }}
              className="rounded-2xl p-5" style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-0.5">Hoje</div>
                  <div className="text-base font-black text-white">Metas do dia</div>
                </div>
                <Calendar size={16} className="text-slate-600"/>
              </div>
              <div className="space-y-2.5">
                {[
                  { label:'Desafio diário',     done:todayDone,       xp:'+30 XP'   },
                  { label:'Completar uma lição', done:lessonDoneToday, xp:'+50 XP'   },
                  { label:'Sequência ativa',     done:streak > 0,      xp:'Streak'   },
                ].map(g => (
                  <div key={g.label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      background: g.done ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.025)',
                      border: `1px solid ${g.done ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.05)'}`,
                    }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: g.done ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${g.done ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                      {g.done && <CheckCircle size={11} style={{ color:'#34d399' }}/>}
                    </div>
                    <span className="text-sm flex-1"
                      style={{ color:g.done?'#64748b':'#cbd5e1', textDecoration:g.done?'line-through':'none' }}>
                      {g.label}
                    </span>
                    <span className="text-[11px] font-bold" style={{ color:g.done?'#34d399':'#475569' }}>{g.xp}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Modules */}
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.14, duration:0.5 }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-0.5">Curso</div>
                  <div className="text-xl font-black text-white">Inglês do Zero ao Fluente</div>
                </div>
                <div className="text-[12px] text-slate-500">{completedLessons.length} lições</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {modulesView.map((mod, i) => (
                  <motion.div key={mod.id}
                    initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05*i, duration:0.4 }}>
                    <Link href={mod.locked ? '#' : `/curso/${mod.id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                        borderRadius: '1rem', background: '#0d0d1a',
                        border: '1px solid rgba(255,255,255,0.06)',
                        opacity: mod.locked ? 0.5 : 1,
                        cursor: mod.locked ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={e => { if (!mod.locked) { e.currentTarget.style.borderColor = `${mod.color}45`; e.currentTarget.style.transform='translateY(-1px)' }}}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; e.currentTarget.style.transform='translateY(0)' }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background:`${mod.color}15` }}>
                        {mod.locked ? '🔒' : mod.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm leading-tight truncate">{mod.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">{mod.sub}</div>
                      </div>
                      <div className="text-[10px] font-bold flex-shrink-0" style={{ color:mod.color }}>+{mod.xp} XP</div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* RIGHT */}
          <div className="space-y-5">

            <motion.div initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1, duration:0.5 }}>
              {mounted && <DailyChallenge username={username} todayPrefix={todayPrefix}/>}
            </motion.div>

            {/* XP History */}
            <motion.div initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2, duration:0.5 }}
              className="rounded-2xl p-5" style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-black text-white">Atividade recente</div>
                <TrendingUp size={14} className="text-slate-600"/>
              </div>
              {!history || history.length === 0 ? (
                <p className="text-[12px] text-slate-600 text-center py-4">
                  Complete desafios para ver seu histórico!
                </p>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 6).map((h, i) => {
                    const labels = {
                      daily_challenge:'Desafio diário', lesson_complete:'Lição concluída',
                      quiz_correct:'Acertou questão',   streak_7:'7 dias seguidos!', streak_30:'30 dias seguidos!'
                    }
                    const colors = {
                      daily_challenge:'#10b981', lesson_complete:'#3b82f6',
                      quiz_correct:'#8b5cf6',    streak_7:'#f59e0b', streak_30:'#f59e0b'
                    }
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[12px] text-slate-400">{labels[h.action] || h.action}</span>
                        <span className="text-[12px] font-bold" style={{ color:colors[h.action]||'#60a5fa' }}>+{h.xp} XP</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>

            {/* Continue module CTA */}
            <motion.div initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.25, duration:0.5 }}>
              <Link href={`/curso/${currentModule.id}`}
                className="cta-button cta-float"
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem',
                  borderRadius: '1rem', background:`${currentModule.color}0a`,
                  border:`1px solid ${currentModule.color}30`,
                  transition: 'all 0.2s', textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor=`${currentModule.color}55` }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor=`${currentModule.color}30` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background:`${currentModule.color}18` }}>
                  {currentModule.icon}
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color:currentModule.color }}>
                    Continuar
                  </div>
                  <div className="font-black text-white text-sm">{currentModule.title}</div>
                  <div className="text-[12px] text-slate-500">+{currentModule.xp} XP disponíveis</div>
                </div>
                <Play size={18} style={{ color:currentModule.color, flexShrink:0 }}/>
              </Link>
            </motion.div>

            {/* Logout */}
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] text-slate-600 hover:text-red-400 transition-colors"
              style={{ border:'1px solid rgba(255,255,255,0.05)' }}>
              <LogOut size={13}/> Sair da conta
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}
