'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { ThemeSelector } from '@/components/shared/ThemeSelector'
import Link from 'next/link'
import {
  Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle,
  AlertCircle, Languages, Sparkles, ShieldCheck,
  Mail, Lock, Zap, Shuffle, ChevronLeft, ChevronRight
} from 'lucide-react'

// ─── DICEBEAR AVATAR BUILDER ──────────────────────────────────────────────────
// DiceBear v9 avataaars — parâmetros corretos e testados

const HAIR_OPTIONS = [
  { id:'ShortHairShortFlat',    label:'Liso Curto',    free:true  },
  { id:'ShortHairShortCurly',   label:'Cacheado',      free:true  },
  { id:'ShortHairShortRound',   label:'Redondo',       free:true  },
  { id:'ShortHairShortWaved',   label:'Ondulado',      free:true  },
  { id:'ShortHairTheCaesar',    label:'Clássico',      free:true  },
  { id:'ShortHairSides',        label:'Raspado Lados', free:true  },
  { id:'LongHairBob',           label:'Bob',           free:false, xp:100 },
  { id:'LongHairBun',           label:'Coque',         free:false, xp:100 },
  { id:'LongHairCurly',         label:'Cacheado Longo',free:false, xp:150 },
  { id:'LongHairStraight',      label:'Liso Longo',    free:false, xp:150 },
  { id:'LongHairFro',           label:'Black Power',   free:false, xp:200 },
  { id:'LongHairDreads',        label:'Dreads',        free:false, xp:200 },
  { id:'LongHairMiaWallace',    label:'Mia Wallace',   free:false, xp:300 },
  { id:'Hat',                   label:'Boné',          free:false, xp:400 },
  { id:'Hijab',                 label:'Hijab',         free:false, xp:100 },
  { id:'Turban',                label:'Turbante',      free:false, xp:300 },
  { id:'Eyepatch',              label:'Tapa-olho',     free:false, xp:500 },
]

const HAIR_COLORS = [
  { id:'Black',       label:'Preto',        hex:'#2c1b18', free:true  },
  { id:'Brown',       label:'Castanho',     hex:'#724133', free:true  },
  { id:'BrownDark',   label:'Castanho Esc.',hex:'#4a312c', free:true  },
  { id:'Blonde',      label:'Loiro',        hex:'#b58143', free:true  },
  { id:'BlondeGolden',label:'Loiro Dourado',hex:'#d6b370', free:true  },
  { id:'Auburn',      label:'Ruivo',        hex:'#a55728', free:false, xp:50  },
  { id:'Red',         label:'Vermelho',     hex:'#c0392b', free:false, xp:100 },
  { id:'PastelPink',  label:'Rosa',         hex:'#f4a7b9', free:false, xp:200 },
  { id:'Platinum',    label:'Platinado',    hex:'#ecdcbf', free:false, xp:200 },
  { id:'SilverGray',  label:'Cinza',        hex:'#9a9e9f', free:false, xp:150 },
]

const SKIN_COLORS = [
  { id:'Pale',      label:'Bem Claro', hex:'#ffdbb4' },
  { id:'Light',     label:'Claro',     hex:'#edb98a' },
  { id:'Tanned',    label:'Moreno',    hex:'#fd9841' },
  { id:'Yellow',    label:'Amarelo',   hex:'#f8d25c' },
  { id:'Brown',     label:'Pardo',     hex:'#d08b5b' },
  { id:'DarkBrown', label:'Escuro',    hex:'#ae5d29' },
  { id:'Black',     label:'Muito Esc.',hex:'#614335' },
]

const EYE_OPTIONS = [
  { id:'Default',   label:'Normal',   free:true  },
  { id:'Happy',     label:'Feliz',    free:true  },
  { id:'Squint',    label:'Esperto',  free:true  },
  { id:'Wink',      label:'Piscada',  free:true  },
  { id:'Surprised', label:'Surpreso', free:false, xp:100 },
  { id:'Hearts',    label:'Coração',  free:false, xp:200 },
  { id:'Side',      label:'De lado',  free:false, xp:100 },
  { id:'Dizzy',     label:'Tonto',    free:false, xp:150 },
  { id:'EyeRoll',   label:'Revirado', free:false, xp:150 },
  { id:'XDizzy',    label:'X',        free:false, xp:300 },
]

