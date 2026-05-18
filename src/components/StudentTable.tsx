import type { Student } from '../types'
import { Pencil, Trash2, Wallet, UserPlus } from 'lucide-react'
import { StudentAvatar } from './StudentAvatar'

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
      <div className="p-20 text-center">
        <div className="inline-flex flex-col items-center gap-4 text-zinc-600">
          <div className="w-14 h-14 border border-line flex items-center justify-center">
            <UserPlus size={20} />
          </div>
          <div>
            <p className="display text-2xl text-zinc-400 tracking-wider">NO MEMBERS YET</p>
            <p className="mono text-[10px] tracking-widest2 uppercase mt-2">click "add member" to get started</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line">
            <Th>sr</Th>
            <Th>member</Th>
            <Th>contact</Th>
            <Th>time</Th>
            <Th align="right">fees</Th>
            <Th>next due</Th>
            <Th>tier</Th>
            <Th>paid via</Th>
            <Th align="right">remaining</Th>
            <Th align="right"> </Th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => {
            const overdue = s.next_fees_date && s.next_fees_date < today
            return (
              <tr
                key={s.id}
                className={`group border-b border-line/60 last:border-0 hover:bg-ink-2/60 transition relative ${overdue ? 'bg-crimson/[0.04]' : ''}`}
              >
                {overdue && <td className="absolute left-0 top-0 bottom-0 w-[2px] bg-crimson p-0" />}
                <td className="px-6 py-4 mono text-xs text-zinc-500 tabular">
                  {String(s.sr_no).padStart(3, '0')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={overdue ? 'ring-2 ring-crimson rounded-full' : ''}>
                      <StudentAvatar student={s} size={36} />
                    </div>
                    <div>
                      <p className="font-semibold text-white uppercase tracking-wide text-[13px]">{s.name}</p>
                      <p className="mono text-[10px] tracking-wider text-zinc-600 uppercase">
                        member · {String(i + 1).padStart(3, '0')}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 mono text-xs text-zinc-400">{s.contact || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`mono text-[10px] uppercase tracking-widest2 px-2 py-1 ${
                    s.time_table === 'Morning'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                  }`}>
                    {s.time_table === 'Morning' ? '◐ am' : '◑ pm'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right mono tabular text-zinc-300">
                  {s.fees.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`mono text-xs tabular ${overdue ? 'text-crimson font-bold' : 'text-zinc-500'}`}>
                    {s.next_fees_date || '—'}
                    {overdue && <span className="ml-2 inline-block w-1.5 h-1.5 bg-crimson rec-dot rounded-full align-middle" />}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="mono text-[10px] uppercase tracking-widest2 text-zinc-400">
                    {s.membership}
                  </span>
                </td>
                <td className="px-6 py-4 mono text-xs text-zinc-500">{s.paid_through || '—'}</td>
                <td className="px-6 py-4 text-right">
                  {s.remaining > 0 ? (
                    <span className="mono tabular text-crimson font-bold">{s.remaining.toLocaleString()}</span>
                  ) : (
                    <span className="mono tabular text-zinc-700">0</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-30 group-hover:opacity-100 transition">
                    <IconBtn onClick={() => onOpenPayments(s)} color="emerald" title="payments"><Wallet size={14} /></IconBtn>
                    <IconBtn onClick={() => onEdit(s)} color="blue" title="edit"><Pencil size={14} /></IconBtn>
                    <IconBtn onClick={() => onDelete(s)} color="crimson" title="delete"><Trash2 size={14} /></IconBtn>
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

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th className={`px-6 py-3 mono text-[10px] tracking-widest2 uppercase text-zinc-500 font-medium ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}

function IconBtn({ children, onClick, color, title }: { children: React.ReactNode; onClick: () => void; color: string; title: string }) {
  const cls = {
    emerald: 'hover:bg-emerald-500/10 hover:text-emerald-400',
    blue: 'hover:bg-blue-500/10 hover:text-blue-400',
    crimson: 'hover:bg-crimson/10 hover:text-crimson',
  }[color]
  return (
    <button onClick={onClick} title={title} className={`p-2 text-zinc-500 transition ${cls}`}>
      {children}
    </button>
  )
}
