'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { useXPStore } from '@/store/xp'
import {
  ArrowLeft, ArrowRight, CheckCircle, Volume2,
  BookOpen, Zap, Target, Trophy,
  ChevronRight, Play, RotateCcw, Lightbulb
} from 'lucide-react'

type QuizItem = { q: string; options: string[]; answer: number; explain?: string; explainWrong?: string }
type Lesson = {
  id: number
  title: string
  subtitle: string
  xp: number
  minutes: number
  color: string
  intro: string
  sections: any[]
  quiz: QuizItem[]
}
// â”€â”€â”€ LESSON DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'FamÃ­lia & Casa',
    subtitle: 'Family',
    xp: 60,
    minutes: 10,
    color: '#8b5cf6',
    intro: 'VocabulÃ¡rio do cotidiano: famÃ­lia, casa e lugares dentro do lar.',
    sections: [
      {
        type: 'vocab',
        title: 'FamÃ­lia essencial',
        items: [
          { en:'mother',  phonetic:'/ËˆmÊŒÃ°É™r/', pt:'mÃ£e', example:'My mother is kind.', img:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=280&q=80', imgAlt:'mother' },
          { en:'father',  phonetic:'/ËˆfÉ‘ËÃ°É™r/', pt:'pai', example:'My father is tall.', img:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=280&q=80', imgAlt:'father' },
          { en:'sister',  phonetic:'/ËˆsÉªstÉ™r/', pt:'irmÃ£', example:'My sister is funny.', img:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=280&q=80', imgAlt:'sister' },
          { en:'brother', phonetic:'/ËˆbrÊŒÃ°É™r/', pt:'irmÃ£o', example:'My brother is a student.', img:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=280&q=80', imgAlt:'brother' },
          { en:'family',  phonetic:'/ËˆfÃ¦mÉ™li/', pt:'famÃ­lia', example:'I love my family.', img:'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=280&q=80', imgAlt:'family' },
          { en:'house',   phonetic:'/haÊŠs/', pt:'casa', example:'My house is small.', img:'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=280&q=80', imgAlt:'house' },
        ],
      },
      {
        type: 'scenes',
        title: 'Cenas da casa',
        items: [
          { title:'Sala', text:'The living room is big.', img:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80' },
          { title:'Cozinha', text:'The kitchen is clean.', img:'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80' },
          { title:'Quarto', text:'My room is cozy.', img:'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80' },
          { title:'Jardim', text:'We have a garden.', img:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80' },
        ],
      },
      {
        type: 'fill',
        title: 'Complete a frase',
        items: [
          { sentence:'This is my ___.', options:['mother','brother','house','family'], answer:0, translation:'Esta Ã© minha mÃ£e.' },
          { sentence:'My ___ is a student.', options:['sister','kitchen','garden','house'], answer:0, translation:'Minha irmÃ£ Ã© estudante.' },
          { sentence:'We have a big ___.', options:['family','father','room','brother'], answer:0, translation:'NÃ³s temos uma famÃ­lia grande.' },
        ],
      },
      {
        type: 'translate',
        title: 'Responda em inglÃªs (PT â†’ EN)',
        items: [
          { pt:'mÃ£e', options:['mother','father','sister','brother'], answer:0 },
          { pt:'casa', options:['house','home','horse','hotel'], answer:0 },
          { pt:'famÃ­lia', options:['family','familiar','father','farm'], answer:0 },
        ],
      },
    ],
    quiz: [
      { q:'"Brother" significa:', options:['irmÃ£o','irmÃ£','pai','mÃ£e'], answer:0, explain:'"Brother" Ã© irmÃ£o.' },
      { q:'Complete: My ___ is kind.', options:['mother','house','room','garden'], answer:0, explain:'Mother = mÃ£e.' },
      { q:'"House" significa:', options:['casa','famÃ­lia','quarto','cozinha'], answer:0, explain:'"House" Ã© casa (o lugar fÃ­sico).' },
    ],
  },
  {
    id: 2,
    title: 'Comida & Mercado',
    subtitle: 'Food',
    xp: 60,
    minutes: 10,
    color: '#f59e0b',
    intro: 'Comidas, bebidas e frases Ãºteis para pedir e comprar.',
    sections: [
      {
        type: 'vocab',
        title: 'Itens do dia a dia',
        items: [
          { en:'bread',  phonetic:'/brÉ›d/', pt:'pÃ£o', example:'I need bread.', img:'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=280&q=80', imgAlt:'bread' },
          { en:'milk',   phonetic:'/mÉªlk/', pt:'leite', example:'I drink milk.', img:'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=280&q=80', imgAlt:'milk' },
          { en:'water',  phonetic:'/ËˆwÉ”ËtÉ™r/', pt:'Ã¡gua', example:'A bottle of water.', img:'https://images.unsplash.com/photo-1502741126161-b048400d8377?w=280&q=80', imgAlt:'water' },
          { en:'fruit',  phonetic:'/fruËt/', pt:'fruta', example:'I like fruit.', img:'https://images.unsplash.com/photo-1502741126161-b048400d8377?w=280&q=80', imgAlt:'fruit' },
          { en:'coffee', phonetic:'/ËˆkÉ”Ëfi/', pt:'cafÃ©', example:'Coffee, please.', img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=280&q=80', imgAlt:'coffee' },
          { en:'rice',   phonetic:'/raÉªs/', pt:'arroz', example:'Rice and beans.', img:'https://images.unsplash.com/photo-1512058564366-c9e3e0464d09?w=280&q=80', imgAlt:'rice' },
        ],
      },
      {
        type: 'scenes',
        title: 'No mercado',
        items: [
          { title:'Frutas', text:'I need some apples.', img:'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=800&q=80' },
          { title:'PÃ£es', text:'Two loaves of bread.', img:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80' },
          { title:'Bebidas', text:'A bottle of water.', img:'https://images.unsplash.com/photo-1502741126161-b048400d8377?w=800&q=80' },
          { title:'CafÃ©', text:'Coffee to go.', img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80' },
        ],
      },
      {
        type: 'fill',
        title: 'Complete a frase',
        items: [
          { sentence:'I need some ___.', options:['water','brother','house','work'], answer:0, translation:'Eu preciso de Ã¡gua.' },
          { sentence:'Can I have ___ coffee?', options:['a','an','the','some'], answer:0, translation:'Posso tomar um cafÃ©?' },
          { sentence:'She likes ___.', options:['fruit','father','room','home'], answer:0, translation:'Ela gosta de fruta.' },
        ],
      },
      {
        type: 'typing',
        title: 'Teste de digitaÃ§Ã£o',
        items: [
          { target:'I need some water, please.', translation:'Eu preciso de Ã¡gua, por favor.' },
          { target:'Can I have a coffee?', translation:'Posso tomar um cafÃ©?' },
        ],
      },
    ],
    quiz: [
      { q:'"Bread" significa:', options:['pÃ£o','leite','arroz','fruta'], answer:0, explain:'"Bread" Ã© pÃ£o.' },
      { q:'Complete: I need some ___.', options:['water','house','work','family'], answer:0, explain:'"Some water" = um pouco de Ã¡gua.' },
      { q:'"Coffee" significa:', options:['cafÃ©','chÃ¡','suco','leite'], answer:0, explain:'"Coffee" Ã© cafÃ©.' },
    ],
  },
  {
    id: 3,
    title: 'Trabalho & Rotina',
    subtitle: 'Work',
    xp: 60,
    minutes: 10,
    color: '#ef4444',
    intro: 'Palavras e frases bÃ¡sicas para falar de trabalho e rotina.',
    sections: [
      {
        type: 'vocab',
        title: 'No escritÃ³rio',
        items: [
          { en:'job',     phonetic:'/dÊ’É‘Ëb/', pt:'trabalho (emprego)', example:'I like my job.', img:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=280&q=80', imgAlt:'job' },
          { en:'office',  phonetic:'/ËˆÉ”ËfÉªs/', pt:'escritÃ³rio', example:'The office is big.', img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=280&q=80', imgAlt:'office' },
          { en:'meeting', phonetic:'/ËˆmiËtÉªÅ‹/', pt:'reuniÃ£o', example:'We have a meeting.', img:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=280&q=80', imgAlt:'meeting' },
          { en:'schedule', phonetic:'/ËˆskedÊ’uËl/', pt:'agenda', example:'My schedule is full.', img:'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=280&q=80', imgAlt:'schedule' },
        ],
      },
      {
        type: 'scenes',
        title: 'Cenas do trabalho',
        items: [
          { title:'ReuniÃ£o', text:'We have a meeting at 10.', img:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80' },
          { title:'EscritÃ³rio', text:'The office is quiet.', img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' },
          { title:'Agenda', text:'My schedule is busy.', img:'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80' },
          { title:'Trabalho', text:'I like my job.', img:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80' },
        ],
      },
      {
        type: 'fill',
        title: 'Complete a frase',
        items: [
          { sentence:'I have a ___ at 10.', options:['meeting','family','kitchen','water'], answer:0, translation:'Tenho uma reuniÃ£o Ã s 10.' },
          { sentence:'My ___ is busy.', options:['schedule','mother','fruit','house'], answer:0, translation:'Minha agenda estÃ¡ cheia.' },
          { sentence:'The ___ is big.', options:['office','garden','coffee','bread'], answer:0, translation:'O escritÃ³rio Ã© grande.' },
        ],
      },
      {
        type: 'dialogue',
        title: 'DiÃ¡logo rÃ¡pido',
        lines: [
          { speaker:'A', text:'Do you like your job?', translation:'VocÃª gosta do seu trabalho?' },
          { speaker:'B', text:'Yes, but my schedule is busy.', translation:'Sim, mas minha agenda Ã© cheia.' },
          { speaker:'A', text:'We have a meeting at 10.', translation:'Temos uma reuniÃ£o Ã s 10.' },
        ],
      },
    ],
    quiz: [
      { q:'"Office" significa:', options:['escritÃ³rio','trabalho','agenda','reuniÃ£o'], answer:0, explain:'"Office" Ã© escritÃ³rio.' },
      { q:'Complete: I have a ___.', options:['meeting','bread','family','water'], answer:0, explain:'"Meeting" Ã© reuniÃ£o.' },
      { q:'"Job" significa:', options:['trabalho','casa','famÃ­lia','cafÃ©'], answer:0, explain:'"Job" Ã© trabalho (emprego).' },
    ],
  },
]

function normalizeAnswer(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, ' ')
}

// â”€â”€â”€ LESSON CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function LessonCard({ lesson, index, isCompleted, onClick }: {
  lesson: typeof LESSONS[0]; index: number; isCompleted: boolean; onClick: () => void
}) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.div ref={ref}
      initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}}
      transition={{ delay:index * 0.1, duration:0.5 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl p-6 transition-all duration-200"
      style={{ background:'#0d0d1a', border:`1px solid ${isCompleted ? lesson.color+'30' : 'rgba(255,255,255,0.06)'}` }}
      onMouseEnter={e => { e.currentTarget.style.borderColor=`${lesson.color}45`; e.currentTarget.style.transform='translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor=isCompleted?`${lesson.color}30`:'rgba(255,255,255,0.06)'; e.currentTarget.style.transform='translateY(0)' }}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background:`${lesson.color}15` }}>
          {isCompleted
            ? <CheckCircle size={22} style={{ color:lesson.color }}/>
            : <span className="text-xl font-black" style={{ color:lesson.color }}>{index + 1}</span>
          }
        </div>
        <div className="flex-1">
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color:lesson.color }}>{lesson.subtitle}</span>
          <h3 className="font-black text-white text-lg leading-tight mt-0.5">{lesson.title}</h3>
          <p className="text-[13px] text-slate-500 mt-1 leading-snug line-clamp-2">{lesson.intro}</p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ background:`${lesson.color}15`, color:lesson.color }}>
            <Zap size={9}/> +{lesson.xp} XP
          </div>
          <div className="text-[11px] text-slate-600">{lesson.minutes} min</div>
          <ChevronRight size={14} className="text-slate-600"/>
        </div>
      </div>
    </motion.div>
  )
}

// â”€â”€â”€ LESSON VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function LessonView({ lesson, onBack, onComplete }: {
  lesson: typeof LESSONS[0]; onBack: () => void; onComplete: () => void
}) {
  const { completeLesson, addXP } = useXPStore()
  const [quizActive, setQuizActive] = useState(false)
  const [qIdx,       setQIdx]       = useState(0)
  const [selected,   setSelected]   = useState<number | null>(null)
  const [revealed,   setRevealed]   = useState(false)
  const [correct,    setCorrect]    = useState(0)
  const [quizDone,   setQuizDone]   = useState(false)
  const [choices,    setChoices]    = useState<Record<string, { selected: number | null; revealed: boolean }>>({})
  const [typingInput, setTypingInput] = useState<Record<string, string>>({})
  const [typingStatus, setTypingStatus] = useState<Record<string, { revealed: boolean; correct: boolean }>>({})
  const [feedback, setFeedback] = useState<{ title: string; message: string; tone: 'success' | 'error' } | null>(null)

  const q = lesson.quiz[qIdx]

  function handleAnswer() {
    if (selected === null) return
    setRevealed(true)
    if (selected === lesson.quiz[qIdx].answer) {
      setCorrect(c => c + 1)
      addXP('quiz_correct')
    }
    const correctOption = lesson.quiz[qIdx].options[lesson.quiz[qIdx].answer]
    const correctExplain = lesson.quiz[qIdx].explain || `Resposta correta: ${correctOption}.`
    const wrongExplain = lesson.quiz[qIdx].explainWrong || `A correta Ã© "${correctOption}".`
    setFeedback({
      title: selected === lesson.quiz[qIdx].answer ? 'Correto!' : 'Ops! Ainda nÃ£o',
      message: selected === lesson.quiz[qIdx].answer ? correctExplain : wrongExplain,
      tone: selected === lesson.quiz[qIdx].answer ? 'success' : 'error',
    })
  }

  function handleNext() {
    if (qIdx < lesson.quiz.length - 1) {
      setQIdx(q => q + 1); setSelected(null); setRevealed(false)
    } else {
      setQuizDone(true)
      completeLesson(`modulo-3-licao-${lesson.id}`)
    }
  }

  return (
    <div>
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
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
          style={{ border:'1px solid rgba(255,255,255,0.08)' }}>
          <ArrowLeft size={15}/>
        </button>
        <div className="flex-1">
          <div className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color:lesson.color }}>
            {lesson.subtitle} Â· MÃ³dulo 3
          </div>
          <h2 className="text-2xl font-black text-white">{lesson.title}</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background:`${lesson.color}15`, border:`1px solid ${lesson.color}25` }}>
          <Zap size={12} style={{ color:lesson.color }}/>
          <span className="text-[12px] font-black" style={{ color:lesson.color }}>+{lesson.xp} XP</span>
        </div>
      </div>

      {!quizActive ? (
        <>
          {/* Intro */}
          <div className="px-5 py-4 rounded-2xl mb-8"
            style={{ background:`${lesson.color}08`, border:`1px solid ${lesson.color}20` }}>
            <p className="text-slate-300 leading-relaxed">{lesson.intro}</p>
          </div>

          {/* Sections */}
          {lesson.sections.map((section, si) => (
            <div key={si} className="mb-10">
              <h3 className="text-lg font-black text-white mb-5 flex items-center gap-2">
                <div className="w-1 h-5 rounded-full" style={{ background:lesson.color }}/>
                {section.title}
              </h3>

              {section.type === 'vocab' && (
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                    {section.items?.map((item: any, i: number) => (
                      <motion.div key={i}
                        initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i * 0.07 }}
                        className="rounded-2xl overflow-hidden"
                        style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.06)' }}>
                        {item.img && (
                          <div className="h-28 overflow-hidden">
                            <img src={item.img} alt={item.imgAlt} className="w-full h-full object-cover opacity-70"/>
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="text-xl font-black text-white">{item.en}</div>
                            <button className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 hover:scale-110 transition-all"
                              style={{ background:`${lesson.color}18` }}>
                              <Volume2 size={12} style={{ color:lesson.color }}/>
                            </button>
                          </div>
                          <div className="text-[12px] text-slate-500 font-mono mb-1">{item.phonetic}</div>
                          <div className="text-[12px] font-semibold mb-2" style={{ color:lesson.color }}>{item.pt}</div>
                          <div className="text-[12px] text-slate-500 italic leading-snug">{item.example}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {(section as any).tip && (
                    <div className="flex items-start gap-3 px-5 py-4 rounded-2xl"
                      style={{ background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)' }}>
                      <Lightbulb size={16} style={{ color:'#f59e0b', flexShrink:0, marginTop:2 }}/>
                      <p className="text-[13px] text-slate-300 leading-relaxed">{(section as any).tip}</p>
                    </div>
                  )}
                </>
              )}

              {section.type === 'sentences' && (
                <div className="space-y-3">
                  {section.items?.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 px-5 py-4 rounded-2xl"
                      style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                        style={{ background:`${lesson.color}18`, color:lesson.color }}>
                        {item.letter}
                      </div>
                      <div>
                        <div className="text-[12px] text-red-400 mb-0.5 line-through">{item.wrong}</div>
                        <div className="text-[13px] font-bold text-white mb-1">{item.right}</div>
                        <div className="text-[12px] text-slate-500 italic">{item.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.type === 'dialogue' && (
                <div className="rounded-2xl overflow-hidden"
                  style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div className="px-5 py-3 flex items-center gap-2"
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <Play size={13} style={{ color:lesson.color }}/>
                    <span className="text-[12px] font-bold text-white">DiÃ¡logo completo</span>
                  </div>
                  <div className="px-5 py-4 space-y-4">
                    {(section as any).lines?.map((line: any, i: number) => (
                      <div key={i} className={`flex gap-3 ${line.speaker === 'B' ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[11px] flex-shrink-0"
                          style={{ background: line.speaker==='A' ? `${lesson.color}20` : 'rgba(139,92,246,0.15)', color: line.speaker==='A' ? lesson.color : '#a78bfa' }}>
                          {line.speaker}
                        </div>
                        <div className={`max-w-[75%] flex flex-col ${line.speaker === 'B' ? 'items-end' : 'items-start'}`}>
                          <div className="text-[13px] font-semibold text-white px-4 py-2.5 rounded-2xl mb-1"
                            style={{ background: line.speaker==='A' ? `${lesson.color}12` : 'rgba(139,92,246,0.1)' }}>
                            {line.text}
                          </div>
                          <div className="text-[11px] text-slate-600 px-1">{line.translation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {section.type === 'numbers' && (
                <div className="space-y-5">
                  {(section as any).groups?.map((g: any, i: number) => (
                    <div key={i}>
                      <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600 mb-3">{g.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {g.items.map((num: string, j: number) => (
                          <span key={j} className="text-[13px] font-semibold px-3 py-1.5 rounded-lg"
                            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'#e2e8f0' }}>
                            <span className="text-slate-600 font-normal mr-1">{j}</span>{num}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {(section as any).tip && (
                    <div className="flex items-start gap-3 px-5 py-4 rounded-2xl"
                      style={{ background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)' }}>
                      <Lightbulb size={16} style={{ color:'#f59e0b', flexShrink:0, marginTop:2 }}/>
                      <p className="text-[13px] text-slate-300 leading-relaxed">{(section as any).tip}</p>
                    </div>
                  )}
                </div>
              )}

              {section.type === 'scenes' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {section.items?.map((item: any, i: number) => (
                    <div key={i} className="relative rounded-2xl overflow-hidden"
                      style={{ border:'1px solid rgba(255,255,255,0.06)', background:'#0d0d1a' }}>
                      <img src={item.img} alt={item.title} className="w-full h-40 object-cover opacity-80"/>
                      <div className="absolute inset-0" style={{ background:'linear-gradient(180deg, rgba(5,5,14,0) 20%, rgba(5,5,14,0.85) 100%)' }} />
                      <div className="absolute bottom-0 p-4">
                        <div className="text-[12px] font-bold text-white mb-0.5">{item.title}</div>
                        <div className="text-[12px] text-slate-300">{item.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.type === 'translate' && (
                <div className="space-y-4">
                  {section.items?.map((item: any, i: number) => {
                    const key = `translate-${si}-${i}`
                    const state = choices[key] || { selected: null, revealed: false }
                    const isCorrect = state.selected === item.answer
                    return (
                      <div key={i} className="rounded-2xl p-5"
                        style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.06)' }}>
                        <div className="text-[12px] text-slate-500 mb-1">Responda em inglÃªs</div>
                        <div className="text-lg font-black text-white mb-3">{item.pt}</div>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {item.options.map((opt: string, oi: number) => {
                            const isSelected = oi === state.selected
                            let bg='rgba(255,255,255,0.04)', bdr='rgba(255,255,255,0.07)', clr='#94a3b8'
                            if (state.revealed) {
                              if (oi === item.answer) { bg='rgba(16,185,129,0.1)'; bdr='rgba(16,185,129,0.35)'; clr='#34d399' }
                              else if (isSelected) { bg='rgba(239,68,68,0.08)'; bdr='rgba(239,68,68,0.3)'; clr='#f87171' }
                            } else if (isSelected) { bg=`${lesson.color}10`; bdr=`${lesson.color}40`; clr='#f1f5f9' }
                            return (
                              <button key={oi} disabled={state.revealed} onClick={() => setChoices(s => ({ ...s, [key]: { selected: oi, revealed: false } }))}
                                className="text-left px-4 py-3 rounded-xl text-[13px] font-medium transition-all"
                                style={{ background:bg, border:`1px solid ${bdr}`, color:clr }}>
                                {state.revealed && oi === item.answer && <CheckCircle size={13} className="inline mr-2 mb-0.5"/>}
                                {opt}
                              </button>
                            )
                          })}
                        </div>
                        {item.note && <div className="text-[11px] text-slate-600 mt-2">{item.note}</div>}
                        <div className="flex gap-2 mt-3">
                          <button disabled={state.selected === null || state.revealed}
                            onClick={() => {
                              if (state.selected === null || state.revealed) return
                              setChoices(s => ({ ...s, [key]: { selected: state.selected, revealed: true } }))
                              if (isCorrect) addXP('quiz_correct')
                              const correctOption = item.options[item.answer]
                              const correctExplain = item.explain || `"${item.pt}" em inglÃªs Ã© "${correctOption}".`
                              const wrongExplain = item.explainWrong || `A correta Ã© "${correctOption}".`
                              setFeedback({
                                title: isCorrect ? 'Correto!' : 'Ops! Ainda nÃ£o',
                                message: isCorrect ? correctExplain : wrongExplain,
                                tone: isCorrect ? 'success' : 'error',
                              })
                            }}
                            className="px-4 py-2 rounded-lg text-[12px] font-bold text-white"
                            style={{ background: state.selected !== null ? lesson.color : 'rgba(255,255,255,0.06)', opacity: state.selected === null ? 0.4 : 1 }}>
                            Verificar
                          </button>
                          {state.revealed && (
                            <div className="px-3 py-2 rounded-lg text-[12px] font-semibold"
                              style={{
                                background: isCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                                color:      isCorrect ? '#34d399' : '#f87171',
                                border:     `1px solid ${isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                              }}>
                              {isCorrect ? 'Correto!' : 'Quase!'}
                            </div>
                          )}
                        </div>
                        {state.revealed && !isCorrect && (
                          <div className="text-[11px] text-slate-500 mt-2">Resposta: {item.options[item.answer]}</div>
                        )}
                      </div>
                    )
                  })}
                  {(section as any).tip && (
                    <div className="flex items-start gap-3 px-5 py-4 rounded-2xl"
                      style={{ background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)' }}>
                      <Lightbulb size={16} style={{ color:'#f59e0b', flexShrink:0, marginTop:2 }}/>
                      <p className="text-[13px] text-slate-300 leading-relaxed">{(section as any).tip}</p>
                    </div>
                  )}
                </div>
              )}

              {section.type === 'fill' && (
                <div className="space-y-4">
                  {section.items?.map((item: any, i: number) => {
                    const key = `fill-${si}-${i}`
                    const state = choices[key] || { selected: null, revealed: false }
                    const isCorrect = state.selected === item.answer
                    return (
                      <div key={i} className="rounded-2xl p-5"
                        style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.06)' }}>
                        <div className="text-[13px] font-semibold text-white mb-2">{item.sentence}</div>
                        {item.translation && <div className="text-[11px] text-slate-600 mb-3">{item.translation}</div>}
                        <div className="grid sm:grid-cols-2 gap-2">
                          {item.options.map((opt: string, oi: number) => {
                            const isSelected = oi === state.selected
                            let bg='rgba(255,255,255,0.04)', bdr='rgba(255,255,255,0.07)', clr='#94a3b8'
                            if (state.revealed) {
                              if (oi === item.answer) { bg='rgba(16,185,129,0.1)'; bdr='rgba(16,185,129,0.35)'; clr='#34d399' }
                              else if (isSelected) { bg='rgba(239,68,68,0.08)'; bdr='rgba(239,68,68,0.3)'; clr='#f87171' }
                            } else if (isSelected) { bg=`${lesson.color}10`; bdr=`${lesson.color}40`; clr='#f1f5f9' }
                            return (
                              <button key={oi} disabled={state.revealed} onClick={() => setChoices(s => ({ ...s, [key]: { selected: oi, revealed: false } }))}
                                className="text-left px-4 py-3 rounded-xl text-[13px] font-medium transition-all"
                                style={{ background:bg, border:`1px solid ${bdr}`, color:clr }}>
                                {state.revealed && oi === item.answer && <CheckCircle size={13} className="inline mr-2 mb-0.5"/>}
                                {opt}
                              </button>
                            )
                          })}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button disabled={state.selected === null || state.revealed}
                            onClick={() => {
                              if (state.selected === null || state.revealed) return
                              setChoices(s => ({ ...s, [key]: { selected: state.selected, revealed: true } }))
                              if (isCorrect) addXP('quiz_correct')
                              const correctOption = item.options[item.answer]
                              const correctExplain = item.explain || `A lacuna correta Ã© "${correctOption}".`
                              const wrongExplain = item.explainWrong || `A correta Ã© "${correctOption}".`
                              setFeedback({
                                title: isCorrect ? 'Correto!' : 'Ops! Ainda nÃ£o',
                                message: isCorrect ? correctExplain : wrongExplain,
                                tone: isCorrect ? 'success' : 'error',
                              })
                            }}
                            className="px-4 py-2 rounded-lg text-[12px] font-bold text-white"
                            style={{ background: state.selected !== null ? lesson.color : 'rgba(255,255,255,0.06)', opacity: state.selected === null ? 0.4 : 1 }}>
                            Verificar
                          </button>
                          {state.revealed && (
                            <div className="px-3 py-2 rounded-lg text-[12px] font-semibold"
                              style={{
                                background: isCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                                color:      isCorrect ? '#34d399' : '#f87171',
                                border:     `1px solid ${isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                              }}>
                              {isCorrect ? 'Correto!' : 'Quase!'}
                            </div>
                          )}
                        </div>
                        {state.revealed && !isCorrect && (
                          <div className="text-[11px] text-slate-500 mt-2">Resposta: {item.options[item.answer]}</div>
                        )}
                      </div>
                    )
                  })}
                  {(section as any).tip && (
                    <div className="flex items-start gap-3 px-5 py-4 rounded-2xl"
                      style={{ background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)' }}>
                      <Lightbulb size={16} style={{ color:'#f59e0b', flexShrink:0, marginTop:2 }}/>
                      <p className="text-[13px] text-slate-300 leading-relaxed">{(section as any).tip}</p>
                    </div>
                  )}
                </div>
              )}

              {section.type === 'typing' && (
                <div className="space-y-4">
                  {section.items?.map((item: any, i: number) => {
                    const key = `typing-${si}-${i}`
                    const value = typingInput[key] ?? ''
                    const status = typingStatus[key] || { revealed: false, correct: false }
                    const isCorrect = normalizeAnswer(value) === normalizeAnswer(item.target)
                    return (
                      <div key={i} className="rounded-2xl p-5"
                        style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.06)' }}>
                        <div className="text-[12px] text-slate-500 mb-1">Digite a frase</div>
                        <div className="text-[15px] font-semibold text-white mb-2">{item.target}</div>
                        {item.translation && <div className="text-[11px] text-slate-600 mb-3">{item.translation}</div>}
                        <input
                          value={value}
                          onChange={e => {
                            const next = e.target.value
                            setTypingInput(s => ({ ...s, [key]: next }))
                            if (status.revealed) setTypingStatus(s => ({ ...s, [key]: { revealed: false, correct: false } }))
                          }}
                          placeholder="Digite aqui..."
                          className="w-full px-4 py-3 rounded-xl text-[13px] text-white bg-transparent"
                          style={{ border:'1px solid rgba(255,255,255,0.08)', outline:'none' }}
                        />
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              if (status.revealed) return
                              setTypingStatus(s => ({ ...s, [key]: { revealed: true, correct: isCorrect } }))
                              if (isCorrect) addXP('quiz_correct')
                              const correctExplain = item.explain || `A frase correta Ã©: "${item.target}".`
                              const wrongExplain = item.explainWrong || `A frase correta Ã©: "${item.target}".`
                              setFeedback({
                                title: isCorrect ? 'Perfeito!' : 'Quase lÃ¡',
                                message: isCorrect ? correctExplain : wrongExplain,
                                tone: isCorrect ? 'success' : 'error',
                              })
                            }}
                            disabled={value.trim().length === 0}
                            className="px-4 py-2 rounded-lg text-[12px] font-bold text-white"
                            style={{ background: value.trim().length > 0 ? lesson.color : 'rgba(255,255,255,0.06)', opacity: value.trim().length === 0 ? 0.4 : 1 }}>
                            Verificar
                          </button>
                          <button
                            onClick={() => {
                              setTypingInput(s => ({ ...s, [key]: '' }))
                              setTypingStatus(s => ({ ...s, [key]: { revealed: false, correct: false } }))
                            }}
                            className="px-4 py-2 rounded-lg text-[12px] font-semibold text-slate-400 hover:text-white transition-all"
                            style={{ border:'1px solid rgba(255,255,255,0.08)' }}>
                            Limpar
                          </button>
                          {status.revealed && (
                            <div className="px-3 py-2 rounded-lg text-[12px] font-semibold"
                              style={{
                                background: status.correct ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                                color:      status.correct ? '#34d399' : '#f87171',
                                border:     `1px solid ${status.correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                              }}>
                              {status.correct ? 'Perfeito!' : 'Quase!'}
                            </div>
                          )}
                        </div>
                        {status.revealed && !status.correct && (
                          <div className="text-[11px] text-slate-500 mt-2">Resposta: {item.target}</div>
                        )}
                      </div>
                    )
                  })}
                  {(section as any).tip && (
                    <div className="flex items-start gap-3 px-5 py-4 rounded-2xl"
                      style={{ background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)' }}>
                      <Lightbulb size={16} style={{ color:'#f59e0b', flexShrink:0, marginTop:2 }}/>
                      <p className="text-[13px] text-slate-300 leading-relaxed">{(section as any).tip}</p>
                    </div>
                  )}
                </div>
              )}

              {section.type === 'explain' && (
                <div className="rounded-2xl p-5"
                  style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[14px] text-slate-300 leading-relaxed">{(section as any).text}</p>
                  {(section as any).examples?.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {(section as any).examples.map((ex: any, i: number) => (
                        <div key={i} className="text-[13px] text-slate-300">
                          <span className="font-semibold text-white">{ex.en}</span>
                          <span className="text-slate-500"> â€” {ex.pt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {(section as any).tip && (
                    <div className="flex items-start gap-3 px-5 py-4 rounded-2xl mt-4"
                      style={{ background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)' }}>
                      <Lightbulb size={16} style={{ color:'#f59e0b', flexShrink:0, marginTop:2 }}/>
                      <p className="text-[13px] text-slate-300 leading-relaxed">{(section as any).tip}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Quiz CTA */}
          <div className="mt-8 p-6 rounded-2xl text-center"
            style={{ background:`${lesson.color}0a`, border:`1.5px solid ${lesson.color}25` }}>
            <Trophy size={28} className="mx-auto mb-3" style={{ color:lesson.color }}/>
            <h4 className="text-lg font-black text-white mb-2">Pronto para o quiz?</h4>
            <p className="text-sm text-slate-400 mb-5">{lesson.quiz.length} perguntas â€” ganhe {lesson.xp} XP ao concluir</p>
            <button onClick={() => setQuizActive(true)}
              className="cta-button cta-float px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background:lesson.color, boxShadow:`0 4px 20px ${lesson.color}30` }}>
              Iniciar quiz <ArrowRight size={14} className="inline ml-1"/>
            </button>
          </div>
        </>
      ) : (
        /* â”€â”€ QUIZ â”€â”€ */
        <div className="max-w-lg mx-auto">
          {!quizDone ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width:`${(qIdx / lesson.quiz.length) * 100}%`, background:lesson.color }}/>
                </div>
                <span className="text-[11px] text-slate-500">{qIdx + 1}/{lesson.quiz.length}</span>
              </div>

              <div className="rounded-2xl p-6 mb-4"
                style={{ background:'#0d0d1a', border:`1px solid ${revealed ? (selected === q.answer ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)') : 'rgba(255,255,255,0.07)'}` }}>
                <p className="text-base font-bold text-white mb-5">{q.q}</p>
                <div className="space-y-2.5">
                  {q.options.map((opt, i) => {
                    const isCorrect  = i === q.answer
                    const isSelected = i === selected
                    let bg='rgba(255,255,255,0.04)', bdr='rgba(255,255,255,0.07)', clr='#94a3b8'
                    if (revealed) {
                      if (isCorrect)       { bg='rgba(16,185,129,0.1)';  bdr='rgba(16,185,129,0.35)'; clr='#34d399' }
                      else if (isSelected) { bg='rgba(239,68,68,0.08)';  bdr='rgba(239,68,68,0.3)';   clr='#f87171' }
                    } else if (isSelected) { bg=`${lesson.color}10`; bdr=`${lesson.color}40`; clr='#f1f5f9' }
                    return (
                      <button key={i} disabled={revealed} onClick={() => setSelected(i)}
                        className="w-full text-left px-4 py-3 rounded-xl text-[13px] font-medium transition-all"
                        style={{ background:bg, border:`1px solid ${bdr}`, color:clr }}>
                        {revealed && isCorrect && <CheckCircle size={13} className="inline mr-2 mb-0.5"/>}
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-2.5">
                {!revealed ? (
                  <button onClick={handleAnswer} disabled={selected === null}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                    style={{ background: selected !== null ? lesson.color : 'rgba(255,255,255,0.06)', opacity: selected === null ? 0.4 : 1 }}>
                    Verificar
                  </button>
                ) : (
                  <>
                    <div className="flex-1 py-3 rounded-xl text-sm font-bold text-center"
                      style={{
                        background: selected === q.answer ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                        color:      selected === q.answer ? '#34d399' : '#f87171',
                        border:     `1px solid ${selected === q.answer ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                      }}>
                      {selected === q.answer ? 'Correto! +' + Math.round(lesson.xp / lesson.quiz.length) + ' XP' : 'Quase! Continue...'}
                    </div>
                    <button onClick={handleNext} className="cta-button px-5 py-3 rounded-xl text-sm font-bold text-white"
                      style={{ background:lesson.color }}>
                      {qIdx < lesson.quiz.length - 1 ? 'PrÃ³xima' : 'Finalizar'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="text-center py-8">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: correct === lesson.quiz.length ? 'rgba(16,185,129,0.12)' : `${lesson.color}12` }}>
                <Trophy size={36} style={{ color: correct === lesson.quiz.length ? '#34d399' : lesson.color }}/>
              </div>
              <div className="text-5xl font-black text-white mb-1">
                {correct}<span className="text-slate-600">/{lesson.quiz.length}</span>
              </div>
              <div className="text-slate-400 mb-2">
                {correct === lesson.quiz.length ? 'Perfeito! VocÃª domina esta liÃ§Ã£o.' : correct >= 2 ? 'Muito bem! Continue avanÃ§ando.' : 'Continue praticando â€” vocÃª vai chegar lÃ¡!'}
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background:`${lesson.color}15`, color:lesson.color }}>
                <Zap size={13}/> +{lesson.xp} XP ganhos!
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setQIdx(0); setSelected(null); setRevealed(false); setCorrect(0); setQuizDone(false); setQuizActive(false) }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-all"
                  style={{ border:'1px solid rgba(255,255,255,0.08)' }}>
                  <RotateCcw size={13}/> Rever liÃ§Ã£o
                </button>
                <button onClick={onComplete}
                  className="cta-button flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background:lesson.color }}>
                  PrÃ³xima liÃ§Ã£o <ArrowRight size={14}/>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

// â”€â”€â”€ MODULE 3 PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function Modulo3Page() {
  const { completedLessons } = useXPStore()
  const [activeLesson, setActiveLesson] = useState<number | null>(null)
  const [completed,    setCompleted]    = useState<number[]>([])

  const lesson = activeLesson !== null ? LESSONS[activeLesson] : null

  function handleComplete() {
    if (activeLesson !== null) {
      setCompleted(c => [...new Set([...c, activeLesson])])
      const next = activeLesson + 1
      if (next < LESSONS.length) setActiveLesson(next)
      else setActiveLesson(null)
    }
  }

  const totalXP  = LESSONS.filter((_, i) => completed.includes(i)).reduce((s, l) => s + l.xp, 0)
  const progress = (completed.length / LESSONS.length) * 100

  return (
    <div className="min-h-screen" style={{ background:'#05050e' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-40"
        style={{ background:'rgba(5,5,14,0.95)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={16}/>
            <span className="text-[13px] font-semibold">Dashboard</span>
          </Link>
          <div className="flex-1 mx-4">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full" style={{ background:'linear-gradient(90deg,#3b82f6,#8b5cf6)' }}
                animate={{ width:`${progress}%` }} transition={{ duration:0.5 }}/>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full"
            style={{ background:'rgba(245,158,11,0.1)', color:'#fbbf24', border:'1px solid rgba(245,158,11,0.15)' }}>
            <Zap size={11}/> {totalXP} XP
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-10">
        {!lesson ? (
          <>
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }} className="mb-10">
              <div className="text-[11px] font-bold uppercase tracking-widest text-purple-400 mb-2">MÃ³dulo 3 de 8</div>
              <h1 className="text-4xl font-black text-white tracking-tight mb-3">Cotidiano</h1>
              <p className="text-slate-400 max-w-xl leading-relaxed">
                FamÃ­lia, comida e trabalho â€” as palavras que vocÃª usa todos os dias.
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <div className="flex items-center gap-2 text-[12px] px-3.5 py-2 rounded-xl"
                  style={{ background:'rgba(59,130,246,0.08)', color:'#60a5fa', border:'1px solid rgba(59,130,246,0.15)' }}>
                  <BookOpen size={13}/> {LESSONS.length} liÃ§Ãµes
                </div>
                <div className="flex items-center gap-2 text-[12px] px-3.5 py-2 rounded-xl"
                  style={{ background:'rgba(245,158,11,0.08)', color:'#fbbf24', border:'1px solid rgba(245,158,11,0.15)' }}>
                  <Zap size={13}/> {LESSONS.reduce((s, l) => s + l.xp, 0)} XP total
                </div>
                <div className="flex items-center gap-2 text-[12px] px-3.5 py-2 rounded-xl"
                  style={{ background:'rgba(16,185,129,0.08)', color:'#34d399', border:'1px solid rgba(16,185,129,0.15)' }}>
                  <Target size={13}/> {LESSONS.reduce((s, l) => s + l.minutes, 0)} min estimado
                </div>
                {completed.length > 0 && (
                  <div className="flex items-center gap-2 text-[12px] px-3.5 py-2 rounded-xl"
                    style={{ background:'rgba(16,185,129,0.08)', color:'#34d399', border:'1px solid rgba(16,185,129,0.15)' }}>
                    <CheckCircle size={13}/> {completed.length}/{LESSONS.length} concluÃ­das
                  </div>
                )}
              </div>
            </motion.div>

            <div className="space-y-3">
              {LESSONS.map((lesson, i) => (
                <LessonCard key={lesson.id} lesson={lesson} index={i}
                  isCompleted={completed.includes(i)}
                  onClick={() => setActiveLesson(i)}/>
              ))}
            </div>

            {completed.length === LESSONS.length && (
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
                className="mt-8 p-8 rounded-2xl text-center"
                style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)' }}>
                <Trophy size={32} className="mx-auto mb-3 text-green-400"/>
                <h3 className="text-xl font-black text-white mb-2">MÃ³dulo 3 concluÃ­do!</h3>
                <p className="text-slate-400 mb-5">VocÃª ganhou {totalXP} XP. PrÃ³ximo: Tempos Verbais I.</p>
                <Link href="/dashboard"
                  className="cta-button inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background:'#10b981' }}>
                  Voltar ao Dashboard <ArrowRight size={14}/>
                </Link>
              </motion.div>
            )}
          </>
        ) : (
          <LessonView lesson={lesson} onBack={() => setActiveLesson(null)} onComplete={handleComplete}/>
        )}
      </div>
    </div>
  )
}

