'use server'

import { createClient } from '@/lib/supabase/server'

export type LoginResult = { ok: true } | { ok: false; error: string }

export async function loginWithPassword(email: string, password: string): Promise<LoginResult> {
  if (!email.trim() || !password) return { ok: false, error: 'Introduza o email e a password.' }
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (!error) return { ok: true }
    const message = error.message.toLowerCase()
    if (message.includes('email not confirmed')) return { ok: false, error: 'O email ainda não foi confirmado.' }
    if (message.includes('invalid login credentials')) return { ok: false, error: 'Email ou password incorretos.' }
    return { ok: false, error: `Não foi possível iniciar sessão: ${error.message}` }
  } catch {
    return { ok: false, error: 'Não foi possível ligar ao serviço de autenticação. Tente novamente.' }
  }
}
