import { useState } from 'react'
import { Loader2 } from 'lucide-react'
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
      if (!user?.id) throw new Error('Check your email to confirm and try again.')
      onSignedIn(user)
    } catch (e: any) {
      setErr(e?.message ?? 'Authentication failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="paper min-h-screen bg-paper text-ink flex flex-col">
      {/* MASTHEAD */}
      <header className="border-b-4 border-double border-ink">
        <div className="max-w-5xl mx-auto px-10 py-5 flex items-center justify-between">
          <p className="mono text-[10px] tracking-widest2 uppercase text-ink-soft">
            Vol. I · Issue 02 · Established Jampur 2026
          </p>
          <p className="mono text-[10px] tracking-widest2 uppercase text-ink-soft">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' })}
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-10 py-14 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        {/* LEFT — masthead title */}
        <div className="md:col-span-7 ink-in">
          <p className="mono text-[10px] tracking-widest2 uppercase text-oxblood mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-oxblood" />
            The Members' Register
          </p>

          <h1 className="serif text-[6rem] md:text-[8.5rem] leading-[0.85] tracking-tight text-ink">
            Alpha
            <br />
            <span className="serif-italic text-oxblood">Fitness</span>
            <br />
            <span className="text-ink-soft">Jampur</span>
            <span className="text-oxblood">.</span>
          </h1>

          <div className="mt-8 max-w-md">
            <div className="rule-fancy mb-6" />
            <p className="serif-body text-base text-ink-2 leading-relaxed dropcap">
              A bound ledger of every member who has crossed the threshold of our gymnasium — their dues, attendance and standing — kept current by the proprietor.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-6 text-xs annotation">
            <span>— Est. <span className="lining">2026</span></span>
            <span className="text-rule-strong">·</span>
            <span>Offline-keeping, cloud-bound.</span>
          </div>
        </div>

        {/* RIGHT — sign-in card */}
        <div className="md:col-span-5 ink-in ink-2">
          <div className="bg-paper-2 border border-rule p-8 shadow-paper">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-rule">
              <p className="mono text-[10px] tracking-widest2 uppercase text-ink-soft">
                {mode === 'signin' ? '§ Sign in' : '§ Register'}
              </p>
              <p className="mono text-[10px] tracking-widest2 uppercase text-ink-faint">
                p. 001
              </p>
            </div>

            <h2 className="serif text-4xl leading-tight mb-2">
              {mode === 'signin' ? (
                <>Welcome <span className="serif-italic">back,</span></>
              ) : (
                <>A new <span className="serif-italic">account.</span></>
              )}
            </h2>
            <p className="serif-body text-ink-soft text-sm mb-7">
              {mode === 'signin' ? 'Please enter your credentials below.' : 'Choose an email and a password of at least six characters.'}
            </p>

            <form onSubmit={submit} className="space-y-5">
              <Field label="Email" type="email" value={email} onChange={setEmail} autoFocus />
              <Field label="Password" type="password" value={password} onChange={setPassword} minLength={6} />

              {err && (
                <p className="serif-italic text-sm text-oxblood border-l-2 border-oxblood pl-3">
                  {err}
                </p>
              )}

              <button
                type="submit" disabled={busy}
                className="group w-full bg-ink text-paper hover:bg-oxblood disabled:opacity-50 transition-colors py-4 px-6 flex items-center justify-between"
              >
                <span className="serif text-xl tracking-tight">
                  {mode === 'signin' ? 'Enter the register' : 'Create account'}
                </span>
                {busy ? <Loader2 size={18} className="animate-spin" /> : <span className="serif-italic text-lg">→</span>}
              </button>
            </form>

            <div className="rule-fancy rule-fancy-paper2 mt-8 mb-5" />

            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="block w-full text-center serif-italic text-sm text-ink-soft hover:text-ink transition"
            >
              {mode === 'signin' ? 'Or, register a new account →' : '← Already an account? Sign in.'}
            </button>
          </div>

          <p className="mt-4 text-center mono text-[10px] tracking-widest2 uppercase text-ink-faint">
            entries are kept locally · synchronised to cloud
          </p>
        </div>
      </main>

      <footer className="border-t border-rule">
        <div className="max-w-5xl mx-auto px-10 py-4 flex items-center justify-between mono text-[10px] tracking-widest2 uppercase text-ink-faint">
          <span>Printed in single copy</span>
          <span>—— ✦ ——</span>
          <span>The proprietor's edition</span>
        </div>
      </footer>
    </div>
  )
}

function Field({ label, type, value, onChange, autoFocus, minLength }: {
  label: string; type: string; value: string; onChange: (v: string) => void; autoFocus?: boolean; minLength?: number
}) {
  return (
    <label className="block group">
      <span className="mono text-[10px] tracking-widest2 uppercase text-ink-soft group-focus-within:text-oxblood transition">
        {label}
      </span>
      <input
        type={type} required value={value} minLength={minLength}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent border-0 border-b border-rule-strong focus:border-ink outline-none py-2 serif-body text-lg text-ink placeholder-ink-faint transition"
      />
    </label>
  )
}
