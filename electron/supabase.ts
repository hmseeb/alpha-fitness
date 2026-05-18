import { createClient, SupabaseClient, Session } from '@supabase/supabase-js'
import { safeStorage, app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import ws from 'ws'

// Provide WebSocket impl for Node < 22 (Electron 33 ships Node 20)
;(globalThis as any).WebSocket ??= ws as any

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xkxlrtiovlmbdecjblpn.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhreGxydGlvdmxtYmRlY2pibHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjQxOTYsImV4cCI6MjA5NDcwMDE5Nn0.-UKo0zg2v9PQOEIVgWbiMtFSQhmallxfasE60FihWDI'

let supabase: SupabaseClient

export function initSupabase() {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return supabase
}

export function getSupabase() { return supabase }

function sessionFile() {
  return path.join(app.getPath('userData'), 'session.bin')
}

export function saveSession(session: Session) {
  const json = JSON.stringify(session)
  const buf = safeStorage.isEncryptionAvailable()
    ? safeStorage.encryptString(json)
    : Buffer.from(json, 'utf8')
  fs.writeFileSync(sessionFile(), buf)
}

export function loadSession(): Session | null {
  const file = sessionFile()
  if (!fs.existsSync(file)) return null
  try {
    const buf = fs.readFileSync(file)
    const json = safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(buf) : buf.toString('utf8')
    return JSON.parse(json) as Session
  } catch {
    return null
  }
}

export function clearSession() {
  const file = sessionFile()
  if (fs.existsSync(file)) fs.unlinkSync(file)
}

export async function restoreSession(): Promise<Session | null> {
  const session = loadSession()
  if (!session) return null
  const { data, error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })
  if (error || !data.session) { clearSession(); return null }
  saveSession(data.session)
  return data.session
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  if (data.session) saveSession(data.session)
  return data
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  if (data.session) saveSession(data.session)
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
  clearSession()
}
