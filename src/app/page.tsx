'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ThemeSelector } from '@/components/shared/ThemeSelector'
import { NavbarAuth } from '@/components/shared/NavbarAuth'
import {
  Mic2, Brain, ChevronRight, ChevronLeft, CheckCircle,
  ArrowRight, Zap, Languages, Star, Flame, Target,
  Sparkles, BookOpen, Menu, X, Crown, Palette,
  RotateCcw, GraduationCap, Lightbulb, Lock, Globe,
  User, Clock, Trophy, Tv, Headphones, PenLine,
  BookMarked, Coffee, MessageSquare, ChevronDown,
  ShoppingBag, Unlock, Timer, AlertCircle, Rocket,
  Sword, Wand2, Shield, Code, Bird, Zap as ZapIcon
} from 'lucide-react'
import Link from 'next/link'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Level = 'iniciante' | 'basico' | 'intermediario' | 'fluente'

// ─── AVATAR DATA (game/anime/film references) ─────────────────────────────────

const AVATARS = [
  { id:'warrior',  label:'Guerreiro',   icon: Sword, xp:0,    unlocked:true  },
  { id:'mage',     label:'Mago',        icon: Wand2, xp:0,    unlocked:true  },
  { id:'ninja',    label:'Ninja',       icon: User, xp:100,  unlocked:false },
  { id:'knight',   label:'Cavaleiro',   icon: Shield, xp:200,  unlocked:false },
  { id:'astronaut',label:'Astronauta',  icon: Rocket, xp:300, unlocked:false },
  { id:'hacker',   label:'Hacker',      icon: Code, xp:400,  unlocked:false },
  { id:'samurai',  label:'Samurai',     icon: Sword, xp:500,  unlocked:false },
  { id:'phoenix',  label:'Fênix',       icon: Bird, xp:700,  unlocked:false },
  { id:'dragon',   label:'Dragão',      icon: ZapIcon, xp:1000, unlocked:false },
  { id:'legendary',label:'Lendário',    icon: Crown, xp:2000, unlocked:false },
]

// ─── LEVEL DATA ───────────────────────────────────────────────────────────────

const LEVELS: { id: Level; label: string; labelEn?: string; color: string }[] = [
  { id:'iniciante',     label:'Iniciante',     color:'#10b981' },
  { id:'basico',        label:'Básico',        color:'#3b82f6' },
  { id:'intermediario', label:'Intermediário', color:'#8b5cf6' },
  { id:'fluente',       label:'Fluente',       labelEn:'Fluent', color:'#f59e0b' },
]

// ─── 300 QUESTIONS POOL (10 per level shown at a time) ───────────────────────

