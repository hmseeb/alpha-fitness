import type { Staff, StaffPayment } from '../types'
import { Pencil, Trash2, Wallet, BadgePlus } from 'lucide-react'
import { StudentAvatar } from './StudentAvatar'

interface Props {
  staff: Staff[]
  paymentsThisMonth: Record<string, number>  // staffId -> amount paid this month
  onEdit: (s: Staff) => void
  onDelete: (s: Staff) => void
  onOpenLedger: (s: Staff) => void
}

export function StaffTable({ staff, paymentsThisMonth, onEdit, onDelete, onOpenLedger }: Props) {
  if (staff.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-lime/30 rounded-full flex items-center justify-center">
            <BadgePlus size={24} className="text-ink" />
          </div>
          <div>
            <p className="display-sm text-2xl">No staff yet</p>
            <p className="text-sm text-muted mt-1">Add trainers, cleaners, managers — anyone on payroll</p>
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
            <Th>Employee</Th>
            <Th>Role</Th>
            <Th>Contact</Th>
            <Th>CNIC</Th>
            <Th align="right">Salary</Th>
            <Th align="right">Paid this month</Th>
            <Th align="right">Balance</Th>
            <Th align="right"> </Th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s) => {
            const paid = paymentsThisMonth[s.id] ?? 0
            const balance = s.monthly_salary - paid
            return (
              <tr key={s.id} className="group border-b border-line/70 last:border-0 hover:bg-canvas/60 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <StudentAvatar student={{ ...s, photo_path: s.photo_path, photo_remote_path: s.photo_remote_path } as any} size={44} />
                    <div>
                      <p className="font-semibold text-ink text-[15px] leading-tight">{s.name}</p>
                      <p className="text-xs text-soft mt-0.5">joined {s.joined_date ?? '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-azure/10 text-azure rounded-full text-xs font-medium">
                    {s.role || 'staff'}
                  </span>
                </td>
                <td className="px-6 py-4 mono text-sm text-muted">{s.contact || '—'}</td>
                <td className="px-6 py-4 mono text-xs text-muted">{s.cnic || '—'}</td>
                <td className="px-6 py-4 text-right mono tabular text-ink font-medium">
                  {s.monthly_salary.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right mono tabular text-moss font-semibold">
                  {paid.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {balance > 0 ? (
                    <span className="mono tabular text-coral font-semibold">{balance.toLocaleString()} owed</span>
                  ) : balance < 0 ? (
                    <span className="mono tabular text-azure font-semibold">{Math.abs(balance).toLocaleString()} advance</span>
                  ) : (
                    <span className="text-soft text-sm">settled</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                    <IconBtn onClick={() => onOpenLedger(s)} title="Ledger" tint="moss"><Wallet size={14} /></IconBtn>
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

export type { StaffPayment }
