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
      <div className="flex-1 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="paper-rise w-full max-w-md bg-paper border-l border-ink shadow-deep flex flex-col">
        {/* HEADER — like a ledger heading */}
        <div className="border-b-4 border-double border-ink p-6">
          <div className="flex items-center justify-between mono text-[10px] tracking-widest2 uppercase text-ink-soft pb-3 border-b border-rule">
            <span>Member's account</span>
            <button onClick={onClose} className="border border-rule hover:border-ink p-1.5 text-ink-soft hover:text-ink transition">
              <X size={12} />
            </button>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <StudentAvatar student={student} size={64} />
            <div>
              <h3 className="serif text-2xl leading-none tracking-tight">{student.name}</h3>
              <p className="annotation text-sm mt-1">
                — folio <span className="mono">{String(student.sr_no).padStart(3, '0')}</span> · {student.contact || 'no telephone'}
              </p>
            </div>
          </div>

          {/* Summary row */}
          <div className="mt-5 pt-4 border-t border-rule grid grid-cols-3 gap-3">
            <Stat label="Total paid" value={`₨ ${totalPaid.toLocaleString()}`} accent="text-olive" />
            <Stat label="Next due" value={student.next_fees_date ?? '—'} mono />
            <Stat label="Entries" value={String(payments.length).padStart(2, '0')} />
          </div>
        </div>

        {/* BODY — receipts */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="group w-full flex items-center justify-between px-5 py-4 bg-ink text-paper hover:bg-oxblood transition"
            >
              <span className="serif text-xl tracking-tight">Record a <span className="serif-italic">payment</span></span>
              <Plus size={18} className="group-hover:rotate-90 transition" />
            </button>
          )}

          {showForm && (
            <div className="bg-paper-2 border border-ink p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <p className="mono text-[10px] tracking-widest2 uppercase text-oxblood flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-oxblood ink-pulse rounded-full" />
                  Receipt in progress
                </p>
                <button onClick={() => setShowForm(false)} className="annotation text-xs hover:text-ink">cancel</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Amount (₨)">
                  <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} className={drawerInput} />
                </DrawerField>
                <DrawerField label="Date">
                  <input type="date" value={form.paid_on} onChange={(e) => setForm({ ...form, paid_on: e.target.value })} className={drawerInput} />
                </DrawerField>
              </div>
              <DrawerField label="Tendered via">
                <input value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} placeholder="Cash · Meezan Bank · UBL" className={drawerInput} />
              </DrawerField>
              <DrawerField label="Note">
                <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={drawerInput} />
              </DrawerField>
              <button onClick={submit} className="w-full bg-olive text-paper hover:bg-ink transition py-3 mono text-[10px] tracking-widest2 uppercase">
                Confirm receipt
              </button>
            </div>
          )}

          {payments.length === 0 && !showForm && (
            <div className="text-center py-16">
              <p className="serif text-2xl text-ink-faint">No receipts yet<span className="serif-italic">.</span></p>
              <p className="annotation text-xs mt-1">— all payments will be listed here</p>
            </div>
          )}

          {payments.length > 0 && !showForm && (
            <div className="rule-fancy my-6" />
          )}

          {payments.map((p, i) => (
            <div key={p.id} className="bg-paper border border-rule p-4 hover:border-ink transition relative">
              <div className="absolute top-2 right-3 mono text-[10px] tabular text-ink-faint">
                №{String(payments.length - i).padStart(3, '0')}
              </div>
              <p className="serif text-2xl tabular leading-none">
                <span className="serif-italic text-ink-faint text-lg">₨</span> {p.amount.toLocaleString()}
              </p>
              <p className="annotation text-xs mt-2">
                {new Date(p.paid_on).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} · received via <span className="not-italic font-medium text-ink-2">{p.method || 'unknown'}</span>
              </p>
              {p.note && <p className="serif-italic text-sm text-ink-soft mt-2 pt-2 border-t border-rule">"{p.note}"</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, accent, mono }: { label: string; value: string; accent?: string; mono?: boolean }) {
  return (
    <div>
      <p className="mono text-[9px] tracking-widest2 uppercase text-ink-soft">{label}</p>
      <p className={`${mono ? 'mono text-xs' : 'serif text-lg'} ${accent ?? 'text-ink'} tabular leading-tight mt-1`}>{value}</p>
    </div>
  )
}

function DrawerField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mono text-[10px] tracking-widest2 uppercase text-ink-soft">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

const drawerInput = "w-full bg-paper border-0 border-b border-rule-strong focus:border-ink outline-none px-0 py-2 text-ink text-sm mono transition"