const ALL_QUESTIONS: Record<Level, { term: string; translation?: string; tip: string; tipEn?: string; options: string[]; answer: number }[]> = {
  iniciante: [
    { term:'Good morning',      translation:'Bom dia',           tip:'Use antes do meio-dia para cumprimentar alguém.',                                   options:['Boa noite','Bom dia','Até logo','Por favor'],             answer:1 },
    { term:'Thank you',         translation:'Obrigado(a)',        tip:'"Thanks" é a versão informal. Ambas são corretas.',                                 options:['Me desculpe','Com licença','Obrigado','De nada'],         answer:2 },
    { term:'How are you?',      translation:'Como você está?',    tip:'A resposta padrão é "Fine, thanks!" mesmo sem ser literal.',                        options:['Onde fica?','Como você está?','Qual seu nome?','Quanto custa?'], answer:1 },
    { term:'My name is',        translation:'Meu nome é',         tip:'Apresentação básica. Ex: "My name is Maria."',                                      options:['Eu moro em','Meu nome é','Eu gosto de','Eu tenho'],       answer:1 },
    { term:'Excuse me',         translation:'Com licença',        tip:'Use para pedir passagem ou chamar atenção de alguém.',                               options:['Obrigado','Com licença','De nada','Por favor'],           answer:1 },
    { term:'Please',            translation:'Por favor',          tip:'Sempre torna um pedido mais educado.',                                               options:['Sempre','Por favor','Nunca','Talvez'],                    answer:1 },
    { term:'I don\'t understand',translation:'Não entendo',       tip:'Diga isso quando não compreender algo em inglês.',                                   options:['Eu sei','Não entendo','Eu gosto','Eu preciso'],           answer:1 },
    { term:'Where is the...?',  translation:'Onde fica o/a...?',  tip:'Base para pedir direções. Ex: "Where is the bathroom?"',                            options:['Como se faz?','Onde fica?','Quando abre?','Quanto custa?'],answer:1 },
    { term:'How much?',         translation:'Quanto custa?',      tip:'Útil em lojas e restaurantes.',                                                      options:['Onde fica?','Quanto pesa?','Quanto custa?','Quando?'],    answer:2 },
    { term:'I need help',       translation:'Preciso de ajuda',   tip:'"Help!" sozinho também funciona em emergências.',                                    options:['Preciso de ajuda','Estou bem','Não quero','Vou embora'],  answer:0 },
    { term:'Good afternoon',    translation:'Boa tarde',          tip:'Use do meio-dia até o fim da tarde.',                                                  options:['Boa noite','Boa tarde','Bom dia','Até logo'],             answer:1 },
    { term:'Good evening',      translation:'Boa noite (chegada)',tip:'Use ao chegar à noite. Para dormir: "Good night".',                                   options:['Bom dia','Boa noite (chegada)','Boa tarde','Tchau'],      answer:1 },
    { term:'Sorry',             translation:'Desculpa',           tip:'Use para pedir desculpas.',                                                            options:['Obrigado','Desculpa','Por favor','Com licença'],         answer:1 },
    { term:'See you later',     translation:'Até mais',           tip:'Despedida informal.',                                                                   options:['Até mais','Agora não','Amanhã','Tudo bem'],               answer:0 },
    { term:'Bathroom',          translation:'Banheiro',           tip:'Útil para pedir direções: "Where is the bathroom?"',                                  options:['Cozinha','Banheiro','Quarto','Sala'],                     answer:1 },
    { term:'Left',              translation:'Esquerda',           tip:'Direção. "Turn left" = vire à esquerda.',                                              options:['Direita','Esquerda','Frente','Atrás'],                    answer:1 },
    { term:'Right',             translation:'Direita',            tip:'Direção. "Turn right" = vire à direita.',                                             options:['Direita','Esquerda','Frente','Atrás'],                    answer:0 },
    { term:'I like',            translation:'Eu gosto',           tip:'Use para dizer preferências: "I like coffee."',                                       options:['Eu gosto','Eu preciso','Eu quero','Eu tenho'],            answer:0 },
    { term:'I want',            translation:'Eu quero',           tip:'Use para dizer vontade: "I want water."',                                             options:['Eu sou','Eu quero','Eu gosto','Eu preciso'],              answer:1 },
    { term:'Help!',             translation:'Socorro!',           tip:'Use em situações de emergência.',                                                     options:['Socorro!','Obrigado','Desculpa','Por favor'],             answer:0 },
  ],
  basico: [
    { term:'Could you repeat?', translation:'Você pode repetir?', tip:'"Could" soa mais educado que "can" em pedidos.',                                    options:['Pode me ajudar?','Você pode repetir?','Onde fica?','Quanto custa?'], answer:1 },
    { term:'I would like',      translation:'Eu gostaria de',     tip:'Mais educado que "I want". Use em restaurantes e lojas.',                           options:['Eu preciso','Eu gostaria de','Eu tenho','Eu sei'],         answer:1 },
    { term:'What time is it?',  translation:'Que horas são?',     tip:'Resposta: "It\'s three o\'clock."',                                                  options:['Que dia é hoje?','Quanto tempo?','Que horas são?','Quando?'], answer:2 },
    { term:'I\'m looking for',  translation:'Estou procurando',   tip:'Use em lojas: "I\'m looking for a shirt."',                                          options:['Estou comprando','Estou procurando','Estou vendendo','Estou pegando'], answer:1 },
    { term:'Can I have...?',    translation:'Posso ter...?',       tip:'Jeito educado de pedir algo. Ex: "Can I have the menu?"',                           options:['Posso ir?','Posso pagar?','Posso ter?','Posso ver?'],      answer:2 },
    { term:'How do I get to',   translation:'Como eu vou para',   tip:'Base para pedir direções específicas.',                                              options:['Como eu pago?','Como eu falo?','Como eu vou para','Como eu volto?'], answer:2 },
    { term:'I\'m from Brazil',  translation:'Sou do Brasil',      tip:'"I\'m from" + país ou cidade.',                                                      options:['Moro no Brasil','Sou do Brasil','Fui para o Brasil','Conheço o Brasil'], answer:1 },
    { term:'Do you speak English?', translation:'Você fala inglês?', tip:'Útil para confirmar antes de iniciar uma conversa.',                             options:['Você fala inglês?','Você estuda inglês?','Você gosta de inglês?','Você entende inglês?'], answer:0 },
    { term:'Let me think',      translation:'Deixa eu pensar',    tip:'Compra tempo para formular sua resposta.',                                           options:['Não sei','Deixa eu pensar','Eu concordo','Vamos logo'],   answer:1 },
    { term:'Nice to meet you',  translation:'Prazer em te conhecer', tip:'Use ao ser apresentado a alguém.',                                               options:['Até logo','Boa sorte','Prazer em te conhecer','Me desculpe'], answer:2 },
    { term:'Could you help me?', translation:'Você pode me ajudar?',  tip:'Pedido educado. "Could" é mais formal que "can".',                                 options:['Você pode me ajudar?','Você quer ir?','Você sabe?','Você tem?'], answer:0 },
    { term:'Can you speak slowly?', translation:'Pode falar devagar?', tip:'Muito útil em conversas reais.',                                                options:['Pode repetir?','Pode falar devagar?','Pode esperar?','Pode ligar?'], answer:1 },
    { term:'Where is the bathroom?', translation:'Onde fica o banheiro?', tip:'Frase direta para pedir direção.',                                          options:['Onde fica o banheiro?','Quanto custa?','Qual seu nome?','Que horas são?'], answer:0 },
    { term:'I need a receipt', translation:'Preciso de recibo', tip:'Útil em lojas e restaurantes.',                                                         options:['Preciso de recibo','Preciso de ajuda','Quero um café','Posso pagar'], answer:0 },
    { term:'I\'d like a table for two', translation:'Quero uma mesa para dois', tip:'Expressão comum em restaurantes.',                                     options:['Quero uma mesa para dois','Quero pagar','Quero ir','Quero um cardápio'], answer:0 },
    { term:'Do you accept credit cards?', translation:'Aceita cartão de crédito?', tip:'Pergunta frequente no Brasil e fora.',                             options:['Aceita cartão de crédito?','Tem troco?','É barato?','Fecha tarde?'], answer:0 },
    { term:'How far is it?', translation:'É longe?', tip:'Pergunta sobre distância.',                                                                         options:['É longe?','É perto?','É caro?','É seguro?'], answer:0 },
    { term:'What do you recommend?', translation:'O que você recomenda?', tip:'Útil em restaurantes/lojas.',                                                options:['O que você recomenda?','O que você vende?','O que você faz?','O que você quer?'], answer:0 },
    { term:'I\'m allergic to...', translation:'Sou alérgico(a) a...', tip:'Importante ao pedir comida.',                                                   options:['Sou alérgico(a) a...','Eu adoro...','Eu não quero...','Eu preciso de...'], answer:0 },
    { term:'Could you take a picture?', translation:'Pode tirar uma foto?', tip:'Pedido educado para turistas.',                                            options:['Pode tirar uma foto?','Pode me ajudar?','Pode falar?','Pode esperar?'], answer:0 },
  ],
  intermediario: [
    { term:'I\'ve been meaning to', tipEn:'Use to explain you planned something but haven\'t done it yet. Shows intention.',                    tip:'', options:['I was going to','I\'ve been meaning to','I should have','I used to'], answer:1 },
    { term:'Nevertheless',      tipEn:'"Despite that / even so". More formal than "but" — great for presentations.',                            tip:'', options:['Therefore','Nevertheless','Meanwhile','Otherwise'],       answer:1 },
    { term:'To take for granted', tipEn:'Idiom: to not appreciate something you assume will always be there.',                                  tip:'', options:['To appreciate','To give up','To take for granted','To try harder'], answer:2 },
    { term:'Bear in mind',      tipEn:'Means "remember / keep in mind". Very common in formal and informal English.',                           tip:'', options:['Forget about it','Bear in mind','Think about','Give up'],   answer:1 },
    { term:'On the other hand', tipEn:'Used to introduce a contrasting point. Essential for arguments and essays.',                             tip:'', options:['In addition','On the other hand','As a result','For example'], answer:1 },
    { term:'It goes without saying', tipEn:'Something so obvious it doesn\'t need explanation. Common in formal speech.',                      tip:'', options:['It\'s complicated','It goes without saying','Needless to try','It matters'], answer:1 },
    { term:'To cut corners',    tipEn:'Idiom: to do something the easy/cheap way, often sacrificing quality.',                                  tip:'', options:['To work harder','To save money well','To cut corners','To improve quality'], answer:2 },
    { term:'To be on the fence', tipEn:'To be undecided or neutral about something.',                                                           tip:'', options:['To be certain','To disagree','To be on the fence','To support'],  answer:2 },
    { term:'Allegedly',         tipEn:'Used when something is claimed but not proven. Very common in news and law.',                            tip:'', options:['Definitely','Allegedly','Obviously','Certainly'],           answer:1 },
    { term:'To bring up',       tipEn:'Phrasal verb: to mention a topic in conversation. "She brought up an interesting point."',               tip:'', options:['To ignore','To bring up','To look up','To give up'],        answer:1 },
    { term:'In a nutshell',     tipEn:'Means "in summary" or "briefly". Great for conclusions.',                                          tip:'', options:['In detail','In a nutshell','By accident','In advance'],     answer:1 },
    { term:'To get used to',    tipEn:'To become accustomed to something over time.',                                                      tip:'', options:['To avoid','To get used to','To complain','To give up'],      answer:1 },
    { term:'To run out of',     tipEn:'To have no more of something. Common daily phrase.',                                                 tip:'', options:['To save','To run out of','To buy','To cook'],               answer:1 },
    { term:'To look forward to',tipEn:'To feel excited about a future event.',                                                             tip:'', options:['To fear','To ignore','To look forward to','To refuse'],     answer:2 },
    { term:'At the end of the day', tipEn:'Means "ultimately" or "when all is said and done".',                                            tip:'', options:['During the day','At the end of the day','In the morning','In the past'], answer:1 },
    { term:'To figure out',     tipEn:'To solve or understand something.',                                                                  tip:'', options:['To guess','To figure out','To hide','To celebrate'],        answer:1 },
    { term:'To set up',         tipEn:'To arrange or organize something (a meeting, a system).',                                           tip:'', options:['To destroy','To set up','To avoid','To repeat'],            answer:1 },
    { term:'To keep in mind',   tipEn:'To remember something important.',                                                                   tip:'', options:['To forget','To keep in mind','To skip','To finish'],        answer:1 },
    { term:'From my perspective', tipEn:'A polite way to present your opinion.',                                                           tip:'', options:['From my perspective','From the top','From time to time','From scratch'], answer:0 },
    { term:'On top of that',    tipEn:'Used to add extra information: "Besides that".',                                                    tip:'', options:['On top of that','On the bottom','By mistake','In exchange'], answer:0 },
  ],
  fluente: [
    { term:'Serendipity',       tipEn:'Finding something good without looking for it. From a Persian fairy tale.',                              tip:'', options:['Bad luck','Planned success','Serendipity','Misfortune'],    answer:2 },
    { term:'To hedge one\'s bets', tipEn:'Protect against loss by supporting multiple options. Common in business.',                           tip:'', options:['To gamble all','To hedge bets','To take risk','To invest'],  answer:1 },
    { term:'Idiosyncratic',     tipEn:'Peculiar to an individual — their unique habits or way of thinking.',                                    tip:'', options:['Common','Typical','Idiosyncratic','Predictable'],           answer:2 },
    { term:'Sycophantic',       tipEn:'Excessively flattering to gain favor. "Yes-men" are sycophantic.',                                      tip:'', options:['Critical','Honest','Sycophantic','Indifferent'],            answer:2 },
    { term:'Ephemeral',         tipEn:'Lasting for a very short time. Social media stories are ephemeral.',                                     tip:'', options:['Eternal','Slow','Ephemeral','Massive'],                     answer:2 },
    { term:'Juxtaposition',     tipEn:'Placing two contrasting things side by side for effect.',                                                tip:'', options:['Similarity','Juxtaposition','Repetition','Omission'],       answer:1 },
    { term:'Ostensibly',        tipEn:'Apparently or seemingly — but not necessarily truly so.',                                                tip:'', options:['Obviously','Ostensibly','Certainly','Barely'],              answer:1 },
    { term:'To prevaricate',    tipEn:'To speak or act evasively — to avoid giving a direct answer.',                                          tip:'', options:['To be direct','To prevaricate','To listen well','To explain'],answer:1 },
    { term:'Pragmatic',         tipEn:'Dealing with things practically rather than theoretically.',                                             tip:'', options:['Idealistic','Dreamy','Pragmatic','Impractical'],            answer:2 },
    { term:'Cathartic',         tipEn:'Providing psychological release and relief. Crying during a film can be cathartic.',                    tip:'', options:['Stressful','Boring','Painful','Cathartic'],                answer:3 },
    { term:'Ubiquitous',        tipEn:'Present everywhere. Smartphones are ubiquitous.',                                                   tip:'', options:['Rare','Ubiquitous','Fragile','Temporary'],                answer:1 },
    { term:'To corroborate',    tipEn:'To confirm or support with evidence.',                                                               tip:'', options:['To deny','To corroborate','To ignore','To confuse'],       answer:1 },
    { term:'Caveat',            tipEn:'A warning or condition to consider.',                                                                tip:'', options:['Solution','Caveat','Guarantee','Reward'],                 answer:1 },
    { term:'To circumvent',     tipEn:'To find a way around an obstacle or rule.',                                                          tip:'', options:['To follow','To circumvent','To confront','To simplify'],   answer:1 },
    { term:'Quintessential',    tipEn:'The most perfect or typical example of something.',                                                  tip:'', options:['Quintessential','Unrelated','Temporary','Minor'],          answer:0 },
    { term:'To mitigate',       tipEn:'To make something less severe or intense.',                                                          tip:'', options:['To worsen','To mitigate','To ignore','To guarantee'],      answer:1 },
    { term:'To underscore',     tipEn:'To emphasize a point strongly.',                                                                     tip:'', options:['To hide','To underscore','To doubt','To refuse'],          answer:1 },
    { term:'Harrowing',         tipEn:'Extremely distressing or terrifying.',                                                               tip:'', options:['Comforting','Harrowing','Ordinary','Predictable'],         answer:1 },
    { term:'To reconcile',      tipEn:'To restore harmony or to make compatible.',                                                          tip:'', options:['To separate','To reconcile','To delay','To reject'],        answer:1 },
    { term:'Notwithstanding',   tipEn:'Despite something. A formal connector.',                                                             tip:'', options:['Notwithstanding','Meanwhile','Therefore','Likewise'],       answer:0 },
  ],
}

