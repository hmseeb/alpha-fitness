import { useEffect, useState, useCallback } from 'react'
import type { Student, DashStats, AuthUser } from './types'
import { Dashboard } from './components/Dashboard'
import { StudentTable } from './components/StudentTable'
import { StudentDialog } from './components/StudentDialog'
import { PaymentDrawer } from './components/PaymentDrawer'
import { Login } from './components/Login'
import { SyncBadge } from './components/SyncBadge'
import { Plus, Download, Search, Dumbbell } from 'lucide-react'
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
    setStudents(list); setStats(s)
  }, [q, user?.id])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    if (!user?.id) return
    const off = window.api.sync.onStatus((s) => { if (s.status === 'idle') refresh() })
    return off
  }, [user?.id, refresh])

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <p className="text-muted text-sm">Opening…</p>
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
    alert('Exported ✓')
  }

  const onSignOut = async () => { await window.api.auth.signOut(); setUser(null) }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-canvas/85 backdrop-blur-xl border-b border-line">
        <div className="max-w-[1500px] mx-auto px-8 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ink rounded-2xl flex items-center justify-center">
              <Dumbbell size={18} className="text-lime" />
            </div>
            <div>
              <h1 className="display-sm text-lg leading-tight">Alpha Fitness</h1>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Jampur · members</p>
            </div>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-soft" />
            <input
              placeholder="Search members…"
              value={q} onChange={(e) => setQ(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface-2/60 border border-line focus:bg-surface focus:border-ink rounded-2xl text-sm outline-none transition placeholder-soft"
            />
          </div>

          <div className="flex items-center gap-2">
            <SyncBadge onSignOut={onSignOut} />
            <button
              onClick={onExport}
              className="px-4 py-3 bg-surface hover:bg-surface-2 border border-line transition rounded-2xl text-sm font-semibold flex items-center gap-2"
            >
              <Download size={14} /> Export
            </button>
            <button
              onClick={() => setEditing('new')}
              className="px-5 py-3 bg-lime text-ink hover:bg-lime-deep transition rounded-2xl text-sm font-bold flex items-center gap-2 glow-lime"
            >
              <Plus size={16} /> Add member
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-8 py-10 space-y-10">
        <div className="pop">
          <Dashboard stats={stats} />
        </div>

        <section className="pop pop-4">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="display-md text-[2.5rem]">Roster.</h2>
              <p className="text-sm text-muted mt-1">All members on the books · {students.length} total</p>
            </div>
          </div>

          <div className="bg-surface rounded-4xl lift overflow-hidden">
            <StudentTable
              students={students}
              onEdit={(s) => setEditing(s)}
              onOpenPayments={(s) => setDrawerStudent(s)}
              onDelete={async (s) => {
                if (confirm(`Remove ${s.name}?`)) { await window.api.students.remove(s.id); refresh() }
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
