import { useEffect, useState } from 'react'
import type { Student, Payment } from '../types'
import { X, Plus } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="grain w-full max-w-md bg-ink-0 border-l border-line shadow-deep flex flex-col rise">
        {/* HEADER */}
        <div className="border-b border-line p-6 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />
          <div className="flex items-start justify-between mb-5">
            <p className="mono text-[10px] tracking-widest2 uppercase text-crimson">/ ledger</p>
            <button onClick={onClose} className="border border-line hover:border-crimson hover:text-crimson p-2 text-zinc-500 transition">
              <X size={14} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <StudentAvatar student={student} size={56} className="!rounded-none border-2 border-line" />
            <div>
              <h3 className="display text-2xl leading-none tracking-tight uppercase">{student.name}</h3>
              <p className="mono text-[10px] tracking-widest2 uppercase text-zinc-500 mt-2">
                sr {String(student.sr_no).padStart(3, '0')} · {student.contact || 'no contact'}
              </p>
            </div>
          </div>

          {/* Summary strip */}
          <div className="mt-5 pt-5 border-t border-line grid grid-cols-3 gap-4">
            <Stat label="total paid" value={`PKR ${totalPaid.toLocaleString()}`} accent="text-emerald-400" />
            <Stat label="next due" value={student.next_fees_date ?? '—'} accent="text-zinc-300" mono />
            <Stat label="entries" value={String(payments.length).padStart(2, '0')} accent="text-zinc-300" />
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="group w-full flex items-center justify-between px-5 py-4 bg-crimson hover:bg-crimson-glow transition shadow-glow"
            >
              <span className="mono text-[10px] tracking-widest2 uppercase font-bold">+ record payment</span>
              <Plus size={16} className="group-hover:rotate-90 transition" />
            </button>
          )}

          {showForm && (
            <div className="bg-ink-1 border border-crimson/30 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <p className="mono text-[10px] tracking-widest2 uppercase text-crimson flex items-center gap-2">
                  <span className="w-1 h-1 bg-crimson rec-dot" /> recording
                </p>
                <button onClick={() => setShowForm(false)} className="mono text-[10px] uppercase tracking-widest2 text-zinc-500 hover:text-white transition">
                  cancel
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DrawerField label="amount">
                  <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} className={drawerInput} />
                </DrawerField>
                <DrawerField label="date">
                  <input type="date" value={form.paid_on} onChange={(e) => setForm({ ...form, paid_on: e.target.value })} className={drawerInput} />
                </DrawerField>
              </div>
              <DrawerField label="method">
                <input value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} placeholder="cash / meezan bank" className={drawerInput} />
              </DrawerField>
              <DrawerField label="note">
                <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={drawerInput} />
              </DrawerField>
              <button onClick={submit} className="w-full bg-emerald-500 hover:bg-emerald-400 text-ink-0 transition py-3 mono text-[10px] tracking-widest2 uppercase font-bold">
                confirm payment
              </button>
            </div>
          )}

          {payments.length === 0 && !showForm && (
            <div className="text-center py-16">
              <p className="display text-xl text-zinc-700 tracking-wider">NO PAYMENTS</p>
              <p className="mono text-[10px] tracking-widest2 uppercase text-zinc-600 mt-2">all transactions appear here</p>
            </div>
          )}

          {payments.length > 0 && !showForm && (
            <p className="mono text-[10px] tracking-widest2 uppercase text-zinc-600 pt-4 pb-2 border-b border-line">
              / history · {payments.length} entries
            </p>
          )}

          {payments.map((p, i) => (
            <div key={p.id} className="group bg-ink-1 border border-line hover:border-line-bright transition p-4 flex items-center justify-between">
              <div>
                <p className="display text-2xl tabular leading-none">
                  PKR <span className="text-emerald-400">{p.amount.toLocaleString()}</span>
                </p>
                <p className="mono text-[10px] tracking-widest2 uppercase text-zinc-500 mt-2">
                  {p.paid_on} · {p.method || 'unknown'}
                </p>
                {p.note && <p className="mono text-[10px] text-zinc-600 mt-1">{p.note}</p>}
              </div>
              <span className="mono text-[10px] text-zinc-700 tabular">
                #{String(payments.length - i).padStart(3, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, accent, mono }: { label: string; value: string; accent: string; mono?: boolean }) {
  return (
    <div>
      <p className="mono text-[9px] tracking-widest2 uppercase text-zinc-600">{label}</p>
      <p className={`${mono ? 'mono text-xs' : 'display text-lg'} ${accent} tabular leading-tight mt-1`}>{value}</p>
    </div>
  )
}

function DrawerField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mono text-[10px] tracking-widest2 uppercase text-zinc-500">/ {label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

const drawerInput = "w-full bg-ink-2 border border-line focus:border-crimson outline-none px-3 py-2 text-white text-sm mono transition"
