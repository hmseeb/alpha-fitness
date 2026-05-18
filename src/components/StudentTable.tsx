import type { Student } from '../types'
import { Pencil, Trash2, Wallet, UserPlus, Sun, Moon } from 'lucide-react'
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
      <div className="py-24 text-center">
        <div className="inline-flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-lime/30 rounded-full flex items-center justify-center">
            <UserPlus size={24} className="text-ink" />
          </div>
          <div>
            <p className="display-sm text-2xl">No members yet</p>
            <p className="text-sm text-muted mt-1">Tap "Add member" to start your roster</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-line">
            <Th>Member</Th>
            <Th>Contact</Th>
            <Th>Schedule</Th>
            <Th align="right">Fee</Th>
            <Th>Next due</Th>
            <Th>Tier</Th>
            <Th>Method</Th>
            <Th align="right">Remaining</Th>
            <Th align="right"> </Th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => {
            const overdue = s.next_fees_date && s.next_fees_date < today
            return (
              <tr
                key={s.id}
                className="group border-b border-line/70 last:border-0 hover:bg-canvas/60 transition"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <StudentAvatar student={s} size={44} />
                      {overdue && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-coral border-2 border-surface rounded-full" />}
                    </div>
                    <div>
                      <p className="font-semibold text-ink text-[15px] leading-tight">{s.name}</p>
                      <p className="text-xs text-soft mt-0.5 mono">#{String(s.sr_no).padStart(3, '0')}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 mono text-sm text-muted">{s.contact || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    s.time_table === 'Morning'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {s.time_table === 'Morning' ? <Sun size={11} /> : <Moon size={11} />}
                    {s.time_table}
                  </span>
                </td>
                <td className="px-6 py-4 text-right mono tabular text-ink font-medium">
                  {s.fees.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`mono text-xs tabular ${overdue ? 'text-coral font-semibold' : 'text-muted'}`}>
                    {s.next_fees_date || '—'}
                    {overdue && <span className="ml-1.5 inline-block w-1.5 h-1.5 bg-coral rounded-full align-middle" />}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-surface-2 text-ink-2 rounded-full text-xs font-medium">
                    {s.membership}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted">{s.paid_through || '—'}</td>
                <td className="px-6 py-4 text-right">
                  {s.remaining > 0 ? (
                    <span className="inline-flex items-center gap-1 mono tabular text-coral font-semibold">
                      {s.remaining.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-soft text-sm">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                    <IconBtn onClick={() => onOpenPayments(s)} title="Payments" tint="moss"><Wallet size={14} /></IconBtn>
                    <IconBtn onClick={() => onEdit(s)} title="Edit" tint="azure"><Pencil size={14} /></IconBtn>
                    <IconBtn onClick={() => onDelete(s)} title="Remove" tint="coral"><Trash2 size={14} /></IconBtn>
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
    <th className={`px-6 py-4 text-[11px] tracking-wider uppercase text-muted font-semibold ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}

function IconBtn({ children, onClick, title, tint }: { children: React.ReactNode; onClick: () => void; title: string; tint: 'moss' | 'azure' | 'coral' }) {
  const cls = {
    moss: 'hover:bg-moss/15 hover:text-moss',
    azure: 'hover:bg-azure/15 hover:text-azure',
    coral: 'hover:bg-coral/15 hover:text-coral',
  }[tint]
  return (
    <button onClick={onClick} title={title} className={`p-2 rounded-xl text-soft transition ${cls}`}>
      {children}
    </button>
  )
}