// ─── TIPS DATA ────────────────────────────────────────────────────────────────

const TIPS = [
  {
    icon: Tv,
    color: '#3b82f6',
    title: 'Assista com legenda em inglês',
    desc: 'Troque a legenda em português pela versão em inglês. Você vai errar no começo — e é exatamente isso que acelera o aprendizado.',
    tag: 'Imersão',
  },
  {
    icon: PenLine,
    color: '#10b981',
    title: 'Escreva à mão, não no teclado',
    desc: 'Estudos mostram que escrever à mão ativa mais regiões do cérebro. Anote vocabulário novo num caderno físico — a fixação é muito maior.',
    tag: 'Técnica',
  },
  {
    icon: Headphones,
    color: '#8b5cf6',
    title: 'Escute enquanto faz outra coisa',
    desc: 'Podcasts em inglês durante o trajeto, academia ou cozinha. Seu cérebro absorve padrões de pronúncia mesmo sem foco total.',
    tag: 'Rotina',
  },
  {
    icon: BookMarked,
    color: '#f59e0b',
    title: 'O método do "1 palavra por dia"',
    desc: 'Aprenda uma palavra nova por dia e use ela em 3 frases diferentes. Em 1 ano são 365 palavras solidamente fixadas.',
    tag: 'Vocabulário',
  },
  {
    icon: Coffee,
    color: '#ef4444',
    title: 'Mude o idioma do seu celular',
    desc: 'Parece simples, mas você usa o celular dezenas de vezes por dia. Cada notificação, menu e botão vira uma micro-aula.',
    tag: 'Imersão',
  },
  {
    icon: MessageSquare,
    color: '#ec4899',
    title: 'Pense em inglês, não traduza',
    desc: 'Quando ver uma cadeira, pense "chair" — não "cadeira → chair". A fluência vem quando você para de traduzir e começa a pensar no idioma.',
    tag: 'Mentalidade',
  },
]

// ─── MENTOR PRESETS ───────────────────────────────────────────────────────────

const MENTOR_PRESETS = [
  { id:'aria',  name:'Aria',  style:'Descontraída', color:'#f59e0b', initials:'AR', desc:'Linguagem leve, gírias do dia a dia e papo fluido. Para quem aprende melhor sem pressão.' },
  { id:'leo',   name:'Leo',   style:'Direto',       color:'#3b82f6', initials:'LE', desc:'Objetivo, rápido e focado em resultados. Para quem quer evoluir sem enrolação.' },
  { id:'sofia', name:'Sofia', style:'Acadêmica',    color:'#8b5cf6', initials:'SO', desc:'Contextualiza cada ponto, explica a raiz. Para quem quer entender o idioma de verdade.' },
]

const REVIEWS = [
  { name:'Carla M.',   city:'São Paulo',      text:'Finalmente um app que não trata todo mundo igual. Minha mentora Aria fala como eu — isso fez toda a diferença.', stars:5, level:'A2→B1', weeks:8  },
  { name:'Thomaz R.',  city:'Belo Horizonte', text:'Em 3 meses consigo me virar em reuniões com clientes americanos. O foco em vocabulário do meu setor foi cirúrgico.', stars:5, level:'B1→B2', weeks:14 },
  { name:'Isabela V.', city:'Recife',         text:'Já tentei quatro aplicativos diferentes. Esse é o único em que sinto que o mentor realmente me conhece.', stars:5, level:'A1→A2', weeks:5 },
]

// ─── UTILS ────────────────────────────────────────────────────────────────────

const CYCLE_HOURS = 5
const CYCLE_MS    = CYCLE_HOURS * 60 * 60 * 1000

function getCycleIndex() {
  return Math.floor(Date.now() / CYCLE_MS)
}

