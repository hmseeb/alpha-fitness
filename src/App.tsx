import { useEffect, useState, useCallback } from 'react'
import type { Student, DashStats } from './types'
import { Dashboard } from './components/Dashboard'
import { StudentTable } from './components/StudentTable'
import { StudentDialog } from './components/StudentDialog'
import { PaymentDrawer } from './components/PaymentDrawer'
import { Dumbbell, Plus, Download, Search } from 'lucide-react'
import { exportToExcel } from './lib/export'

export default function App() {
  const [students, setStudents] = useState<Student[]>([])
  const [stats, setStats] = useState<DashStats>({ active: 0, overdue: 0, revenue: 0 })
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Student | null | 'new'>(null)
  const [drawerStudent, setDrawerStudent] = useState<Student | null>(null)

  const refresh = useCallback(async () => {
    const [list, s] = await Promise.all([
      window.api.students.list(q || undefined),
      window.api.dashboard.stats(),
    ])
    setStudents(list)
    setStats(s)
  }, [q])

  useEffect(() => { refresh() }, [refresh])

  const onExport = async () => {
    const all = await window.api.students.list()
    const filePath = await window.api.dialog.saveExcel(`alpha-fitness-${new Date().toISOString().slice(0,10)}.xlsx`)
    if (!filePath) return
    const buf = exportToExcel(all)
    await window.api.files.writeBuffer(filePath, buf)
    alert('Exported ✓')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/15 p-2 rounded-xl backdrop-blur">
              <Dumbbell size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">ALPHA FITNESS JAMPUR</h1>
              <p className="text-red-100 text-xs uppercase tracking-widest">Member Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onExport}
              className="bg-white/15 hover:bg-white/25 transition px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 backdrop-blur"
            >
              <Download size={16} /> Export
            </button>
            <button
              onClick={() => setEditing('new')}
              className="bg-white text-red-700 hover:bg-red-50 transition px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow"
            >
              <Plus size={16} /> Add Student
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <Dashboard stats={stats} />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Students</h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search by name or contact..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              />
            </div>
          </div>
          <StudentTable
            students={students}
            onEdit={(s) => setEditing(s)}
            onOpenPayments={(s) => setDrawerStudent(s)}
            onDelete={async (s) => {
              if (confirm(`Delete ${s.name}?`)) {
                await window.api.students.remove(s.id)
                refresh()
              }
            }}
          />
        </div>
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