const MOUTH_OPTIONS = [
  { id:'Smile',      label:'Sorriso',  free:true  },
  { id:'Default',    label:'Neutro',   free:true  },
  { id:'Serious',    label:'Sério',    free:true  },
  { id:'Twinkle',    label:'Maroto',   free:false, xp:100 },
  { id:'Tongue',     label:'Língua',   free:false, xp:100 },
  { id:'Eating',     label:'Comendo',  free:false, xp:150 },
  { id:'Sad',        label:'Triste',   free:false, xp:100 },
  { id:'Grimace',    label:'Careta',   free:false, xp:200 },
  { id:'ScreamOpen', label:'Gritando', free:false, xp:250 },
]

const CLOTHING_OPTIONS = [
  { id:'Hoodie',         label:'Moletom',      free:true  },
  { id:'ShirtCrewNeck',  label:'Camiseta',     free:true  },
  { id:'ShirtScoopNeck', label:'Decote',       free:true  },
  { id:'BlazerShirt',    label:'Blazer',       free:false, xp:150 },
  { id:'BlazerSweater',  label:'Blaz+Suéter',  free:false, xp:200 },
  { id:'CollarSweater',  label:'Gola Alta',    free:false, xp:100 },
  { id:'GraphicShirt',   label:'Estampada',    free:false, xp:250 },
  { id:'Overall',        label:'Macacão',      free:false, xp:300 },
  { id:'ShirtVNeck',     label:'Decote V',     free:false, xp:100 },
]

const CLOTHING_COLORS = [
  { id:'Blue03',       label:'Azul',         hex:'#3c4f5c', free:true  },
  { id:'Heather',      label:'Cinza',        hex:'#b7c1be', free:true  },
  { id:'Black',        label:'Preto',        hex:'#262e33', free:true  },
  { id:'Red',          label:'Vermelho',     hex:'#ff5c5c', free:true  },
  { id:'White',        label:'Branco',       hex:'#e6e6e6', free:true  },
  { id:'Blue01',       label:'Azul Claro',   hex:'#65c9ff', free:false, xp:50  },
  { id:'Pink',         label:'Rosa',         hex:'#ff488e', free:false, xp:200 },
  { id:'PastelBlue',   label:'Pastel Azul',  hex:'#b1e2ff', free:false, xp:100 },
  { id:'PastelGreen',  label:'Pastel Verde', hex:'#a7ffc4', free:false, xp:100 },
  { id:'PastelOrange', label:'Pastel Laran.',hex:'#ffd5a8', free:false, xp:100 },
  { id:'PastelRed',    label:'Pastel Rosa',  hex:'#ffafb9', free:false, xp:150 },
  { id:'PastelYellow', label:'Pastel Amar.', hex:'#ffffb1', free:false, xp:150 },
]

const ACCESSORIES = [
  { id:'Blank',          label:'Nenhum',       free:true  },
  { id:'Sunglasses',     label:'Óculos Sol',   free:false, xp:100 },
  { id:'Prescription01', label:'Óculos',       free:false, xp:100 },
  { id:'Prescription02', label:'Óculos Rond.', free:false, xp:150 },
  { id:'Round',          label:'Redondo',      free:false, xp:150 },
  { id:'Wayfarers',      label:'Wayfarer',     free:false, xp:200 },
  { id:'Kurt',           label:'Kurt',         free:false, xp:300 },
]

type AvatarCfg = {
  top:string; hairColor:string; skinColor:string;
  eyes:string; mouth:string; clothing:string;
  clothingColor:string; accessories:string;
}

const DEFAULT_CFG: AvatarCfg = {
  top:'ShortHairShortFlat', hairColor:'Black', skinColor:'Light',
  eyes:'Default', mouth:'Smile', clothing:'Hoodie',
  clothingColor:'Blue03', accessories:'Blank',
}

function avatarUrl(cfg: AvatarCfg, size=128) {
  // Usar apenas seed - DiceBear gera randomicamente mas consistentemente
  const seed = 'fluencyos-' + Object.values(cfg).join('-')
  const p = new URLSearchParams({
    seed: seed,
    scale: '80',
    bgcolor: 'b6e3f5',
    size: String(size),
  })
  return `https://api.dicebear.com/9.x/avataaars/svg?${p}`
}

