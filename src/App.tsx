import { useEffect, useState, useCallback } from 'react'
import type { Student, DashStats, AuthUser } from './types'
import { Dashboard } from './components/Dashboard'
import { StudentTable } from './components/StudentTable'
import { StudentDialog } from './components/StudentDialog'
import { PaymentDrawer } from './components/PaymentDrawer'
import { Login } from './components/Login'
import { SyncBadge } from './components/SyncBadge'
import { Plus, Download, Search } from 'lucide-react'
import { exportToExcel } from './lib/export'

export default function App() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)
  const [students, setStudents] = useState<Student[]>([])
  const [stats, setStats] = useState<DashStats>({ active: 0, overdue: 0, revenue: 0 })
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Student | null | 'new'>(null)
  const [drawerStudent, setDrawerStudent] = useState<Student | null>(null)

  useEffect(() => {
    window.api.auth.state().then((u) => setUser(u))
    const off = window.api.auth.onStateChange((u) => setUser(u))
    return off
  }, [])

  const refresh = useCallback(async () => {
    if (!user?.id) return
    const [list, s] = await Promise.all([
      window.api.students.list(q || undefined),
      window.api.dashboard.stats(),
    ])
    setStudents(list)
    setStats(s)
  }, [q, user?.id])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    if (!user?.id) return
    const off = window.api.sync.onStatus((s) => { if (s.status === 'idle') refresh() })
    return off
  }, [user?.id, refresh])

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-ink-0 flex items-center justify-center">
        <div className="mono text-xs uppercase tracking-widest2 text-zinc-600 flex items-center gap-3">
          <span className="w-1.5 h-1.5 bg-crimson rec-dot rounded-full" />
          loading
        </div>
      </div>
    )
  }
  if (!user) return <Login onSignedIn={(u) => setUser(u)} />

  const onExport = async () => {
    const all = await window.api.students.list()
    const filePath = await window.api.dialog.saveExcel(`alpha-fitness-${new Date().toISOString().slice(0,10)}.xlsx`)
    if (!filePath) return
    const buf = exportToExcel(all)
    await window.api.files.writeBuffer(filePath, buf)
    alert('exported ✓')
  }

  const onSignOut = async () => {
    await window.api.auth.signOut()
    setUser(null)
  }

  return (
    <div className="grain min-h-screen bg-ink-0 text-white">
      {/* HEADER — brutalist branding bar */}
      <header className="relative border-b border-line">
        <div className="absolute inset-0 stripes pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />

        <div className="relative max-w-[1600px] mx-auto px-8 py-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 pr-5 border-r border-line">
              <div className="w-2 h-2 bg-crimson rec-dot rounded-full" />
              <span className="mono text-[10px] tracking-widest2 uppercase text-zinc-500">live</span>
            </div>
            <div>
              <h1 className="display text-3xl leading-none tracking-tight">
                ALPHA FITNESS <span className="text-crimson">/</span> JAMPUR
              </h1>
              <p className="mono text-[10px] tracking-widest2 uppercase text-zinc-600 mt-1">
                member operations console · v0.2
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SyncBadge onSignOut={onSignOut} />
            <button
              onClick={onExport}
              className="group flex items-center gap-2 px-4 py-2.5 border border-line hover:border-line-bright hover:bg-ink-2 transition mono text-[10px] tracking-widest2 uppercase"
            >
              <Download size={13} />
              <span>export</span>
            </button>
            <button
              onClick={() => setEditing('new')}
              className="group flex items-center gap-2 px-5 py-2.5 bg-crimson hover:bg-crimson-glow transition mono text-[10px] tracking-widest2 uppercase font-bold shadow-glow"
            >
              <Plus size={14} />
              <span>add member</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 py-8 space-y-8">
        <Dashboard stats={stats} />

        <section className="rise rise-4">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="mono text-[10px] tracking-widest2 uppercase text-zinc-500">/ 02</p>
              <h2 className="display text-4xl tracking-tight leading-none mt-1">THE ROSTER</h2>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                placeholder="search name or contact..."
                value={q} onChange={(e) => setQ(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-ink-1 border border-line focus:border-crimson outline-none text-sm w-80 placeholder-zinc-700 mono"
              />
            </div>
          </div>

          <div className="bg-ink-1 border border-line">
            <StudentTable
              students={students}
              onEdit={(s) => setEditing(s)}
              onOpenPayments={(s) => setDrawerStudent(s)}
              onDelete={async (s) => {
                if (confirm(`delete ${s.name}?`)) { await window.api.students.remove(s.id); refresh() }
              }}
            />
          </div>
        </section>
      </main>

      {editing !== null && (
        <StudentDialog
          student={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh() }}
        />
      )}

      {drawerStudent && (
        <PaymentDrawer
          student={drawerStudent}
          onClose={() => { setDrawerStudent(null); refresh() }}
        />
      )}
    </div>
  )
}
