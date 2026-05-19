import { useEffect, useState } from 'react'
import type { Student, Payment } from '../types'
import { X, Plus, CheckCircle2 } from 'lucide-react'
import { StudentAvatar } from './StudentAvatar'

export function PaymentDrawer({ student, onClose }: { student: Student; onClose: () => void }) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    amount: student.fees,
    paid_on: new Date().toISOString().slice(0, 10),
    method: student.paid_through || 'Cash',
    note: '',
  })

  const refresh = async () => setPayments(await window.api.payments.list(student.id))
  useEffect(() => { refresh() }, [student.id])

  const submit = async () => {
    if (!form.amount || !form.paid_on) return
    await window.api.payments.create({ student_id: student.id, ...form })
    setShowForm(false)
    setForm({ ...form, note: '' })
    refresh()
  }

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="fixed inset-0 z-[100] flex">
      <div className="flex-1 bg-ink/50 backdrop-blur-md" onClick={onClose} />
      <div
        className="slide-in w-full max-w-md flex flex-col border-l border-line"
        style={{ background: '#ffffff', boxShadow: '-30px 0 60px -20px rgba(10,10,10,0.25)' }}
      >
        {/* HEADER — also draggable strip at top */}
        <div className="app-drag h-7 w-full" />
        <div className="px-6 pt-2 pb-5 border-b border-line">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs uppercase tracking-widest text-muted font-semibold">Payments</p>
            <button onClick={onClose} className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-muted hover:text-ink transition">
              <X size={14} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <StudentAvatar student={student} size={56} />
            <div className="flex-1">
              <h3 className="display-sm text-xl leading-tight">{student.name}</h3>
              <p className="text-xs text-muted mt-1 mono">
                #{String(student.sr_no).padStart(3, '0')} · {student.contact || 'no contact'}
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <SummaryCard label="Total paid" value={`PKR ${totalPaid.toLocaleString()}`} accent="moss" />
            <SummaryCard label="Next due" value={student.next_fees_date ?? '—'} mono />
            <SummaryCard label="Entries" value={String(payments.length).padStart(2, '0')} />
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="group w-full flex items-center justify-between px-5 py-4 bg-lime text-ink hover:bg-lime-deep transition rounded-3xl font-bold glow-lime"
            >
              <span className="flex items-center gap-3">
                <span className="w-9 h-9 bg-ink text-lime rounded-2xl flex items-center justify-center">
                  <Plus size={16} />
                </span>
                Record payment
              </span>
              <span className="text-sm opacity-50 group-hover:opacity-100 transition">↵</span>
            </button>
          )}

          {showForm && (
            <div className="bg-canvas border border-line rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-line">
                <span className="w-2 h-2 bg-coral rounded-full" />
                <p className="text-xs uppercase tracking-widest text-coral font-semibold">Recording</p>
                <button onClick={() => setShowForm(false)} className="ml-auto text-xs text-muted hover:text-ink">cancel</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DrawerField label="Amount (PKR)">
                  <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} className={drawerInput} />
                </DrawerField>
                <DrawerField label="Date">
                  <input type="date" value={form.paid_on} onChange={(e) => setForm({ ...form, paid_on: e.target.value })} className={drawerInput} />
                </DrawerField>
              </div>
              <DrawerField label="Method">
                <input value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} placeholder="Cash · Meezan Bank · UBL" className={drawerInput} />
              </DrawerField>
              <DrawerField label="Note (optional)">
                <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={drawerInput} />
              </DrawerField>
              <button onClick={submit} className="w-full bg-ink text-lime hover:bg-ink-2 transition py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle2 size={16} /> Confirm
              </button>
            </div>
          )}

          {payments.length === 0 && !showForm && (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                💸
              </div>
              <p className="display-sm text-lg">No payments yet</p>
              <p className="text-sm text-muted mt-1">Record the first one above</p>
            </div>
          )}

          {payments.length > 0 && !showForm && (
            <p className="text-xs uppercase tracking-widest text-muted font-semibold pt-3 pb-1">
              History · {payments.length} entries
            </p>
          )}

          {payments.map((p, i) => (
            <div key={p.id} className="bg-canvas rounded-3xl p-4 flex items-center justify-between hover:bg-surface-2/60 transition group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-moss/15 text-moss rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="font-bold text-ink display-sm">
                    PKR <span className="tabular">{p.amount.toLocaleString()}</span>
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(p.paid_on).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {p.method || '—'}
                  </p>
                  {p.note && <p className="text-xs text-soft italic mt-1">"{p.note}"</p>}
                </div>
              </div>
              <span className="mono text-[10px] text-soft tabular">
                #{String(payments.length - i).padStart(3, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, accent, mono }: { label: string; value: string; accent?: string; mono?: boolean }) {
  const tint = accent === 'moss' ? 'text-moss' : 'text-ink'
  return (
    <div className="bg-canvas rounded-2xl p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">{label}</p>
      <p className={`${mono ? 'mono text-xs' : 'font-bold text-sm'} ${tint} mt-1 tabular`}>{value}</p>
    </div>
  )
}

function DrawerField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-muted block mb-1">{label}</span>
      {children}
    </label>
  )
}

const drawerInput = "w-full bg-surface border border-line focus:border-ink rounded-2xl px-3.5 py-2.5 text-sm outline-none transition placeholder-soft"
