import type { Student } from '../types'
import { Pencil, Trash2, Wallet, UserPlus, Sun, Moon } from 'lucide-react'
import { StudentAvatar } from './StudentAvatar'
import { WhatsAppLink, overdueMessage } from './WhatsAppLink'

interface Props {
  students: Student[]
  onEdit: (s: Student) => void
  onDelete: (s: Student) => void
  onOpenPayments: (s: Student) => void
}

export function StudentTable({ students, onEdit, onDelete, onOpenPayments }: Props) {
  const todayDate = new Date()
  const today = todayDate.toISOString().slice(0, 10)
  const soon = new Date(todayDate)
  soon.setDate(soon.getDate() + 3)
  const soonStr = soon.toISOString().slice(0, 10)
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
            <Th>Joined</Th>
            <Th>Next due</Th>
            <Th>Tier</Th>
            <Th>Method</Th>
            <Th align="right">Remaining</Th>
            <Th align="right"> </Th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, idx) => {
            const overdue = !!(s.next_fees_date && s.next_fees_date < today)
            const dueSoon = !overdue && !!(s.next_fees_date && s.next_fees_date <= soonStr)
            const rowNum = students.length - idx
            const rowBg = overdue ? 'bg-coral/[0.06] hover:bg-coral/[0.10]' : dueSoon ? 'bg-amber-400/[0.07] hover:bg-amber-400/[0.12]' : 'hover:bg-canvas/60'
            return (
              <tr
                key={s.id}
                className={`group border-b border-line/70 last:border-0 transition relative ${rowBg}`}
              >
                <td className="px-6 py-4 relative">
                  {overdue && <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-coral rounded-r" />}
                  {dueSoon && <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-amber-400 rounded-r" />}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <StudentAvatar student={s} size={44} />
                      {overdue && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-coral border-2 border-surface rounded-full" />}
                      {dueSoon && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 border-2 border-surface rounded-full" />}
                    </div>
                    <div>
                      <p className={`font-semibold text-[15px] leading-tight ${overdue ? 'text-coral' : 'text-ink'}`}>{s.name}</p>
                      <p className="text-xs text-soft mt-0.5 mono">#{String(rowNum).padStart(3, '0')}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 mono text-sm text-muted">
                  {s.contact ? (
                    <span className="inline-flex items-center gap-1.5">
                      {s.contact}
                      <WhatsAppLink
                        contact={s.contact}
                        message={overdue ? overdueMessage(s, daysAgo(s.next_fees_date!, today)) : undefined}
                      />
                    </span>
                  ) : '—'}
                </td>
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
                <td className="px-6 py-4 mono text-xs tabular text-muted">
                  {s.entry_date || '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={`mono text-xs tabular inline-flex items-center gap-1.5 ${
                    overdue ? 'text-coral font-semibold' : dueSoon ? 'text-amber-700 font-semibold' : 'text-muted'
                  }`}>
                    {s.next_fees_date || '—'}
                    {overdue && <span className="w-1.5 h-1.5 bg-coral rounded-full" />}
                    {dueSoon && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                  </span>
                  {overdue && (
                    <p className="text-[10px] uppercase tracking-wider text-coral font-bold mt-0.5">
                      {daysAgo(s.next_fees_date!, today)} days late
                    </p>
                  )}
                  {dueSoon && (
                    <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mt-0.5">
                      {soonLabel(daysFrom(today, s.next_fees_date!))}
                    </p>
                  )}
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

function daysAgo(date: string, today: string): number {
  const a = new Date(date).getTime()
  const b = new Date(today).getTime()
  return Math.round((b - a) / 86400000)
}
function daysFrom(today: string, date: string): number {
  return daysAgo(today, date) * -1
}
function soonLabel(days: number): string {
  if (days <= 0) return 'due today'
  if (days === 1) return 'due tomorrow'
  return `due in ${days} days`
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
