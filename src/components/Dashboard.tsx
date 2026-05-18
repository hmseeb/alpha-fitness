import { Users, AlertTriangle, Banknote, ArrowUpRight } from 'lucide-react'
import type { DashStats } from '../types'

export function Dashboard({ stats }: { stats: DashStats }) {
  const cards = [
    {
      label: 'active members',
      value: stats.active.toString().padStart(2, '0'),
      icon: Users,
      tint: 'crimson',
      tag: 'roster',
      delay: 'rise-1',
    },
    {
      label: 'overdue',
      value: stats.overdue.toString().padStart(2, '0'),
      icon: AlertTriangle,
      tint: stats.overdue > 0 ? 'amber' : 'zinc',
      tag: 'follow up',
      delay: 'rise-2',
    },
    {
      label: 'this month',
      value: `PKR ${stats.revenue.toLocaleString()}`,
      icon: Banknote,
      tint: 'emerald',
      tag: 'revenue',
      delay: 'rise-3',
    },
  ]

  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="mono text-[10px] tracking-widest2 uppercase text-zinc-500">/ 01</p>
          <h2 className="display text-4xl tracking-tight leading-none mt-1">SNAPSHOT</h2>
        </div>
        <p className="mono text-[10px] tracking-widest2 uppercase text-zinc-600">
          {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {cards.map((c) => {
          const Icon = c.icon
          const accent = {
            crimson: 'text-crimson',
            amber: 'text-amber-400',
            emerald: 'text-emerald-400',
            zinc: 'text-zinc-400',
          }[c.tint]
          const bar = {
            crimson: 'bg-crimson',
            amber: 'bg-amber-400',
            emerald: 'bg-emerald-400',
            zinc: 'bg-zinc-700',
          }[c.tint]
          return (
            <div key={c.label} className={`rise ${c.delay} relative bg-ink-1 border border-line p-6 group hover:border-line-bright transition`}>
              <div className={`absolute top-0 left-0 right-0 h-px ${bar}`} />
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="mono text-[10px] tracking-widest2 uppercase text-zinc-500">
                    / {c.label}
                  </p>
                  <p className={`mono text-[10px] tracking-widest2 uppercase ${accent} mt-1 flex items-center gap-1`}>
                    <span className={`inline-block w-1 h-1 ${bar}`} /> {c.tag}
                  </p>
                </div>
                <div className={`${accent} opacity-40 group-hover:opacity-100 transition`}>
                  <Icon size={18} strokeWidth={1.5} />
                </div>
              </div>
              <p className="display text-7xl tabular leading-none tracking-tight">
                {c.value}
              </p>
              <div className="mt-4 pt-4 border-t border-line flex items-center justify-between mono text-[10px] tracking-widest2 uppercase text-zinc-600">
                <span>live count</span>
                <ArrowUpRight size={12} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
