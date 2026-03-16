// src/lib/xp-sync.ts
// Sincroniza XP entre localStorage e Supabase

import { createClient } from './supabase'
import { useXPStore } from '@/store/xp'

function calcLevel(xp: number) { return Math.floor(Math.sqrt(xp / 50)) + 1 }

/**
 * ApÃ³s autenticaÃ§Ã£o bem-sucedida, carregar XP do usuÃ¡rio do Supabase
 */
export async function syncXPFromSupabase(userId: string) {
  try {
    const supabase = createClient()
    // Evita vazamento de XP entre contas no mesmo navegador
    useXPStore.getState().setUser(userId)
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('xp, level')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) {
      console.error('Erro ao carregar XP do Supabase:', error)
      return false
    }
    
    if (!profile) {
      console.warn('Perfil nÃ£o encontrado para user:', userId)
      return false
    }

    const profileXP = profile.xp ?? 0
    const profileLevel = profile.level ?? calcLevel(profileXP)
    
    // Atualizar store com XP do Supabase (forÃ§a resetar localStorage)
    const store = useXPStore.getState()
    
    // Se XP local Ã© maior, manter local (evita perder progresso)
    if (store.totalXP > profileXP) {
      console.log('ðŸ“Š Mantendo XP local (maior):', store.totalXP)
      // Opcionalmente, pode salvar no Supabase aqui
      return true
    }
    
    // SenÃ£o, usar XP do Supabase
    console.log('ðŸ“Š Sincronizando XP do Supabase:', profileXP)
    useXPStore.setState({
      totalXP: profileXP,
      level: profileLevel,
    })
    
    return true
  } catch (e) {
    console.error('ExceÃ§Ã£o ao sincronizar XP:', e)
    return false
  }
}

/**
 * ApÃ³s aÃ§Ã£o (quiz, desafio, liÃ§Ã£o), salvar XP no Supabase
 */
export async function saveXPToSupabase(userId: string) {
  try {
    const supabase = createClient()
    const store = useXPStore.getState()
    
    const { error } = await supabase
      .from('profiles')
      .update({
        xp: store.totalXP,
        level: store.level,
        updated_at: new Date(),
      })
      .eq('user_id', userId)
    
    if (error) {
      console.warn('âš ï¸ Erro ao salvar XP no Supabase (continuando com localStorage):', error)
      return false
    }
    
    console.log('âœ… XP salvo no Supabase:', store.totalXP)
    return true
  } catch (e) {
    console.warn('âš ï¸ ExceÃ§Ã£o ao salvar XP (usando localStorage):', e)
    return false
  }
}

/**
 * SincronizaÃ§Ã£o contÃ­nua a cada 30 segundos
 */
export function startXPSync(userId: string) {
  const interval = setInterval(() => {
    saveXPToSupabase(userId).catch(e => 
      console.error('Erro em sync periÃ³dica:', e)
    )
  }, 30000) // a cada 30 segundos
  
  return () => clearInterval(interval)
}

