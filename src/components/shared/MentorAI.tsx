'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic2, Send, Lightbulb, CheckCircle, AlertCircle, Brain, RotateCcw } from 'lucide-react'

interface MentorMessage {
  role: 'mentor' | 'user'
  content: string
  type?: 'feedback' | 'hint' | 'explanation' | 'encouragement'
}

interface MentorAIProps {
  question: string
  correctAnswer: string
  topic: string
  difficulty: 'iniciante' | 'basico' | 'intermediario' | 'fluente'
  onComplete?: (success: boolean) => void
}

export function MentorAI({ question, correctAnswer, topic, difficulty, onComplete }: MentorAIProps) {
  const [messages, setMessages] = useState<MentorMessage[]>([])
  const [input, setInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [loading, setLoading] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const messagesEnd = useRef<HTMLDivElement>(null)

  const MAX_ATTEMPTS = 3

  // Scroll para última mensagem
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Inicializar com mensagem do mentor
  useEffect(() => {
    setMessages([
      {
        role: 'mentor',
        content: `Ótimo! Vamos trabalhar com: "${question}"\n\nPense e me diga sua resposta em inglês. Sem pressão — estou aqui para ajudar você a entender.`,
        type: 'encouragement',
      },
    ])
  }, [question])

  const evaluateAnswer = async (userAnswer: string) => {
    setLoading(true)
    setAttempts(a => a + 1)

    try {
      // Simular análise da resposta (em produção, seria uma chamada à API)
      const response = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAnswer,
          correctAnswer,
          question,
          topic,
          difficulty,
          attempt: attempts + 1,
          maxAttempts: MAX_ATTEMPTS,
        }),
      })

      const data = await response.json()

      // Adicionar resposta do usuário
      setMessages(prev => [...prev, { role: 'user', content: userAnswer }])

      // Processar feedback do mentor
      if (data.isCorrect) {
        setMessages(prev => [
          ...prev,
          {
            role: 'mentor',
            content: `✨ Perfeito! "${userAnswer}" está correto! ${data.explanation || ''}`,
            type: 'feedback',
          },
        ])
        onComplete?.(true)
      } else if (attempts + 1 < MAX_ATTEMPTS) {
        setMessages(prev => [
          ...prev,
          {
            role: 'mentor',
            content: `Hmm, não é bem isso... ${data.hint || 'Tenta de novo! Pense em...'}\n\n💡 Dica rápida: ${data.tip}`,
            type: 'hint',
          },
        ])
      } else {
        // Revelou a resposta
        setRevealed(true)
        setMessages(prev => [
          ...prev,
          {
            role: 'mentor',
            content: `Tudo bem, vamos entender juntos:\n\n**Resposta correta:** "${correctAnswer}"\n\n📚 **Explicação completa:**\n${data.fullExplanation}\n\nAgora você entendeu? Quer tentar outra questão?`,
            type: 'explanation',
          },
        ])
        onComplete?.(false)
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          content: userAnswer,
        },
        {
          role: 'mentor',
          content: 'Desculpa, tive um problema técnico. Tenta de novo!',
          type: 'feedback',
        },
      ])
    }

    setLoading(false)
    setInput('')
  }

  const handleSend = () => {
    if (!input.trim() || loading || revealed) return
    evaluateAnswer(input.trim())
  }

  const handleReset = () => {
    setMessages([
      {
        role: 'mentor',
        content: `Vamos tentar de novo: "${question}"\n\nMe diga sua resposta!`,
        type: 'encouragement',
      },
    ])
    setAttempts(0)
    setRevealed(false)
    setInput('')
  }

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col h-[500px]" style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.07)' }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
          <Brain size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-white">Mentor IA</div>
          <div className="text-[11px] text-slate-500">Auxiliando sua aprendizagem</div>
        </div>
        <div className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(37,99,235,0.1)', color: '#60a5fa' }}>
          {attempts}/{MAX_ATTEMPTS}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'mentor' && (
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Brain size={13} className="text-white" />
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-2.5 text-[13px] max-w-[70%] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-slate-800 text-slate-200 rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {!revealed ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Sua resposta em inglês..."
              disabled={loading || attempts >= MAX_ATTEMPTS}
              className="flex-1 px-4 py-2.5 text-[13px] rounded-lg bg-slate-800 text-white placeholder-slate-600 border border-slate-700 focus:outline-none focus:border-blue-600 focus:bg-slate-900 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleReset}
            className="w-full px-4 py-2.5 rounded-lg bg-green-600 text-white text-[13px] font-bold hover:bg-green-500 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            Tentar outra questão
          </button>
        )}
      </div>
    </div>
  )
}
