import { createBrowserClient } from '@supabase/ssr'

// Este cliente é exclusivo para COMPONENTES CLIENTE (Login, Chat, etc)
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )