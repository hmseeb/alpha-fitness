import { useEffect, useState } from 'react'
import type { Student, Payment } from '../types'
import { X, Plus, Banknote } from 'lucide-react'

export function PaymentDrawer({ student, onClose }: { student: Student; onClose: () => void }) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ amount: student.fees, paid_on: new Date().toISOString().slice(0, 10), method: student.paid_through || 'Cash', note: '' })

  const refresh = async () => setPayments(await window.api.payments.list(student.id))

  useEffect(() => { refresh() }, [student.id])

  const submit = async () => {
    if (!form.amount || !form.paid_on) return
    await window.api.payments.create({ student_id: student.id, ...form })
    setShowForm(false)
    setForm({ ...form, note: '' })
    refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{student.name}</h3>
            <p className="text-xs text-slate-500">Payment history</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-3">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow"
            >
              <Plus size={18} /> Record Payment
            </button>
          )}

          {showForm && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Amount</span>
                  <input type="number" className={input} value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Date</span>
                  <input type="date" className={input} value={form.paid_on} onChange={(e) => setForm({ ...form, paid_on: e.target.value })} />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-semibold text-slate-600 uppercase">Method</span>
                <input className={input} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} placeholder="Cash / Meezan Bank" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-600 uppercase">Note</span>
                <input className={input} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </label>
              <div className="flex gap-2 justify-end pt-1">
                <button onClick={() => setShowForm(false)} className="px-3 py-2 text-sm rounded-lg hover:bg-white text-slate-700">Cancel</button>
                <button onClick={submit} className="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Save</button>
              </div>
            </div>
          )}

          {payments.length === 0 && !showForm && (
            <div className="text-center py-10 text-slate-400">
              <Banknote size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No payments yet</p>
            </div>
          )}

          {payments.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:shadow-sm transition">
              <div>
                <p className="font-bold text-slate-800">PKR {p.amount.toLocaleString()}</p>
                <p className="text-xs text-slate-500">{p.paid_on} • {p.method || '—'}</p>
                {p.note && <p className="text-xs text-slate-400 mt-1">{p.note}</p>}
              </div>
              <div className="text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                <Banknote size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const input = "w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
