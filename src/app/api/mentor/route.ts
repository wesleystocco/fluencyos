import { NextRequest, NextResponse } from 'next/server'

// Dicionário de respostas corretas por tipo de pergunta
const ANSWER_PATTERNS: Record<string, string[]> = {
  'present_perfect': ['have been', 'has been', "'ve been", "'s been"],
  'past_simple': ['went', 'saw', 'did', 'was', 'were'],
  'phrasal_verbs': ['bring up', 'cut corners', 'bear in mind'],
  'prepositions': ['on', 'at', 'in', 'by', 'with'],
}

interface MentorRequest {
  userAnswer: string
  correctAnswer: string
  question: string
  topic: string
  difficulty: string
  attempt: number
  maxAttempts: number
}

// Avaliar a resposta do usuário
function evaluateAnswer(userAnswer: string, correctAnswer: string): {
  isCorrect: boolean
  similarity: number
} {
  const normalize = (str: string) => str.toLowerCase().trim()
  const user = normalize(userAnswer)
  const correct = normalize(correctAnswer)

  // Match exato
  if (user === correct) {
    return { isCorrect: true, similarity: 1 }
  }

  // Verificar se a resposta está parcialmente correta
  if (correct.includes(user) || user.includes(correct)) {
    return { isCorrect: false, similarity: 0.6 }
  }

  // Similaridade Levenshtein (simple)
  const distance = levenshteinDistance(user, correct)
  const maxLen = Math.max(user.length, correct.length)
  const similarity = 1 - distance / maxLen

  return {
    isCorrect: similarity > 0.85,
    similarity: similarity > 0.5 ? similarity : 0,
  }
}

// Distância Levenshtein simples
function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(0))

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator,
      )
    }
  }

  return track[str2.length][str1.length]
}

// Gerar dica baseada na dificuldade
function getHint(question: string, topic: string, difficulty: string): string {
  const hints: Record<string, string[]> = {
    iniciante: [
      'Tenta pronunciar a frase mais devagar',
      'Pensa em como você ouve nativos falando',
      'Qual é a forma mais simples de dizer isso?',
    ],
    basico: [
      'Lembra do padrão que praticamos antes?',
      'Tenta usar a forma positiva/negativa',
      'Quais palavras-chave estão faltando?',
    ],
    intermediario: [
      'Qual é o phrasal verb aqui?',
      'Tenta rever a ordem das palavras',
      'Qual tempo verbal faria mais sentido?',
    ],
    fluente: [
      'Tenta pensar na nuance mais precisa',
      'Como um nativo diria isso?',
      'Qual é o registro mais apropriado?',
    ],
  }

  const hintList = hints[difficulty] || hints.basico
  return hintList[Math.floor(Math.random() * hintList.length)]
}

// Gerar explicação completa
function getFullExplanation(question: string, correctAnswer: string, topic: string): string {
  const explanations: Record<string, string> = {
    'present_perfect':
      'O Present Perfect é usado para falar de ações que começaram no passado e continuam até agora, ou ações recentes.\n\nEstrutura: have/has + past participle\n\nExemplo: "I have been here for 2 hours" (estou aqui há 2 horas)',
    'past_simple':
      'O Past Simple é usado para ações completas no passado.\n\nEstrutura: verbo + ed (regular) ou forma irregular\n\nExemplo: "I went to the store yesterday" (fui à loja ontem)',
    'phrasal_verbs':
      'Phrasal verbs são combinações de verbo + preposição/advérbio que criam novos significados.\n\nExemplo: "bring up" = mencionar\n"to cut corners" = fazer de forma mais fácil/barata',
    'default': `Resposta correta: "${correctAnswer}"\n\nEssa é uma expressão comum usada em situações onde você quer ${topic}. Praticando repetidamente, você vai internalizar naturalmente.`,
  }

  return (
    explanations[topic] || explanations.default
  )
}

export async function POST(request: NextRequest) {
  try {
    const body: MentorRequest = await request.json()

    const { userAnswer, correctAnswer, question, topic, difficulty, attempt, maxAttempts } = body

    // Avaliar resposta
    const { isCorrect, similarity } = evaluateAnswer(userAnswer, correctAnswer)

    // Preparar resposta baseada no resultado
    let response = {
      isCorrect,
      similarity,
      hint: getHint(question, topic, difficulty),
      tip: '',
      explanation: '',
      fullExplanation: '',
    }

    if (isCorrect) {
      response.explanation = `Muito bem! Você acertou. Essa expressão é muito comum em inglês.`
    } else if (attempt < maxAttempts) {
      response.tip = getHint(question, topic, difficulty)

      if (similarity > 0.5) {
        response.explanation = `Você está próximo! Mas a resposta não é exatamente essa.`
      } else {
        response.explanation = `Tenta novamente! Pensa na estrutura da frase.`
      }
    } else {
      // Última tentativa ou já passaram
      response.fullExplanation = getFullExplanation(question, correctAnswer, topic)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Mentor API Error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar sua resposta' },
      { status: 500 },
    )
  }
}
