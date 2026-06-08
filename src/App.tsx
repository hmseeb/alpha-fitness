import { useEffect, useState, useCallback } from 'react'
import type { Student, DashStats, AuthUser, Staff, StaffPayment, MemberFilter } from './types'
import { Dashboard } from './components/Dashboard'
import { StudentTable } from './components/StudentTable'
import { StudentDialog } from './components/StudentDialog'
import { PaymentDrawer } from './components/PaymentDrawer'
import { StaffTable } from './components/StaffTable'
import { StaffDialog } from './components/StaffDialog'
import { StaffPaymentDrawer } from './components/StaffPaymentDrawer'
import { Login } from './components/Login'
import { SyncBadge } from './components/SyncBadge'
import { UpdateToast } from './components/UpdateToast'
import { Plus, Download, Search, Dumbbell, Users, BadgePlus } from 'lucide-react'
import { exportToExcel } from './lib/export'

type Tab = 'members' | 'staff'

export default function App() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)
  const [tab, setTab] = useState<Tab>('members')
  const [students, setStudents] = useState<Student[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [staffPayThisMonth, setStaffPayThisMonth] = useState<Record<string, number>>({})
  const [stats, setStats] = useState<DashStats>({ active: 0, overdue: 0, revenue: 0, staffPaid: 0 })
  const [memberFilter, setMemberFilter] = useState<MemberFilter>('all')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Student | null | 'new'>(null)
  const [editingStaff, setEditingStaff] = useState<Staff | null | 'new'>(null)
  const [drawerStudent, setDrawerStudent] = useState<Student | null>(null)
  const [drawerStaff, setDrawerStaff] = useState<Staff | null>(null)

  useEffect(() => {
    window.api.auth.state().then((u) => setUser(u))
    const off = window.api.auth.onStateChange((u) => setUser(u))
    return off
  }, [])

  const refresh = useCallback(async () => {
    if (!user?.id) return
    const [list, s, st] = await Promise.all([
      window.api.students.list(tab === 'members' ? (q || undefined) : undefined),
      window.api.dashboard.stats(),
      window.api.staff.list(tab === 'staff' ? (q || undefined) : undefined),
    ])
    setStudents(list); setStats(s); setStaff(st)

    // compute paid-this-month per staff
    const monthStart = new Date().toISOString().slice(0, 7) + '-01'
    const totals: Record<string, number> = {}
    await Promise.all(st.map(async (member) => {
      const ps: StaffPayment[] = await window.api.staffPayments.list(member.id)
      totals[member.id] = ps.filter((p) => p.paid_on >= monthStart).reduce((a, p) => a + p.amount, 0)
    }))
    setStaffPayThisMonth(totals)
  }, [q, user?.id, tab])

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
  const isMembers = tab === 'members'

  // Clicking a dashboard card filters the roster to that subset (and jumps to the members tab).
  const applyMemberFilter = (f: MemberFilter) => { setTab('members'); setMemberFilter(f) }

  const today = new Date().toISOString().slice(0, 10)
  const visibleStudents = memberFilter === 'overdue'
    ? students.filter((s) => s.next_fees_date && s.next_fees_date < today)
    : students

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="app-drag sticky top-0 z-10 bg-canvas/85 backdrop-blur-xl border-b border-line">
        <div className="max-w-[1500px] mx-auto pl-24 pr-8 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ink rounded-2xl flex items-center justify-center">
              <Dumbbell size={18} className="text-lime" />
            </div>
            <div>
              <h1 className="display-sm text-lg leading-tight">Alpha Fitness</h1>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Jampur</p>
            </div>
          </div>

          {/* TABS */}
          <div className="flex items-center bg-surface-2 rounded-2xl p-1">
            <button
              onClick={() => { setTab('members'); setQ(''); setMemberFilter('all') }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                isMembers ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <Users size={14} /> Members <span className="mono text-[10px] tabular opacity-60">{students.length}</span>
            </button>
            <button
              onClick={() => { setTab('staff'); setQ('') }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                !isMembers ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <BadgePlus size={14} /> Staff <span className="mono text-[10px] tabular opacity-60">{staff.length}</span>
            </button>
          </div>

          <div className="flex-1 max-w-xs relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-soft" />
            <input
              placeholder={isMembers ? 'Search members…' : 'Search staff…'}
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
              onClick={() => isMembers ? setEditing('new') : setEditingStaff('new')}
              className="px-5 py-3 bg-lime text-ink hover:bg-lime-deep transition rounded-2xl text-sm font-bold flex items-center gap-2 glow-lime"
            >
              <Plus size={16} /> {isMembers ? 'Add member' : 'Add employee'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-8 py-10 space-y-10">
        <div className="pop">
          <Dashboard stats={stats} filter={memberFilter} onFilter={applyMemberFilter} />
        </div>

        <section className="pop pop-4">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="display-md text-[2.5rem]">
                {isMembers ? (memberFilter === 'overdue' ? 'Overdue.' : 'Roster.') : 'Payroll.'}
              </h2>
              <p className="text-sm text-muted mt-1">
                {isMembers
                  ? memberFilter === 'overdue'
                    ? `Members past their due date · ${visibleStudents.length} of ${students.length}`
                    : `All members on the books · ${students.length} total`
                  : `All staff on payroll · ${staff.length} total`}
              </p>
            </div>
            {isMembers && memberFilter !== 'all' && (
              <button
                onClick={() => setMemberFilter('all')}
                className="px-4 py-2.5 bg-surface hover:bg-surface-2 border border-line transition rounded-2xl text-sm font-semibold text-ink"
              >
                Show all members
              </button>
            )}
          </div>

          <div className="bg-surface rounded-4xl lift overflow-hidden">
            {isMembers ? (
              <StudentTable
                students={visibleStudents}
                onEdit={(s) => setEditing(s)}
                onOpenPayments={(s) => setDrawerStudent(s)}
                onDelete={async (s) => {
                  if (confirm(`Remove ${s.name}?`)) { await window.api.students.remove(s.id); refresh() }
                }}
              />
            ) : (
              <StaffTable
                staff={staff}
                paymentsThisMonth={staffPayThisMonth}
                onEdit={(s) => setEditingStaff(s)}
                onOpenLedger={(s) => setDrawerStaff(s)}
                onDelete={async (s) => {
                  if (confirm(`Remove ${s.name}?`)) { await window.api.staff.remove(s.id); refresh() }
                }}
              />
            )}
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

      {editingStaff !== null && (
        <StaffDialog
          staff={editingStaff === 'new' ? null : editingStaff}
          onClose={() => setEditingStaff(null)}
          onSaved={() => { setEditingStaff(null); refresh() }}
        />
      )}

      {drawerStudent && (
        <PaymentDrawer
          student={drawerStudent}
          onClose={() => { setDrawerStudent(null); refresh() }}
        />
      )}

      {drawerStaff && (
        <StaffPaymentDrawer
          staff={drawerStaff}
          onClose={() => { setDrawerStaff(null); refresh() }}
        />
      )}

      <UpdateToast />
    </div>
  )
}
