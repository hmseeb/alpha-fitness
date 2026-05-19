import { useState } from 'react'
import { Loader2, ArrowRight, Dumbbell } from 'lucide-react'
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
      if (!user?.id) throw new Error('Check your email to confirm, then sign in.')
      onSignedIn(user)
    } catch (e: any) {
      setErr(e?.message ?? 'Sign in failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mesh-bg min-h-screen bg-canvas flex flex-col">
      {/* Top bar: drag region + brand mark */}
      <div className="app-drag flex items-center pl-24 pr-8 h-14 shrink-0 border-b border-line/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-ink rounded-xl flex items-center justify-center">
            <Dumbbell size={15} className="text-lime" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Alpha Fitness</p>
            <p className="text-[9px] uppercase tracking-[0.18em] text-muted mt-0.5">Jampur · Pakistan</p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1100px] mx-auto px-8 grid md:grid-cols-2 gap-8 items-center">
        {/* LEFT — hero */}
        <div className="pop">
          <span className="inline-flex items-center gap-2 bg-lime/30 text-ink-2 px-3 py-1.5 rounded-full text-xs font-medium mb-7">
            <span className="relative inline-flex w-2 h-2 bg-moss rounded-full">
              <span className="absolute inset-0 bg-moss rounded-full pulse-dot" />
            </span>
            Members register · v0.3
          </span>

          <h1 className="display text-[5.5rem] md:text-[7rem]">
            Run your <span style={{ color: 'var(--lime-deep)', background: 'var(--lime)', padding: '0 0.18em', borderRadius: '0.12em' }}>gym</span> the
            <br /> right way.
          </h1>

          <p className="text-lg text-muted mt-7 max-w-md leading-relaxed">
            Track members, fees, and payments in one place. Works offline. Syncs to the cloud the moment you're back online.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            <Feature emoji="⚡" label="Instant" sub="local-first" />
            <Feature emoji="☁︎" label="Synced" sub="auto cloud" />
            <Feature emoji="✦" label="Private" sub="just you" />
          </div>
        </div>

        {/* RIGHT — auth card */}
        <div className="pop pop-2">
          <div className="bg-surface rounded-4xl lift-md p-9">
            <div className="flex items-center justify-between mb-7">
              <h2 className="display-md text-3xl">
                {mode === 'signin' ? 'Welcome back.' : 'Get started.'}
              </h2>
              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-xs font-medium text-muted hover:text-ink transition"
              >
                {mode === 'signin' ? 'New? Sign up' : 'Have an account? Sign in'}
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <Field label="Email" type="email" value={email} onChange={setEmail} autoFocus placeholder="you@gym.com" />
              <Field label="Password" type="password" value={password} onChange={setPassword} minLength={6} placeholder="••••••••" />

              {err && (
                <p className="text-sm bg-coral/10 text-coral border border-coral/30 rounded-2xl px-4 py-2.5">
                  {err}
                </p>
              )}

              <button
                type="submit" disabled={busy}
                className="group w-full bg-ink text-lime hover:bg-ink-2 disabled:opacity-50 transition rounded-2xl py-4 px-6 flex items-center justify-between font-semibold mt-5"
              >
                <span>{mode === 'signin' ? 'Sign in' : 'Create account'}</span>
                {busy ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} className="group-hover:translate-x-1 transition" />}
              </button>
            </form>

            <p className="text-center text-[11px] text-soft mt-6">
              Encrypted on this device with your system keychain
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder, autoFocus, minLength }: {
  label: string; type: string; value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean; minLength?: number
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted mb-1.5 block">{label}</span>
      <input
        type={type} required value={value} minLength={minLength}
        autoFocus={autoFocus} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-2/60 border border-line focus:bg-surface focus:border-ink rounded-2xl px-4 py-3 text-base outline-none transition placeholder-soft"
      />
    </label>
  )
}

function Feature({ emoji, label, sub }: { emoji: string; label: string; sub: string }) {
  return (
    <div className="bg-surface rounded-2xl px-3 py-3 lift">
      <p className="text-xl">{emoji}</p>
      <p className="text-sm font-semibold mt-1">{label}</p>
      <p className="text-[10px] text-muted uppercase tracking-wider">{sub}</p>
    </div>
  )
}
