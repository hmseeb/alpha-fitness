import { useState } from 'react'
import { Loader2, ArrowRight } from 'lucide-react'
import type { AuthUser } from '../types'

export function Login({ onSignedIn }: { onSignedIn: (u: AuthUser) => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null); setBusy(true)
    try {
      const user = mode === 'signin'
        ? await window.api.auth.signIn(email, password)
        : await window.api.auth.signUp(email, password)
      if (!user?.id) throw new Error('check your email to confirm and try again.')
      onSignedIn(user)
    } catch (e: any) {
      setErr(e?.message ?? 'login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grain min-h-screen flex bg-ink-0 text-white relative overflow-hidden">
      {/* LEFT — brand panel */}
      <div className="hidden md:flex flex-col flex-1 relative stripes border-r border-line">
        <div className="absolute inset-0 bg-gradient-to-br from-crimson-deep/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-crimson/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 left-0 h-1/2 bg-gradient-to-t from-ink-0 to-transparent" />

        <div className="relative z-10 p-10 flex flex-col h-full justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-crimson rec-dot rounded-full" />
            <span className="mono text-xs tracking-widest2 text-zinc-400 uppercase">est. jampur</span>
          </div>

          <div className="space-y-6 rise">
            <div className="display text-[10vw] md:text-[7rem] leading-[0.85] tracking-tight">
              <div>ALPHA</div>
              <div className="text-crimson">FITNESS</div>
              <div className="text-zinc-500 text-[4rem]">JAMPUR</div>
            </div>
            <div className="flex items-center gap-4 max-w-md">
              <div className="h-px flex-1 bg-line" />
              <p className="mono text-[10px] tracking-widest2 uppercase text-zinc-500">
                member operations console
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs mono text-zinc-600 uppercase tracking-widest2">
            <span>v0.2 / offline-first</span>
            <span>encrypted ↗</span>
          </div>
        </div>
      </div>

      {/* RIGHT — auth */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-sm rise rise-2">
          <div className="mb-10">
            <p className="mono text-[10px] tracking-widest2 uppercase text-crimson mb-3">
              {mode === 'signin' ? '01 / authenticate' : '01 / register'}
            </p>
            <h1 className="display text-6xl tracking-tight leading-none">
              {mode === 'signin' ? 'STEP IN.' : 'CLAIM IT.'}
            </h1>
            <p className="text-zinc-500 mt-3 text-sm">
              {mode === 'signin' ? 'access your roster, payments, and the lot.' : 'create your operator account.'}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <Input label="email" type="email" value={email} onChange={setEmail} autoFocus />
            <Input label="password" type="password" value={password} onChange={setPassword} minLength={6} />

            {err && (
              <div className="mono text-[11px] uppercase tracking-wider text-crimson border-l-2 border-crimson pl-3 py-1">
                {err}
              </div>
            )}

            <button
              type="submit" disabled={busy}
              className="group w-full bg-crimson hover:bg-crimson-glow disabled:opacity-50 text-white py-4 px-6 flex items-center justify-between transition shadow-glow"
            >
              <span className="display text-2xl tracking-wider">
                {mode === 'signin' ? 'ENTER' : 'CREATE'}
              </span>
              {busy ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={20} className="group-hover:translate-x-1 transition" />}
            </button>

            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="block w-full text-center mono text-[10px] tracking-widest2 uppercase text-zinc-500 hover:text-white transition pt-2"
            >
              {mode === 'signin' ? '↓ create new account' : '↑ sign in instead'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Input({ label, type, value, onChange, autoFocus, minLength }: {
  label: string; type: string; value: string; onChange: (v: string) => void; autoFocus?: boolean; minLength?: number
}) {
  return (
    <label className="block group">
      <span className="mono text-[10px] tracking-widest2 uppercase text-zinc-500 group-focus-within:text-crimson transition">
        / {label}
      </span>
      <input
        type={type} required value={value} minLength={minLength}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full bg-transparent border-0 border-b-2 border-line focus:border-crimson outline-none py-2 text-lg text-white placeholder-zinc-700 transition"
      />
    </label>
  )
}
