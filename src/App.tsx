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
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="serif-italic text-ink-soft">Opening the register…</p>
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
    alert('Exported.')
  }

  const onSignOut = async () => { await window.api.auth.signOut(); setUser(null) }

  return (
    <div className="paper min-h-screen bg-paper text-ink">
      {/* MASTHEAD — like a newspaper banner */}
      <header className="border-b-4 border-double border-ink relative">
        <div className="max-w-[1500px] mx-auto px-10 pt-5 pb-3">
          <div className="flex items-center justify-between mono text-[10px] tracking-widest2 uppercase text-ink-soft pb-3 border-b border-rule">
            <span className="flex items-center gap-3">
              <span className="inline-block w-1.5 h-1.5 bg-oxblood ink-pulse rounded-full" />
              Live edition
            </span>
            <span>Volume I · No. 02</span>
            <span>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="flex items-end justify-between pt-4">
            <div>
              <h1 className="serif text-[3.5rem] md:text-[4.5rem] leading-[0.85] tracking-tight">
                Alpha Fitness <span className="serif-italic text-oxblood">Jampur</span>
                <span className="text-oxblood">.</span>
              </h1>
              <p className="annotation mt-1 text-sm">— The proprietor's members register</p>
            </div>

            <div className="flex items-center gap-2 pb-2">
              <SyncBadge onSignOut={onSignOut} />
              <button
                onClick={onExport}
                className="px-4 py-2.5 border border-rule hover:border-ink hover:bg-paper-2 transition mono text-[10px] tracking-widest2 uppercase flex items-center gap-2"
              >
                <Download size={12} /> Export
              </button>
              <button
                onClick={() => setEditing('new')}
                className="px-5 py-2.5 bg-ink text-paper hover:bg-oxblood transition mono text-[10px] tracking-widest2 uppercase flex items-center gap-2"
              >
                <Plus size={13} /> New member
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-10 py-12 space-y-14">
        <Dashboard stats={stats} />

        <section className="ink-in ink-4">
          <div className="flex items-end justify-between mb-6 pb-3 border-b border-ink">
            <div className="flex items-baseline gap-4">
              <p className="mono text-[10px] tracking-widest2 uppercase text-ink-soft">§ 02</p>
              <h2 className="serif text-4xl tracking-tight">
                The <span className="serif-italic">roster.</span>
              </h2>
              <p className="annotation text-sm">— in order of enrolment</p>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                placeholder="Search the register…"
                value={q} onChange={(e) => setQ(e.target.value)}
                className="pl-9 pr-4 py-2 bg-paper-2 border border-rule focus:border-ink outline-none serif-body italic text-sm w-80 placeholder-ink-faint transition"
              />
            </div>
          </div>

          <StudentTable
            students={students}
            onEdit={(s) => setEditing(s)}
            onOpenPayments={(s) => setDrawerStudent(s)}
            onDelete={async (s) => {
              if (confirm(`Remove ${s.name} from the register?`)) { await window.api.students.remove(s.id); refresh() }
            }}
          />
        </section>

        <footer className="border-t-2 border-double border-rule-strong pt-6 flex items-center justify-between annotation text-xs">
          <span>Folio · {students.length.toString().padStart(3, '0')}</span>
          <span>—— ❦ ——</span>
          <span>End of present entries</span>
        </footer>
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
