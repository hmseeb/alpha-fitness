import type { Student } from '../types'
import { Pencil, Trash2, Wallet, User } from 'lucide-react'

interface Props {
  students: Student[]
  onEdit: (s: Student) => void
  onDelete: (s: Student) => void
  onOpenPayments: (s: Student) => void
}

export function StudentTable({ students, onEdit, onDelete, onOpenPayments }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  if (students.length === 0) {
    return (
      <div className="p-16 text-center text-slate-400">
        <User size={42} className="mx-auto mb-3 opacity-40" />
        <p className="font-medium">No students yet</p>
        <p className="text-sm">Click "Add Student" to get started</p>
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
            <th className="px-4 py-3 text-left font-semibold">SR</th>
            <th className="px-4 py-3 text-left font-semibold">Photo</th>
            <th className="px-4 py-3 text-left font-semibold">Name</th>
            <th className="px-4 py-3 text-left font-semibold">Contact</th>
            <th className="px-4 py-3 text-left font-semibold">Time</th>
            <th className="px-4 py-3 text-right font-semibold">Fees</th>
            <th className="px-4 py-3 text-left font-semibold">Next Due</th>
            <th className="px-4 py-3 text-left font-semibold">Membership</th>
            <th className="px-4 py-3 text-left font-semibold">Paid Via</th>
            <th className="px-4 py-3 text-right font-semibold">Remaining</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => {
            const overdue = s.next_fees_date && s.next_fees_date < today
            return (
              <tr
                key={s.id}
                className={`border-t border-slate-100 hover:bg-slate-50/60 transition ${overdue ? 'bg-red-50/40' : ''}`}
              >
                <td className="px-4 py-3 font-mono text-slate-500">{s.sr_no}</td>
                <td className="px-4 py-3">
                  {s.photo_path ? (
                    <img src={`file://${s.photo_path}`} alt={s.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User size={18} />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.contact}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${s.time_table === 'Morning' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
                    {s.time_table}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">{s.fees.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-sm ${overdue ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                    {s.next_fees_date || '—'}
                    {overdue && ' ⚠'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{s.membership}</td>
                <td className="px-4 py-3 text-slate-600">{s.paid_through || '—'}</td>
                <td className="px-4 py-3 text-right">
                  {s.remaining > 0 ? (
                    <span className="text-red-600 font-semibold">{s.remaining.toLocaleString()}</span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onOpenPayments(s)}
                      className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-700"
                      title="Payments"
                    >
                      <Wallet size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(s)}
                      className="p-2 rounded-lg hover:bg-blue-100 text-blue-700"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(s)}
                      className="p-2 rounded-lg hover:bg-red-100 text-red-700"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
