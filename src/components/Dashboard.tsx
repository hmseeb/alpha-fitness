import { Users, AlertTriangle, Banknote } from 'lucide-react'
import type { DashStats } from '../types'

export function Dashboard({ stats }: { stats: DashStats }) {
  const cards = [
    { label: 'Active Members', value: stats.active, icon: Users, accent: 'from-blue-500 to-blue-600' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, accent: 'from-amber-500 to-orange-600' },
    { label: 'This Month', value: `PKR ${stats.revenue.toLocaleString()}`, icon: Banknote, accent: 'from-emerald-500 to-emerald-600' },
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <div key={c.label} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{c.label}</p>
              <p className="text-3xl font-extrabold text-slate-800 mt-1">{c.value}</p>
            </div>
            <div className={`bg-gradient-to-br ${c.accent} p-3 rounded-xl text-white shadow`}>
              <Icon size={22} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
