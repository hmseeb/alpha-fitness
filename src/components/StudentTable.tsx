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
      <div className="py-20 text-center border border-rule bg-paper-2">
        <div className="inline-flex flex-col items-center gap-3 text-ink-soft">
          <div className="w-14 h-14 border border-rule-strong flex items-center justify-center">
            <UserPlus size={20} />
          </div>
          <p className="serif text-2xl">The register is <span className="serif-italic">empty.</span></p>
          <p className="annotation text-sm">— click "New member" to make the first entry.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-ink">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-double border-ink bg-paper-2">
            <Th>№</Th>
            <Th>Member</Th>
            <Th>Telephone</Th>
            <Th>Hour</Th>
            <Th align="right">Fee</Th>
            <Th>Next due</Th>
            <Th>Standing</Th>
            <Th>Paid via</Th>
            <Th align="right">Outstanding</Th>
            <Th align="right"> </Th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => {
            const overdue = s.next_fees_date && s.next_fees_date < today
            return (
              <tr
                key={s.id}
                className={`group border-b border-rule last:border-0 hover:bg-paper-2/60 transition relative ${overdue ? 'bg-oxblood/[0.04]' : ''}`}
              >
                <td className="px-6 py-4 mono text-xs tabular text-ink-soft relative">
                  {overdue && <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-oxblood" />}
                  {String(s.sr_no).padStart(3, '0')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <StudentAvatar student={s} size={42} className={overdue ? '!border-oxblood' : ''} />
                    <div>
                      <p className="serif text-lg leading-tight">{s.name}</p>
                      <p className="annotation text-[11px]">— enrolled {s.entry_date ?? 'recently'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 mono text-xs text-ink-soft">{s.contact || '—'}</td>
                <td className="px-6 py-4">
                  <span className="stamp text-mustard">
                    {s.time_table}
                  </span>
                </td>
                <td className="px-6 py-4 text-right mono tabular text-ink">
                  <span className="serif-italic text-ink-faint">₨</span> {s.fees.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`mono text-xs tabular ${overdue ? 'text-oxblood font-medium' : 'text-ink-soft'}`}>
                    {s.next_fees_date || '—'}
                    {overdue && <span className="ml-2 serif-italic text-[11px]">overdue</span>}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="serif-italic text-sm text-ink-2">{s.membership}</span>
                </td>
                <td className="px-6 py-4 serif-body text-sm text-ink-soft">{s.paid_through || '—'}</td>
                <td className="px-6 py-4 text-right">
                  {s.remaining > 0 ? (
                    <span className="mono tabular text-oxblood font-medium">
                      ₨ {s.remaining.toLocaleString()}
                    </span>
                  ) : (
                    <span className="serif-italic text-ink-faint text-sm">nil</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-20 group-hover:opacity-100 transition">
                    <IconBtn onClick={() => onOpenPayments(s)} title="Payments" hover="hover:bg-olive hover:text-paper"><Wallet size={13} /></IconBtn>
                    <IconBtn onClick={() => onEdit(s)} title="Edit" hover="hover:bg-teal hover:text-paper"><Pencil size={13} /></IconBtn>
                    <IconBtn onClick={() => onDelete(s)} title="Remove" hover="hover:bg-oxblood hover:text-paper"><Trash2 size={13} /></IconBtn>
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
    <th className={`px-6 py-4 mono text-[10px] tracking-widest2 uppercase text-ink-soft font-medium ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}

function IconBtn({ children, onClick, title, hover }: { children: React.ReactNode; onClick: () => void; title: string; hover: string }) {
  return (
    <button onClick={onClick} title={title} className={`p-2 text-ink-soft border border-transparent transition ${hover}`}>
      {children}
    </button>
  )
}