function getQuestionsForCycle(level: Level): typeof ALL_QUESTIONS[Level] {
  const pool = ALL_QUESTIONS[level]
  const levelSeed = ({ iniciante: 11, basico: 23, intermediario: 37, fluente: 51 } as Record<Level, number>)[level]
  const seed = getCycleIndex() + levelSeed * 1000
  const shuffled = shuffleWithSeed(pool, seed)
  return shuffled.slice(0, 10)
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

function getTimeUntilNext(): { h: number; m: number; s: number } {
  const next  = (getCycleIndex() + 1) * CYCLE_MS
  const diff  = next - Date.now()
  const h     = Math.floor(diff / 3600000)
  const m     = Math.floor((diff % 3600000) / 60000)
  const s     = Math.floor((diff % 60000) / 1000)
  return { h, m, s }
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [open, setOpen]       = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrolled  = scrollY > 48
  const scrollPct = typeof window !== 'undefined'
    ? Math.min(scrollY / Math.max((document.documentElement.scrollHeight - window.innerHeight) || 1, 1) * 100, 100)
    : 0

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute top-0 left-0 h-[2px] transition-all duration-150 z-10"
        style={{ width: `${scrollPct}%`, background: 'linear-gradient(90deg,#2563eb,#60a5fa)', opacity: scrolled ? 1 : 0 }} />

      <div className="transition-all duration-500"
        style={scrolled ? { background: 'rgba(5,5,14,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' } : {}}>
        <nav className="max-w-6xl mx-auto px-5 h-[60px] flex items-center justify-between">

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center transition-all group-hover:scale-110"
              style={{ boxShadow: scrolled ? '0 0 14px rgba(37,99,235,0.5)' : 'none' }}>
              <Languages size={16} className="text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">Fluency<span className="text-blue-400">OS</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {[['#desafio','Desafio do Dia'],['#mentor','Mentores'],['#dicas','Dicas'],['#progresso','Progresso']].map(([href, label]) => (
              <a key={href} href={href}
                className="text-[13px] px-3.5 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all">
                {label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeSelector />
            <NavbarAuth />
            <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors px-3 py-2">Entrar</Link>
            <Link href="/login"
              className="text-[13px] font-bold px-4 py-2 rounded-lg text-white transition-all"
              style={{ background: '#2563eb', boxShadow: '0 0 20px rgba(37,99,235,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 32px rgba(37,99,235,0.55)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(37,99,235,0.3)')}>
              Começar grátis
            </Link>
          </div>

          <button className="md:hidden text-white p-1" onClick={() => setOpen(o => !o)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
            style={{ background: 'var(--bg-primary)', borderBottom: '1px solid rgba(255,255,255,0.06)' }} className="md:hidden">
            <div className="px-5 py-4 flex flex-col gap-3">
              {[['#desafio','Desafio do Dia'],['#mentor','Mentores'],['#dicas','Dicas'],['#progresso','Progresso']].map(([href, label]) => (
                <a key={href} href={href} className="text-sm text-slate-300 py-1" onClick={() => setOpen(false)}>{label}</a>
              ))}
              <Link href="/login" onClick={() => setOpen(false)}
                className="mt-1 text-sm bg-blue-600 text-white font-bold px-5 py-3.5 rounded-xl text-center">
                Começar grátis — 100% gratuito
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

const HERO_MESSAGES = [
  "Ready? Let's nail that job interview.",
  "Sua pronúncia melhorou muito essa semana.",
  "Vamos revisar o que você errou ontem?",
  "Your accent is getting noticeably better.",
]

function Hero() {
  const [typing, setTyping] = useState('')
  const [msgIdx, setMsgIdx] = useState(0)
  const [phase,  setPhase]  = useState<'typing' | 'pause' | 'deleting'>('typing')

  useEffect(() => {
    const msg = HERO_MESSAGES[msgIdx]
    let t: ReturnType<typeof setTimeout>
    if (phase === 'typing') {
      if (typing.length < msg.length) t = setTimeout(() => setTyping(msg.slice(0, typing.length + 1)), 44)
      else t = setTimeout(() => setPhase('pause'), 2400)
    } else if (phase === 'pause') {
      t = setTimeout(() => setPhase('deleting'), 500)
    } else {
      if (typing.length > 0) t = setTimeout(() => setTyping(tx => tx.slice(0, -1)), 20)
      else { setMsgIdx(i => (i + 1) % HERO_MESSAGES.length); setPhase('typing') }
    }
    return () => clearTimeout(t)
  }, [typing, phase, msgIdx])

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-[60px] overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Video background ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <iframe
          src="https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&mute=1&loop=1&playlist=LXb3EKWsInQ&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
          className="absolute w-[150%] h-[150%] -left-[25%] -top-[25%] pointer-events-none opacity-10"
          allow="autoplay"
          style={{ border: 'none' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(5,5,14,0.7) 0%, rgba(5,5,14,0.5) 40%, rgba(5,5,14,0.95) 100%)' }} />
      </div>

      {/* Grid texture */}
      <div className="absolute inset-0 z-[1] opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

      {/* Glow blobs */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 py-20">
        <div className="grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-center">

          {/* Left */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-7"
              style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', color: '#93c5fd' }}>
              <Sparkles size={10} /> Beta aberto — 100% gratuito
            </div>

            <h1 className="text-[2.7rem] sm:text-5xl lg:text-[3.4rem] font-black text-white leading-[1.06] tracking-tight mb-5">
              Um mentor de IA<br />
              <span className="relative inline-block">
                <span style={{ color: '#60a5fa' }}>feito pra você.</span>
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 280 7" fill="none" preserveAspectRatio="none">
                  <path d="M0 5.5 Q70 1 140 4.5 Q210 8 280 3.5" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5" />
                </svg>
              </span>
            </h1>

            <p className="text-base text-slate-400 leading-relaxed mb-8 max-w-md">
              Escolha seu mentor, complete o desafio do dia e evolua com voz, chat e metas diárias — do jeito que <em>você</em> aprende.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link href="/login"
                className="cta-button cta-float flex items-center justify-center gap-2 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all"
                style={{ background: '#2563eb', boxShadow: '0 4px 24px rgba(37,99,235,0.38)' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                Criar meu mentor grátis <ArrowRight size={15} />
              </Link>
              <a href="#desafio"
                className="flex items-center justify-center gap-2 text-slate-300 hover:text-white px-7 py-3.5 rounded-xl text-sm transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.09)' }}>
                <Target size={13} style={{ color: '#60a5fa' }} /> Desafio do dia
              </a>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              {[
                { title:'Desafio do Dia', value:'10 questões', note:'Atualiza a cada 5h', icon: Target, color:'#60a5fa' },
                { title:'Módulo 1',       value:'Fundamentos', note:'+250 XP',           icon: BookOpen, color:'#34d399' },
                { title:'IA Mentor',      value:'Chat + Voz',  note:'Feedback instantâneo', icon: Mic2, color:'#f59e0b' },
              ].map(card => (
                <div key={card.title} className="rounded-xl p-4"
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background:`${card.color}15` }}>
                      <card.icon size={14} style={{ color: card.color }} />
                    </div>
                    <div className="text-[12px] font-bold text-white">{card.title}</div>
                  </div>
                  <div className="text-[13px] font-semibold text-slate-200">{card.value}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{card.note}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex -space-x-2">
                {[11, 22, 33, 44].map(n => (
                  <img key={n} src={`https://i.pravatar.cc/32?img=${n}`} alt="" className="w-8 h-8 rounded-full border-2 object-cover" style={{ borderColor: '#05050e' }} />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} style={{ color: '#fbbf24', fill: '#fbbf24' }} />)}
                  <span className="text-[11px] text-slate-400 ml-1">4.9 · 47 avaliações</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">312 pessoas no beta</div>
              </div>
            </div>
          </motion.div>

          {/* Right — Chat card */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.2 }} className="hidden lg:block">
            <div className="rounded-2xl overflow-hidden" style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
              <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <User size={18} className="text-white" />
                  </div>
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2" style={{ borderColor: '#0d0d1a' }} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Leo</div>
                  <div className="text-[11px] text-slate-500">Mentor · online agora</div>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <Flame size={10} /> 7 dias
                </div>
              </div>

              <div className="px-5 py-5 space-y-4 min-h-[160px]">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-white" />
                  </div>
                  <div className="text-[13px] px-4 py-3 rounded-2xl rounded-tl-sm leading-relaxed" style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', maxWidth: '85%' }}>
                    Ontem você foi bem no present perfect. Hoje vamos usar em situações reais.
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="text-[13px] px-4 py-3 rounded-2xl rounded-tr-sm" style={{ background: 'rgba(37,99,235,0.18)', color: '#bfdbfe' }}>
                    Bora!
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-white" />
                  </div>
                  <div className="text-[13px] px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                    <span className="text-white">{typing}</span>
                    <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="text-blue-400 ml-0.5">|</motion.span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-[13px] text-slate-600 flex-1">Responda em inglês...</span>
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                    <Mic2 size={14} className="text-white" />
                  </div>
                </div>
              </div>
            </div>

            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}
              className="absolute mt-[-176px] ml-[-28px] rounded-xl px-3.5 py-2.5 shadow-2xl"
              style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-yellow-500 flex items-center justify-center"><Zap size={11} className="text-white" /></div>
                <span className="text-[12px] text-white font-bold">+50 XP ganhos</span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Scroll cue */}
      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-[11px] text-slate-600 uppercase tracking-widest">Scroll</span>
        <ChevronDown size={16} className="text-slate-600" />
      </motion.div>
    </section>
  )
}

// ─── DAILY CHALLENGE ──────────────────────────────────────────────────────────

function DailyChallenge() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const [level,    setLevel]    = useState<Level>('iniciante')
  const [current,  setCurrent]  = useState(0)   // question index 0–9
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [score,    setScore]    = useState(0)
  const [finished, setFinished] = useState(false)
  const [mounted,  setMounted]  = useState(false)
  const [timer,    setTimer]    = useState({ h: 0, m: 0, s: 0 })  // Default value
  const [showLogin, setShowLogin] = useState(false)
  const [feedback, setFeedback] = useState<{ title: string; message: string; tone: 'success' | 'error' } | null>(null)
  const [cycleIdx, setCycleIdx] = useState(getCycleIndex())

  // Sync timer e questions após hidration
  useEffect(() => {
    setMounted(true)
    setTimer(getTimeUntilNext())
  }, [])

  const questions = mounted ? getQuestionsForCycle(level) : ALL_QUESTIONS[level].slice(0, 10)
  const q         = questions[current]
  const isEn      = level === 'intermediario' || level === 'fluente'
  const levelMeta = LEVELS.find(l => l.id === level)!

  // Countdown timer
  useEffect(() => {
    if (!mounted) return
    const t = setInterval(() => setTimer(getTimeUntilNext()), 1000)
    return () => clearInterval(t)
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    const t = setInterval(() => {
      const next = getCycleIndex()
      if (next !== cycleIdx) {
        setCycleIdx(next)
        setCurrent(0)
        setScore(0)
        setFinished(false)
        reset()
      }
    }, 1000)
    return () => clearInterval(t)
  }, [mounted, cycleIdx])

  function reset() { setSelected(null); setRevealed(false) }

  function handleLevelChange(lv: Level) {
    setLevel(lv); setCurrent(0); setSelected(null); setRevealed(false); setScore(0); setFinished(false)
  }

  function handleAnswer() {
    if (selected === null) return
    setRevealed(true)
    if (selected === q.answer) setScore(s => s + 1)
    const correctOption = q.options[q.answer]
    const tipText = isEn ? q.tipEn : q.tip
    const okMsg = tipText || (isEn ? `Correct answer: ${correctOption}.` : `Resposta correta: ${correctOption}.`)
    const badMsg = tipText
      ? `${isEn ? 'Correct:' : 'A correta é'} "${correctOption}". ${tipText}`
      : (isEn ? `Correct answer: ${correctOption}.` : `A correta é "${correctOption}".`)
    setFeedback({
      title: selected === q.answer ? (isEn ? 'Correct!' : 'Correto!') : (isEn ? 'Not this time' : 'Ops! Ainda não'),
      message: selected === q.answer ? okMsg : badMsg,
      tone: selected === q.answer ? 'success' : 'error',
    })
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
      reset()
    } else {
      setFinished(true)
    }
  }

  function handleTryAnswer() {
    setShowLogin(true)
  }

  return (
    <section id="desafio" style={{ background: '#07070f' }} className="py-20 lg:py-28" ref={ref}>
      <div className="max-w-6xl mx-auto px-5">
        {feedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
            style={{ background:'rgba(5,5,14,0.7)', backdropFilter:'blur(6px)' }}>
            <div className="w-full max-w-md rounded-2xl p-6"
              style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2"
                style={{ color: feedback.tone === 'success' ? '#34d399' : '#f87171' }}>
                {feedback.tone === 'success' ? (isEn ? 'Correct answer' : 'Resposta correta') : (isEn ? 'Incorrect answer' : 'Resposta incorreta')}
              </div>
              <div className="text-xl font-black text-white mb-2">{feedback.title}</div>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-5">{feedback.message}</p>
              <button
                onClick={() => setFeedback(null)}
                className="w-full py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: feedback.tone === 'success' ? '#10b981' : '#ef4444' }}>
                {isEn ? 'Continue' : 'Continuar'}
              </button>
            </div>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#60a5fa' }}>
            {isEn ? 'Daily Challenge' : 'Desafio do Dia'}
          </p>
          <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">
            {isEn ? 'Come back every day.' : 'Volte todo dia.'}
          </h2>
          <p className="text-slate-400 max-w-md mx-auto text-sm mb-5">
            {isEn ? '10 questions per level. Resets every 5 hours.' : '10 questões por nível. Atualiza a cada 5 horas.'}
          </p>

          {/* Countdown */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Timer size={13} style={{ color: '#60a5fa' }} />
            <span className="text-[12px] text-slate-400">
              {isEn ? 'New questions in ' : 'Novas questões em '}
              <span className="font-black text-white tabular-nums">
                {String(timer.h).padStart(2, '0')}:{String(timer.m).padStart(2, '0')}:{String(timer.s).padStart(2, '0')}
              </span>
            </span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-2xl mx-auto">

          {/* Level tabs */}
          <div className="flex gap-1.5 mb-6 p-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {LEVELS.map(lv => (
              <button key={lv.id} onClick={() => handleLevelChange(lv.id)}
                className="flex-1 text-[12px] font-semibold py-2.5 rounded-lg transition-all duration-200"
                style={level === lv.id
                  ? { background: lv.color + '18', color: lv.color, border: `1px solid ${lv.color}30` }
                  : { color: '#64748b', border: '1px solid transparent' }}>
                {lv.label}
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full" style={{ background: levelMeta.color }}
                animate={{ width: `${finished ? 100 : (current / questions.length) * 100}%` }}
                transition={{ duration: 0.4 }} />
            </div>
            <span className="text-[11px] text-slate-500 tabular-nums flex-shrink-0">
              {finished ? questions.length : current}/{questions.length}
            </span>
          </div>

          {/* Main card */}
          <AnimatePresence mode="wait">
            {finished ? (
              <motion.div key="finished"
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="rounded-2xl p-8 text-center"
                style={{ background: '#0d0d1a', border: `1px solid ${score >= 7 ? 'rgba(16,185,129,0.3)' : 'rgba(37,99,235,0.25)'}` }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: score >= 7 ? 'rgba(16,185,129,0.12)' : 'rgba(37,99,235,0.12)' }}>
                  <Trophy size={28} style={{ color: score >= 7 ? '#34d399' : '#60a5fa' }} />
                </div>
                <div className="text-4xl font-black text-white mb-1">{score}<span className="text-slate-600">/{questions.length}</span></div>
                <div className="text-sm text-slate-400 mb-6">
                  {score >= 8 ? 'Excelente! Você domina esse nível.' : score >= 5 ? 'Bom trabalho! Continue praticando.' : 'Continue, cada erro é aprendizado.'}
                </div>
                <div className="flex flex-col gap-3">
                  <Link href="/login" className="py-3 rounded-xl text-sm font-bold text-white transition-all text-center"
                    style={{ background: '#2563eb', boxShadow: '0 4px 18px rgba(37,99,235,0.28)' }}>
                    Criar conta para salvar progresso <ArrowRight size={14} className="inline ml-1" />
                  </Link>
                  <button onClick={() => { setCurrent(0); setScore(0); setFinished(false); reset() }}
                    className="py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-all"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    Repetir questões
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key={`${level}-${current}`}
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.28 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: '#0d0d1a', border: `1px solid ${revealed ? (selected === q.answer ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)') : 'rgba(255,255,255,0.07)'}` }}>

                {/* Header */}
                <div className="px-6 py-5 flex items-center gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${levelMeta.color}15` }}>
                    <Lightbulb size={19} style={{ color: levelMeta.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: levelMeta.color }}>
                      {isEn ? `Word of the Day · Q${current + 1}` : `Palavra do Dia · Q${current + 1}`}
                    </div>
                    <div className="text-2xl font-black text-white">{q.term}</div>
                    {q.translation && <div className="text-sm text-slate-500 mt-0.5">{q.translation}</div>}
                  </div>
                  <div className="text-[11px] font-bold px-3 py-1.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(37,99,235,0.1)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.2)' }}>
                    +30 XP
                  </div>
                </div>

                {/* Tip */}
                <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.012)' }}>
                  <p className="text-[13px] text-slate-300 leading-relaxed">{isEn ? q.tipEn : q.tip}</p>
                </div>

                {/* Options */}
                <div className="px-6 py-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600 mb-4">
                    {isEn ? 'What does it mean?' : 'O que significa?'}
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 mb-5">
                    {q.options.map((opt, i) => {
                      const isCorrect  = i === q.answer
                      const isSelected = i === selected
                      let bg     = 'rgba(255,255,255,0.04)'
                      let border = 'rgba(255,255,255,0.07)'
                      let color  = '#94a3b8'
                      if (revealed) {
                        if (isCorrect)        { bg = 'rgba(16,185,129,0.1)';  border = 'rgba(16,185,129,0.35)'; color = '#34d399' }
                        else if (isSelected)  { bg = 'rgba(239,68,68,0.08)'; border = 'rgba(239,68,68,0.3)';   color = '#f87171' }
                      } else if (isSelected) {
                        bg = `${levelMeta.color}10`; border = `${levelMeta.color}35`; color = '#f1f5f9'
                      }
                      return (
                        <button key={i} disabled={revealed} onClick={() => setSelected(i)}
                          className="text-left px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-150"
                          style={{ background: bg, border: `1px solid ${border}`, color }}>
                          {revealed && isCorrect && <CheckCircle size={13} className="inline mr-1.5 mb-0.5" />}
                          {opt}
                        </button>
                      )
                    })}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2.5">
                    {!revealed ? (
                      <button onClick={handleAnswer} disabled={selected === null}
                        className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
                        style={{ background: selected !== null ? levelMeta.color : 'rgba(255,255,255,0.05)', opacity: selected === null ? 0.45 : 1, boxShadow: selected !== null ? `0 4px 18px ${levelMeta.color}28` : 'none' }}>
                        {isEn ? 'Check answer' : 'Verificar resposta'}
                      </button>
                    ) : (
                      <>
                        <div className="flex-1 py-3 rounded-xl text-sm font-bold text-center"
                          style={{ background: selected === q.answer ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)', border: `1px solid ${selected === q.answer ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}`, color: selected === q.answer ? '#34d399' : '#f87171' }}>
                          {selected === q.answer ? (isEn ? 'Correct! +30 XP' : 'Correto! +30 XP') : (isEn ? 'Not quite!' : 'Quase!')}
                        </div>
                        <button onClick={handleNext}
                          className="px-5 py-3 rounded-xl text-sm font-bold text-white transition-all"
                          style={{ background: '#2563eb' }}>
                          {current < questions.length - 1 ? (isEn ? 'Next' : 'Próxima') : (isEn ? 'Finish' : 'Finalizar')}
                        </button>
                      </>
                    )}
                  </div>

                  {!revealed && (
                    <p className="text-[11px] text-slate-600 text-center mt-3">
                      <Lock size={10} className="inline mr-1" />
                      {isEn ? 'Sign in to save your XP and streak.' : 'Entre para salvar seu XP e sequência.'}
                      {' '}<Link href="/login" className="text-blue-400 hover:underline">{isEn ? 'Sign up' : 'Criar conta'}</Link>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

// ─── TIPS / BLOG SECTION ──────────────────────────────────────────────────────

function TipsSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="dicas" style={{ background: 'var(--bg-primary)' }} className="py-20 lg:py-28" ref={ref}>
      <div className="max-w-6xl mx-auto px-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="mb-12">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#60a5fa' }}>Dicas de aprendizado</p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              Como realmente<br />aprender um idioma.
            </h2>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
              Sem mistério. Sem atalhos. Apenas hábitos simples que nativos e poliglotas usam há décadas.
            </p>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIPS.map((tip, i) => (
            <motion.article key={tip.title}
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.07, duration: 0.55 }}
              className="group rounded-2xl p-6 transition-all duration-200 cursor-default"
              style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${tip.color}25`; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${tip.color}15` }}>
                  <tip.icon size={18} style={{ color: tip.color }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: `${tip.color}10`, color: tip.color, border: `1px solid ${tip.color}20` }}>
                  {tip.tag}
                </span>
              </div>
              <h3 className="text-[15px] font-bold text-white mb-2 leading-snug">{tip.title}</h3>
              <p className="text-[13px] text-slate-400 leading-relaxed">{tip.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── MENTOR SECTION ───────────────────────────────────────────────────────────

function MentorSection() {
  const [selected, setSelected] = useState(0)
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const conversations = [
    ['Oi! Sua pronúncia tá melhorando demais. Bora treinar mais um pouco?', 'Você usou "going to" ontem, hoje vamos praticar com situações reais.'],
    ['Sequência de 7 dias. Hoje: simulação de reunião em inglês. Começando.', 'Você errou o past perfect ontem. Vamos resolver isso hoje.'],
    ['Antes de praticar, entenda a raiz do present perfect. Faz sentido?', 'Essa construção vem do latim — entender a origem ajuda a fixar.'],
  ]

  return (
    <section id="mentor" style={{ background: '#07070f' }} className="py-20 lg:py-28" ref={ref}>
      <div className="max-w-6xl mx-auto px-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#60a5fa' }}>Seu mentor</p>
          <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">Personalidade importa.</h2>
          <p className="text-slate-400 max-w-md">Escolha um mentor que fala do seu jeito. O mentor aprende o seu nome de usuário e se adapta ao longo do tempo.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-2.5">
            {MENTOR_PRESETS.map((m, i) => (
              <motion.button key={m.id}
                initial={{ opacity: 0, x: -18 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: i * 0.09, duration: 0.5 }}
                onClick={() => setSelected(i)}
                className="w-full text-left rounded-2xl p-5 transition-all duration-200"
                style={{ background: selected === i ? `${m.color}0c` : '#0d0d1a', border: selected === i ? `1.5px solid ${m.color}38` : '1.5px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0"
                    style={{ background: `${m.color}18`, color: m.color }}>
                    {m.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{m.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${m.color}15`, color: m.color }}>{m.style}</span>
                    </div>
                    <p className="text-[13px] text-slate-400 leading-snug">{m.desc}</p>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 transition-all"
                    style={{ borderColor: selected === i ? m.color : 'rgba(255,255,255,0.15)', background: selected === i ? m.color : 'transparent' }} />
                </div>
              </motion.button>
            ))}
            <motion.div initial={{ opacity: 0, x: -18 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.32, duration: 0.5 }}
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: '#0d0d1a', border: '1.5px dashed rgba(255,255,255,0.08)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Palette size={18} style={{ color: '#475569' }} />
              </div>
              <div>
                <div className="font-semibold text-slate-400 text-sm mb-0.5">Criar meu próprio mentor</div>
                <div className="text-[12px] text-slate-600">Nome, avatar, tom e estilo únicos.</div>
              </div>
              <div className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>Em breve</div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 18 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.15, duration: 0.6 }}>
            <AnimatePresence mode="wait">
              <motion.div key={selected}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
                className="rounded-2xl" style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-4 px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg"
                    style={{ background: `${MENTOR_PRESETS[selected].color}18`, color: MENTOR_PRESETS[selected].color }}>
                    {MENTOR_PRESETS[selected].initials}
                  </div>
                  <div>
                    <div className="font-black text-white">{MENTOR_PRESETS[selected].name}</div>
                    <div className="text-[12px]" style={{ color: MENTOR_PRESETS[selected].color }}>{MENTOR_PRESETS[selected].style}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.08)', color: '#34d399', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> Online
                  </div>
                </div>
                <div className="px-5 py-5 space-y-3">
                  {conversations[selected].map((msg, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0"
                        style={{ background: `${MENTOR_PRESETS[selected].color}20`, color: MENTOR_PRESETS[selected].color }}>
                        {MENTOR_PRESETS[selected].initials[0]}
                      </div>
                      <div className="text-[13px] px-4 py-3 rounded-2xl rounded-tl-sm leading-relaxed"
                        style={{ background: 'rgba(255,255,255,0.04)', color: '#cbd5e1' }}>
                        {msg}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Mic2 size={13} style={{ color: MENTOR_PRESETS[selected].color }} />
                    <span className="text-[12px] text-slate-600">Responda em inglês...</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── AVATAR SHOP ──────────────────────────────────────────────────────────────

function AvatarShop() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [hover, setHover] = useState<string | null>(null)

  return (
    <section style={{ background: 'var(--bg-primary)' }} className="py-20 lg:py-28" ref={ref}>
      <div className="max-w-6xl mx-auto px-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent-yellow)' }}>Loja de avatares</p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              Seu perfil.<br />Seu personagem.
            </h2>
            <p className="text-slate-400 max-w-xs text-sm leading-relaxed">
              Desbloqueie avatares inspirados em games, animes e cultura pop — tudo com XP ganho nas lições.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {AVATARS.map((av, i) => (
            <motion.div key={av.id}
              initial={{ opacity: 0, scale: 0.88 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: i * 0.04, duration: 0.4 }}
              onMouseEnter={() => setHover(av.id)} onMouseLeave={() => setHover(null)}
              className="relative flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-full aspect-square rounded-2xl flex items-center justify-center relative transition-all duration-200"
                style={{
                  background: av.unlocked ? 'rgba(37,99,235,0.12)' : '#0d0d1a',
                  border: hover === av.id ? '1.5px solid rgba(37,99,235,0.4)' : av.unlocked ? '1.5px solid rgba(37,99,235,0.25)' : '1.5px solid rgba(255,255,255,0.06)',
                  filter: av.unlocked ? 'none' : 'grayscale(0.8)',
                  transform: hover === av.id ? 'translateY(-3px)' : 'none',
                }}>
                <av.icon size={24} style={{ color: av.unlocked ? '#60a5fa' : '#64748b' }} />
                {!av.unlocked && (
                  <div className="absolute inset-0 rounded-2xl flex items-end justify-center pb-1.5"
                    style={{ background: 'rgba(0,0,0,0.45)' }}>
                    <span className="text-[9px] font-black text-yellow-400">{av.xp} XP</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 text-center leading-tight">{av.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 rounded-2xl p-5 flex items-center gap-5 flex-wrap"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <ShoppingBag size={19} style={{ color: '#f59e0b' }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white mb-0.5">Desbloqueie com XP — não com dinheiro</div>
            <div className="text-[12px] text-slate-400">Cada lição, desafio e sequência acumula XP. Avatares exclusivos chegam conforme você avança.</div>
          </div>
          <Link href="/login" className="text-[13px] font-bold px-5 py-2.5 rounded-xl text-white flex-shrink-0 transition-all"
            style={{ background: '#f59e0b', color: '#000' }}>
            Começar a acumular
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ─── COURSES PREVIEW SECTION ──────────────────────────────────────────────────

const COURSES_PREVIEW = [
  { id: 1, title: 'Módulo 1', subtitle: 'Iniciantes', level: 'A1', lessons: 8, desc: 'Cumprimentos, apresentações e o essencial', progress: 0, icon: Rocket },
  { id: 2, title: 'Módulo 2', subtitle: 'Básico', level: 'A1-A2', lessons: 12, desc: 'Sentimentos, cores e descrições', progress: 0, icon: BookOpen },
  { id: 3, title: 'Módulo 3', subtitle: 'Básico+', level: 'A2', lessons: 10, desc: 'Rotina diária e horários', progress: 0, icon: Clock },
  { id: 4, title: 'Módulo 4', subtitle: 'Intermediário', level: 'B1', lessons: 15, desc: 'Passado e histórias pessoais', progress: 15, icon: BookMarked },
  { id: 5, title: 'Módulo 5', subtitle: 'Intermediário', level: 'B1-B2', lessons: 14, desc: 'Futuro, planos e desejos', progress: 0, icon: Sparkles },
  { id: 6, title: 'Módulo 6', subtitle: 'Avançado', level: 'B2+', lessons: 16, desc: 'Expressões idiomáticas e gírias', progress: 0, icon: Target },
  { id: 7, title: 'Módulo 7', subtitle: 'Avançado++', level: 'C1', lessons: 12, desc: 'Debater e argumentar', progress: 0, icon: Mic2 },
  { id: 8, title: 'Módulo 8', subtitle: 'Fluente', level: 'C2', lessons: 20, desc: 'Nuances, literatura e cultura', progress: 0, icon: Crown },
]

function CoursesPreview() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section style={{ background: 'var(--bg-primary)' }} className="py-20 lg:py-28" ref={ref}>
      <div className="max-w-6xl mx-auto px-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="mb-12">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent-blue-light)' }}>Estruturado em 8 módulos</p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              Sua jornada pelo inglês.<br />Do zero ao fluente.
            </h2>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
              8 módulos progressivos com 96 lições de verdade. Cada um preparado para levar você para o próximo nível.
            </p>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {COURSES_PREVIEW.map((course, i) => (
            <motion.div key={course.id}
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.05, duration: 0.5 }}
              className="group rounded-2xl p-5 relative overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105"
              style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}>
              
              {/* Progress bar */}
              {course.progress > 0 && (
                <div className="absolute top-0 left-0 h-1" style={{ width: `${course.progress}%`, background: 'linear-gradient(90deg,#2563eb,#60a5fa)' }} />
              )}

              {/* Icon & Level */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <course.icon size={20} className="text-white" />
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: 'rgba(37,99,235,0.1)', color: '#60a5fa' }}>
                  {course.level}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-white mb-1">{course.title}</h3>
              <p className="text-[11px] text-slate-500 mb-2.5">{course.subtitle}</p>

              {/* Description */}
              <p className="text-[12px] text-slate-400 mb-4 leading-snug">{course.desc}</p>

              {/* Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span className="flex items-center gap-1"><BookOpen size={12} /> {course.lessons} lições</span>
                <span className="text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 rounded-2xl p-6 flex items-center gap-5 flex-wrap"
          style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.15)' }}>
            <BookOpen size={19} style={{ color: '#a78bfa' }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white mb-0.5">96 lições esperando por você</div>
            <div className="text-[12px] text-slate-400">Comece agora como Iniciante e acompanhe seu progresso até fluência completa.</div>
          </div>
          <Link href="/login" className="text-[13px] font-bold px-5 py-2.5 rounded-xl text-white flex-shrink-0 transition-all"
            style={{ background: '#8b5cf6' }}>
            Começar agora
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ─── PROGRESS SECTION ─────────────────────────────────────────────────────────

function ProgressSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const xpItems = [
    { label: 'Desafio diário concluído', xp: '+30 XP',  icon: Target,   color: '#10b981' },
    { label: 'Lição completa',           xp: '+50 XP',  icon: BookOpen, color: '#3b82f6' },
    { label: 'Prática de voz',           xp: '+30 XP',  icon: Mic2,     color: '#8b5cf6' },
    { label: 'Sequência de 7 dias',      xp: '+100 XP', icon: Flame,    color: '#f59e0b' },
  ]

  return (
    <section id="progresso" style={{ background: '#07070f' }} className="py-20 lg:py-28" ref={ref}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#60a5fa' }}>Sistema de XP</p>
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-4">
              Cada minuto vira<br />progresso real.
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Metas diárias pequenas constroem a fluência que anos de curso não entregam. O XP é visível, concreto e recompensado com avatares.
            </p>
            <div className="space-y-2.5">
              {xpItems.map((act, i) => (
                <motion.div key={act.label}
                  initial={{ opacity: 0, x: -14 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.1 + i * 0.07, duration: 0.5 }}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${act.color}15` }}>
                    <act.icon size={16} style={{ color: act.color }} />
                  </div>
                  <span className="text-sm text-slate-300 flex-1">{act.label}</span>
                  <span className="text-sm font-black" style={{ color: act.color }}>{act.xp}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.12 }}>
            <div className="rounded-2xl p-6" style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-4 mb-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.12)' }}>
                    <User size={28} style={{ color: '#60a5fa' }} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Crown size={11} className="text-white" />
                  </div>
                </div>
                <div>
                  <div className="font-bold text-white">@ninja_br</div>
                  <div className="text-[12px] text-slate-500 mt-0.5">Nível 12 · Intermediário</div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Flame size={12} className="text-orange-400" />
                    <span className="text-[12px] font-bold text-orange-400">14 dias seguidos</span>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-2xl font-black text-white">2.840</div>
                  <div className="text-[11px] text-slate-500">XP total</div>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex justify-between text-[12px] text-slate-500 mb-2">
                  <span>Nível 12</span><span>2.840 / 3.200 XP</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#2563eb,#60a5fa)' }}
                    initial={{ width: 0 }} animate={inView ? { width: '88%' } : { width: 0 }} transition={{ duration: 1.3, delay: 0.35, ease: [0.22, 1, 0.36, 1] }} />
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600 mb-3">Metas de hoje</div>
                {[
                  { label: 'Desafio do dia',           done: true  },
                  { label: '10 min de prática de voz', done: true  },
                  { label: 'Revisar 20 flashcards',    done: false },
                ].map(g => (
                  <div key={g.label} className="flex items-center gap-3 py-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ background: g.done ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', border: g.done ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.07)' }}>
                      {g.done && <CheckCircle size={11} style={{ color: '#34d399' }} />}
                    </div>
                    <span className="text-[13px]" style={{ color: g.done ? '#64748b' : '#cbd5e1', textDecoration: g.done ? 'line-through' : 'none' }}>{g.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

function Reviews() {
  const [active, setActive] = useState(0)
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % REVIEWS.length), 5500)
    return () => clearInterval(t)
  }, [])

  return (
    <section style={{ background: 'var(--bg-primary)' }} className="py-20 lg:py-28" ref={ref}>
      <div className="max-w-6xl mx-auto px-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent-blue-light)' }}>Beta</p>
          <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">312 no beta. Os resultados falam.</h2>
        </motion.div>
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.32 }}
              className="rounded-2xl p-7 lg:p-9" style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex gap-0.5 mb-4">
                {[...Array(REVIEWS[active].stars)].map((_, i) => <Star key={i} size={13} style={{ color: '#fbbf24', fill: '#fbbf24' }} />)}
              </div>
              <p className="text-base text-slate-200 leading-relaxed mb-6">&ldquo;{REVIEWS[active].text}&rdquo;</p>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <img src={`https://i.pravatar.cc/44?img=${active * 11 + 5}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-white text-sm">{REVIEWS[active].name}</div>
                    <div className="text-[12px] text-slate-500">{REVIEWS[active].city} · {REVIEWS[active].weeks} semanas</div>
                  </div>
                </div>
                <div className="text-[12px] font-bold px-3.5 py-1.5 rounded-full"
                  style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)', color: '#34d399' }}>
                  {REVIEWS[active].level}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center justify-center gap-3 mt-5">
            <button onClick={() => setActive(a => (a - 1 + REVIEWS.length) % REVIEWS.length)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <ChevronLeft size={15} />
            </button>
            <div className="flex gap-1.5">
              {REVIEWS.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: active === i ? 20 : 6, background: active === i ? '#3b82f6' : 'rgba(255,255,255,0.15)' }} />
              ))}
            </div>
            <button onClick={() => setActive(a => (a + 1) % REVIEWS.length)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── LANGUAGES ────────────────────────────────────────────────────────────────

function LanguagesSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true })

  const langs = [
    { Icon: Globe, lang: 'Inglês',   status: 'Disponível', color: '#3b82f6', available: true  },
    { Icon: Lock,  lang: 'Espanhol', status: 'Em breve',   color: '#f59e0b', available: false },
    { Icon: Lock,  lang: 'Mandarim', status: 'Em breve',   color: '#ef4444', available: false },
  ]

  return (
    <section style={{ background: '#07070f' }} className="py-20 lg:py-28" ref={ref}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="rounded-2xl p-8 lg:p-12" style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -18 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#60a5fa' }}>Idiomas</p>
              <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight mb-4">Inglês é só o começo.</h2>
              <p className="text-slate-400 leading-relaxed">
                Qualidade antes de quantidade. Espanhol e Mandarim chegam em breve com o mesmo nível de personalização.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 18 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.12 }}
              className="flex flex-col gap-3">
              {langs.map(l => (
                <div key={l.lang} className="flex items-center gap-4 px-5 py-4 rounded-xl"
                  style={{ background: l.available ? `${l.color}07` : 'rgba(255,255,255,0.02)', border: `1px solid ${l.available ? `${l.color}20` : 'rgba(255,255,255,0.05)'}` }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${l.color}15` }}>
                    <l.Icon size={16} style={{ color: l.available ? l.color : '#475569' }} />
                  </div>
                  <span className="font-semibold text-white flex-1">{l.lang}</span>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full"
                    style={l.available ? { background: `${l.color}15`, color: l.color } : { background: 'rgba(255,255,255,0.04)', color: '#475569' }}>
                    {l.status}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section style={{ background: 'var(--bg-primary)' }} className="py-20 pb-28" ref={ref}>
      <div className="max-w-2xl mx-auto px-5 text-center">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-8"
            style={{ boxShadow: '0 0 48px rgba(37,99,235,0.38)' }}>
            <GraduationCap size={30} className="text-white" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Qual vai ser o seu<br /><span style={{ color: '#60a5fa' }}>apelido aqui?</span>
          </h2>
          <p className="text-slate-400 mb-3 max-w-md mx-auto">
            Crie sua conta com o nome que quiser — apelido, username de jogo, qualquer coisa. Sem cartão, sem compromisso.
          </p>
          <p className="text-[12px] text-slate-600 mb-8">
            O seu mentor vai te chamar pelo nome que você escolher.
          </p>
          <Link href="/login"
            className="cta-button cta-float inline-flex items-center gap-2.5 text-white font-extrabold px-9 py-4 rounded-2xl text-base transition-all"
            style={{ background: '#2563eb', boxShadow: '0 6px 28px rgba(37,99,235,0.32)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(37,99,235,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,99,235,0.32)' }}>
            Criar meu perfil agora <ArrowRight size={16} />
          </Link>
          <p className="text-slate-600 text-[12px] mt-4">312 pessoas já estão dentro.</p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: '#030308', borderTop: '1px solid rgba(255,255,255,0.05)' }} className="py-10">
      <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Languages size={14} className="text-white" />
          </div>
          <span className="font-bold text-white">Fluency<span className="text-blue-400">OS</span></span>
        </div>
        <p className="text-slate-600 text-[13px]">Democratizando idiomas com IA — beta aberto e gratuito.</p>
        <div className="flex gap-5">
          {['Privacidade', 'Termos', 'Contato'].map(l => (
            <a key={l} href="#" className="text-[13px] text-slate-600 hover:text-slate-400 transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <Hero />
      <DailyChallenge />
      <CoursesPreview />
      <TipsSection />
      <MentorSection />
      <AvatarShop />
      <ProgressSection />
      <Reviews />
      <LanguagesSection />
      <FinalCTA />
      <Footer />
    </main>
  )
}