const TABS = [
  { key:'top',          label:'Cabelo',     options:HAIR_OPTIONS,    colorMode:false },
  { key:'hairColor',    label:'Cor Cabelo', options:HAIR_COLORS,     colorMode:true  },
  { key:'skinColor',    label:'Pele',       options:SKIN_COLORS,     colorMode:true, allFree:true },
  { key:'eyes',         label:'Olhos',      options:EYE_OPTIONS,     colorMode:false },
  { key:'mouth',        label:'Boca',       options:MOUTH_OPTIONS,   colorMode:false },
  { key:'clothing',     label:'Roupa',      options:CLOTHING_OPTIONS,colorMode:false },
  { key:'clothingColor',label:'Cor Roupa',  options:CLOTHING_COLORS, colorMode:true  },
  { key:'accessories',  label:'Acessórios', options:ACCESSORIES,     colorMode:false },
] as const

type TabKey = typeof TABS[number]['key']

function AvatarCreator({ cfg, onChange }: { cfg: AvatarCfg; onChange:(c:AvatarCfg)=>void }) {
  const [tab, setTab]   = useState<TabKey>('top')
  const [tIdx, setTIdx] = useState(0)
  const tabDef = TABS.find(t => t.key === tab)!

  function set(key: keyof AvatarCfg, val: string) {
    onChange({ ...cfg, [key]: val })
  }

  function shuffle() {
    const rnd = <T extends {id:string; free?:boolean}>(arr:T[]) => {
      const free = arr.filter(x => (x as any).free !== false)
      return free[Math.floor(Math.random() * free.length)].id
    }
    onChange({
      top:          rnd(HAIR_OPTIONS),
      hairColor:    rnd(HAIR_COLORS),
      skinColor:    SKIN_COLORS[Math.floor(Math.random()*SKIN_COLORS.length)].id,
      eyes:         rnd(EYE_OPTIONS),
      mouth:        rnd(MOUTH_OPTIONS),
      clothing:     rnd(CLOTHING_OPTIONS),
      clothingColor:rnd(CLOTHING_COLORS),
      accessories:  'Blank',
    })
  }

  function prevTab() { const i = Math.max(0, tIdx-1); setTIdx(i); setTab(TABS[i].key) }
  function nextTab() { const i = Math.min(TABS.length-1, tIdx+1); setTIdx(i); setTab(TABS[i].key) }

  return (
    <div>
      {/* Preview */}
      <div className="flex justify-center mb-5">
        <div className="relative">
          <div className="w-28 h-28 rounded-2xl overflow-hidden"
            style={{ border:'2px solid rgba(37,99,235,0.35)', background:'#0d0d1a' }}>
            <img src={avatarUrl(cfg)} alt="avatar" className="w-full h-full" />
          </div>
          <button onClick={shuffle} title="Aleatório"
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background:'#2563eb', boxShadow:'0 2px 12px rgba(37,99,235,0.45)' }}>
            <Shuffle size={13} className="text-white" />
          </button>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-1 mb-3">
        <button onClick={prevTab} disabled={tIdx===0}
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-slate-400 hover:text-white transition-all"
          style={{ opacity: tIdx===0 ? 0.3 : 1 }}>
          <ChevronLeft size={12}/>
        </button>
        <div className="flex-1 flex gap-1 overflow-x-auto" style={{ scrollbarWidth:'none' }}>
          {TABS.map((t, i) => (
            <button key={t.key} onClick={() => { setTab(t.key); setTIdx(i) }}
              className="flex-shrink-0 text-[10px] font-bold px-2 py-1.5 rounded-lg whitespace-nowrap transition-all"
              style={tab === t.key
                ? { background:'rgba(37,99,235,0.18)', color:'#60a5fa', border:'1px solid rgba(37,99,235,0.3)' }
                : { color:'#475569', border:'1px solid transparent' }}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={nextTab} disabled={tIdx===TABS.length-1}
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-slate-400 hover:text-white transition-all"
          style={{ opacity: tIdx===TABS.length-1 ? 0.3 : 1 }}>
          <ChevronRight size={12}/>
        </button>
      </div>

      {/* Options */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-5 }}
          transition={{ duration:0.15 }}
          className="grid gap-1.5 max-h-[180px] overflow-y-auto pr-0.5"
          style={{ gridTemplateColumns: tabDef.colorMode ? 'repeat(5,1fr)' : 'repeat(3,1fr)', scrollbarWidth:'thin', scrollbarColor:'rgba(255,255,255,0.08) transparent' }}>
          {tabDef.options.map((opt:any) => {
            const isSelected = (cfg as any)[tab] === opt.id
            const locked = opt.free === false
            return (
              <button key={opt.id}
                onClick={() => !locked && set(tab as keyof AvatarCfg, opt.id)}
                className="relative flex flex-col items-center gap-1 rounded-xl transition-all py-2 px-1"
                style={{
                  background: isSelected ? 'rgba(37,99,235,0.18)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isSelected ? 'rgba(37,99,235,0.45)' : 'rgba(255,255,255,0.06)'}`,
                  opacity: locked ? 0.5 : 1,
                  cursor: locked ? 'default' : 'pointer',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                }}>
                {opt.hex
                  ? <div className="w-7 h-7 rounded-full border-2"
                      style={{ background:opt.hex, borderColor: isSelected?'#60a5fa':'rgba(255,255,255,0.15)' }}/>
                  : <div className="text-[9px] font-black w-7 h-7 flex items-center justify-center text-center leading-none"
                      style={{ color: isSelected?'#60a5fa':'#475569' }}>
                      {opt.label.slice(0,4)}
                    </div>
                }
                <span className="text-[8px] text-center leading-tight"
                  style={{ color: isSelected?'#93c5fd':'#374151' }}>
                  {opt.label.slice(0,7)}
                </span>
                {locked && (
                  <div className="absolute -top-1 -right-1 px-0.5 py-px rounded text-[7px] font-black leading-none"
                    style={{ background:'#f59e0b', color:'#000' }}>
                    {opt.xp}
                  </div>
                )}
                {isSelected && !locked && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                    style={{ background:'#2563eb' }}>
                    <CheckCircle size={8} className="text-white"/>
                  </div>
                )}
              </button>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── PASSWORD ─────────────────────────────────────────────────────────────────

function pwCheck(v:string) {
  return [
    { ok:v.length>=8,          label:'8+ chars'  },
    { ok:/[A-Z]/.test(v),      label:'Maiúscula' },
    { ok:/[0-9]/.test(v),      label:'Número'    },
    { ok:/[^a-zA-Z0-9]/.test(v),label:'Símbolo' },
  ]
}
function pwStrength(v:string) {
  const s = pwCheck(v).filter(r=>r.ok).length
  const map = ['','Fraca','Média','Boa','Forte']
  const col = ['','#ef4444','#f59e0b','#3b82f6','#10b981']
  return { s, label:map[s]||'', color:col[s]||'#ef4444' }
}
function usernameErr(v:string) {
  if (!v) return null
  if (v.length < 3)  return 'Mínimo 3 caracteres'
  if (v.length > 20) return 'Máximo 20 caracteres'
  if (!/^[a-zA-Z0-9_\-.]+$/.test(v)) return 'Letras, números, _ . -'
  return null
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

type Step = 'choice' | 'form' | 'avatar' | 'done'

export default function LoginPage() {
  const supabase   = createClient()
  const [mounted, setMounted] = useState(false)
  const [mode,     setMode]     = useState<'login'|'signup'>('signup')
  const [step,     setStep]     = useState<Step>('choice')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loginInput, setLoginInput] = useState('') // Campo único para email OU username
  const [avatar,   setAvatar]   = useState<AvatarCfg>(DEFAULT_CFG)
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string|null>(null)
  const [touched,  setTouched]  = useState({email:false,password:false,username:false})

  useEffect(() => {
    setMounted(true)
  }, [])

  const rules   = pwCheck(password)
  const pw      = pwStrength(password)
  const uErr    = touched.username ? usernameErr(username) : null
  const isEmailInput = loginInput.includes('@')
  
  const canForm = mode==='login'
    ? loginInput.length > 0 && password.length > 0
    : email.includes('@') && rules.every(r=>r.ok) && !usernameErr(username) && username.length >= 3

  async function doLogin() {
    setLoading(true); setError(null)
    
    try {
      // Se for email, logar direto
      if (isEmailInput) {
        console.log('🔐 Tentando login com email:', loginInput)
        const { error: err } = await supabase.auth.signInWithPassword({ 
          email: loginInput, 
          password 
        })
        if (err) {
          console.error('❌ Erro login email:', err)
          setError(
            err.message.includes('Invalid') 
              ? 'E-mail ou senha incorretos.' 
              : err.message
          )
          setLoading(false)
        } else {
          console.log('✅ Login bem-sucedido!')
          window.location.href = '/dashboard'
        }
        return
      }
      
      // Se for username, fazer query na tabela de profiles para pegar o email
      console.log('🔍 Buscando usuário:', loginInput.toLowerCase())
      const { data: profile, error: queryErr } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', loginInput.toLowerCase())
        .maybeSingle()
      
      console.log('📊 Profile query erro:', queryErr)
      console.log('📊 Profile encontrado:', profile)
      
      if (queryErr) {
        console.error('❌ Erro query profiles:', queryErr)
        setError('Erro ao conectar. Tente com seu e-mail.')
        setLoading(false)
        return
      }
      
      if (!profile) {
        console.warn('⚠️ Usuário não encontrado:', loginInput)
        // Mostrar erro mais útil
        setError(`Usuário "@${loginInput}" não encontrado. Tente email ou crie uma nova conta.`)
        setLoading(false)
        return
      }
      
      console.log('📧 Encontrou email:', profile.email)
      const userEmail = profile.email
      
      const { error: err } = await supabase.auth.signInWithPassword({ 
        email: userEmail, 
        password 
      })
      if (err) {
        console.error('❌ Erro login username:', err)
        setError(err.message.includes('Invalid') ? 'E-mail ou senha incorretos.' : err.message)
        setLoading(false)
      } else {
        console.log('✅ Login bem-sucedido!')
        window.location.href = '/dashboard'
      }
    } catch (e) {
      console.error('❌ Exceção no login:', e)
      setError('Erro ao fazer login. Verifique sua conexão.')
      setLoading(false)
    }
  }

  async function doSignup() {
    setLoading(true); setError(null)
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email, 
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
          data: { 
            username: username.toLowerCase(),
            avatar: JSON.stringify(avatar) 
          },
        },
      })
      
      if (err) {
        console.error('Signup error:', err)
        setError(err.message)
        setLoading(false)
        return
      }
      
      if (!data.user) {
        setError('Erro ao criar conta. Tente novamente.')
        setLoading(false)
        return
      }
      
      console.log('✅ Conta criada! User ID:', data.user.id)
      
      // Tentar fazer login automático (funciona em desenvolvimento)
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (loginErr) {
        console.log('⚠️ Login automático não funcionou, vai para página de verificação')
        console.log('📧 Verifique seu e-mail:', email)
        setStep('done')
      } else {
        console.log('✅ Login automático bem-sucedido!')
        window.location.href = '/dashboard'
      }
      
      setLoading(false)
    } catch (e) {
      console.error('Signup exception:', e)
      setError('Erro ao criar conta. Verifique sua conexão.')
      setLoading(false)
    }
  }

  const bg = '#05050e'

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bg }}>
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"/>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: bg }}>

      {/* Theme Selector - Topo Direito */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeSelector />
      </div>

      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full"
          style={{ background:'radial-gradient(circle,rgba(37,99,235,0.09) 0%,transparent 70%)', filter:'blur(60px)' }}/>
      </div>
      <div className="absolute inset-0 opacity-[0.018]"
        style={{ backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize:'48px 48px' }}/>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
        className="relative z-10 w-full max-w-md">

        <Link href="/" className="flex items-center justify-center gap-2 mb-7 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center transition-all group-hover:scale-110"
            style={{ boxShadow:'0 0 20px rgba(37,99,235,0.4)' }}>
            <Languages size={18} className="text-white"/>
          </div>
          <span className="text-xl font-black text-white">Fluency<span className="text-blue-400">OS</span></span>
        </Link>

        <div className="rounded-2xl overflow-hidden"
          style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 32px 80px rgba(0,0,0,0.5)' }}>
          <AnimatePresence mode="wait">

            {/* ── CHOICE ── */}
            {step==='choice' && (
              <motion.div key="choice"
                initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
                transition={{ duration:0.22 }} className="p-8">
                <div className="text-center mb-7">
                  <h1 className="text-2xl font-black text-white mb-2">Bora começar?</h1>
                  <p className="text-slate-400 text-sm">Use seu apelido — não precisa ser seu nome real.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { mode:'signup' as const, icon:<Sparkles size={20} className="text-white"/>, bg:'bg-blue-600', title:'Criar conta', sub:'100% gratuito', border:'rgba(37,99,235,0.3)', bgCard:'rgba(37,99,235,0.08)' },
                    { mode:'login' as const,  icon:<Mail size={20} className="text-slate-300"/>,  bg:'',           title:'Já tenho conta', sub:'Fazer login', border:'rgba(255,255,255,0.07)', bgCard:'rgba(255,255,255,0.03)' },
                  ].map(opt => (
                    <button key={opt.mode} onClick={() => { setMode(opt.mode); setStep('form') }}
                      className="flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-200 group"
                      style={{ background:opt.bgCard, border:`1.5px solid ${opt.border}` }}
                      onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${opt.bg}`}
                        style={{ background: opt.bg ? undefined : 'rgba(255,255,255,0.06)', border: opt.bg ? undefined : '1px solid rgba(255,255,255,0.1)', boxShadow: opt.bg ? '0 0 18px rgba(37,99,235,0.35)' : 'none' }}>
                        {opt.icon}
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-white">{opt.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{opt.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.14)' }}>
                  <div className="flex -space-x-1.5">
                    {[11,22,33].map(n=><img key={n} src={`https://i.pravatar.cc/24?img=${n}`} alt="" className="w-6 h-6 rounded-full border" style={{ borderColor:'#0d0d1a' }}/>)}
                  </div>
                  <p className="text-[12px] text-slate-400"><span className="text-green-400 font-bold">312 pessoas</span> no beta — sem cartão</p>
                </div>
              </motion.div>
            )}

            {/* ── FORM ── */}
            {step==='form' && (
              <motion.div key="form"
                initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
                transition={{ duration:0.22 }} className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => { setStep('choice'); setError(null) }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    style={{ border:'1px solid rgba(255,255,255,0.08)' }}>
                    <ArrowLeft size={14}/>
                  </button>
                  <div>
                    <h2 className="text-lg font-black text-white">{mode==='signup' ? 'Sua identidade' : 'Bem-vindo de volta'}</h2>
                    <p className="text-[12px] text-slate-500">{mode==='signup' ? 'Apelido, username de jogo — o que quiser' : 'E-mail e senha da sua conta'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {mode==='signup' && (
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Apelido / Username</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-blue-400">@</span>
                        <input type="text" value={username}
                          onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g,''))}
                          onBlur={() => setTouched(t=>({...t,username:true}))}
                          className="w-full pl-8 pr-10 py-3.5 rounded-xl text-white text-sm font-medium outline-none transition-all"
                          style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${uErr?'rgba(239,68,68,0.4)':username&&!usernameErr(username)?'rgba(16,185,129,0.35)':'rgba(255,255,255,0.08)'}` }}
                          placeholder="ninja_pro, darkwizard, gamer99..."
                          maxLength={20}/>
                        {username && !usernameErr(username) && <CheckCircle size={14} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color:'#34d399' }}/>}
                      </div>
                      {uErr && <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle size={10}/> {uErr}</p>}
                      {!uErr && username && <p className="text-[11px] text-slate-500 mt-1.5">Seu mentor vai te chamar de <span className="text-blue-400 font-bold">@{username}</span></p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                      {mode==='login' ? 'E-mail ou Usuário' : 'E-mail'}
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"/>
                      {mode==='login' ? (
                        <input 
                          type="text" 
                          value={loginInput} 
                          onChange={e=>setLoginInput(e.target.value)}
                          onBlur={()=>setTouched(t=>({...t,email:true}))}
                          className="w-full pl-10 pr-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                          style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${touched.email&&!loginInput?'rgba(239,68,68,0.4)':'rgba(255,255,255,0.08)'}` }}
                          placeholder="seu@email.com ou seu_usuario"/>
                      ) : (
                        <input 
                          type="email" 
                          value={email} 
                          onChange={e=>setEmail(e.target.value)}
                          onBlur={()=>setTouched(t=>({...t,email:true}))}
                          className="w-full pl-10 pr-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                          style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${touched.email&&!email.includes('@')?'rgba(239,68,68,0.4)':'rgba(255,255,255,0.08)'}` }}
                          placeholder="seu@email.com"/>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Senha</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"/>
                      <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3.5 rounded-xl text-white text-sm outline-none"
                        style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}
                        placeholder={mode==='signup'?'Crie uma senha forte':'Sua senha'}/>
                      <button onClick={()=>setShowPass(s=>!s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                        {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
                      </button>
                    </div>
                    {mode==='signup' && password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1.5">
                          {[1,2,3,4].map(i=><div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background:i<=pw.s?pw.color:'rgba(255,255,255,0.07)' }}/>)}
                        </div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-[11px] font-bold" style={{ color:pw.color }}>{pw.label}</span>
                          {rules.map(r=>(
                            <span key={r.label} className={`text-[10px] flex items-center gap-0.5 ${r.ok?'text-green-400':'text-slate-600'}`}>
                              {r.ok?<CheckCircle size={9}/>:<div className="w-2 h-2 rounded-full bg-slate-700"/>} {r.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 mt-4 px-4 py-3 rounded-xl"
                    style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5"/>
                    <p className="text-[12px] text-red-400">{error}</p>
                  </div>
                )}

                <button
                  onClick={() => mode==='login' ? doLogin() : canForm && setStep('avatar')}
                  disabled={loading || !canForm}
                  className="w-full mt-5 py-3.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background:'#2563eb', boxShadow:'0 4px 20px rgba(37,99,235,0.28)', opacity:(loading||!canForm)?0.5:1 }}>
                  {loading ? 'Aguarde...' : mode==='signup' ? 'Próximo — criar personagem' : 'Entrar'}
                  {!loading && <ArrowRight size={14} className="inline ml-1.5"/>}
                </button>

                {mode==='login' && (
                  <p className="text-center text-[12px] text-slate-600 mt-4">
                    Não tem conta? <button onClick={()=>{setMode('signup');setError(null)}} className="text-blue-400 hover:text-blue-300 font-semibold">Criar agora</button>
                  </p>
                )}
              </motion.div>
            )}

            {/* ── AVATAR CREATOR ── */}
            {step==='avatar' && (
              <motion.div key="avatar"
                initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
                transition={{ duration:0.22 }} className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <button onClick={()=>setStep('form')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    style={{ border:'1px solid rgba(255,255,255,0.08)' }}>
                    <ArrowLeft size={14}/>
                  </button>
                  <div>
                    <h2 className="text-lg font-black text-white">Crie seu personagem</h2>
                    <p className="text-[12px] text-slate-500">Totalmente único e seu</p>
                  </div>
                </div>

                <AvatarCreator cfg={avatar} onChange={setAvatar}/>

                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mt-4 mb-4"
                  style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.15)' }}>
                  <Zap size={12} style={{ color:'#f59e0b', flexShrink:0 }}/>
                  <p className="text-[11px] text-slate-400">Itens com número são desbloqueados com <span className="text-yellow-400 font-bold">XP</span> conforme você aprende.</p>
                </div>

                {error && (
                  <div className="flex items-start gap-2 mb-4 px-4 py-3 rounded-xl"
                    style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5"/>
                    <p className="text-[12px] text-red-400">{error}</p>
                  </div>
                )}

                <button onClick={doSignup} disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background:'#2563eb', boxShadow:'0 4px 20px rgba(37,99,235,0.28)', opacity:loading?0.7:1 }}>
                  {loading ? 'Criando sua conta...' : 'Criar minha conta'}
                  {!loading && <ArrowRight size={14} className="inline ml-1.5"/>}
                </button>
              </motion.div>
            )}

            {/* ── DONE ── */}
            {step==='done' && (
              <motion.div key="done"
                initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
                transition={{ duration:0.4 }} className="p-10 text-center">
                <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', duration:0.6, delay:0.1 }}
                  className="w-28 h-28 mx-auto mb-5 rounded-2xl overflow-hidden"
                  style={{ border:'2px solid rgba(37,99,235,0.4)' }}>
                  <img src={avatarUrl(avatar)} alt="avatar" className="w-full h-full"/>
                </motion.div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4"
                  style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)' }}>
                  <ShieldCheck size={13} style={{ color:'#34d399' }}/>
                  <span className="text-[11px] font-bold text-green-400">Conta criada!</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Bem-vindo(a), <span className="text-blue-400">@{username}</span></h2>
                <p className="text-slate-400 text-sm mb-5">Confirme seu e-mail para ativar a conta.</p>
                <div className="px-5 py-4 rounded-xl mb-5"
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[13px] text-slate-300">E-mail enviado para <span className="text-white font-semibold">{email}</span>. Clique no link para ativar.</p>
                </div>
                <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-bold text-white px-6 py-3 rounded-xl"
                  style={{ background:'#2563eb' }}>
                  Voltar ao início
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <p className="text-center text-[11px] text-slate-700 mt-5">
          Ao criar conta você concorda com os <Link href="#" className="text-slate-500 hover:text-slate-400">Termos</Link> e <Link href="#" className="text-slate-500 hover:text-slate-400">Privacidade</Link>
        </p>
      </motion.div>
    </div>
  )
}