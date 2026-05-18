import { useState } from 'react'
import { Dumbbell, Loader2 } from 'lucide-react'
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
      setErr(e?.message ?? 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex bg-gradient-to-br from-red-700 to-red-600 text-white p-4 rounded-2xl shadow-lg mb-4">
            <Dumbbell size={32} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">ALPHA FITNESS JAMPUR</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to manage members</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</span>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              autoFocus
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</span>
            <input
              type="password" required value={password} minLength={6}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
            />
          </label>

          {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}

          <button
            type="submit" disabled={busy}
            className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold shadow flex items-center justify-center gap-2"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="w-full text-sm text-slate-600 hover:text-slate-900 py-1"
          >
            {mode === 'signin' ? "New here? Create an account" : 'Already have an account? Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Your data syncs to the cloud automatically. Works offline too.
        </p>
      </div>
    </div>
  )
}
