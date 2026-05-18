import { Users, AlertTriangle, TrendingUp, ArrowUpRight } from 'lucide-react'
import type { DashStats } from '../types'

export function Dashboard({ stats }: { stats: DashStats; totalMembers?: number }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="display-md text-[2.5rem]">Today.</h2>
          <p className="text-sm text-muted mt-1">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Active members"
          value={stats.active}
          icon={Users}
          accent="lime"
          delay="pop-1"
          sub="enrolled & training"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon={AlertTriangle}
          accent={stats.overdue > 0 ? 'coral' : 'moss'}
          delay="pop-2"
          sub={stats.overdue > 0 ? 'fees past due' : 'all caught up'}
        />
        <StatCard
          label="This month"
          value={stats.revenue}
          icon={TrendingUp}
          accent="azure"
          delay="pop-3"
          sub="received in fees"
          isCurrency
        />
      </div>
    </section>
  )
}

function StatCard({ label, value, icon: Icon, accent, delay, sub, isCurrency }: {
  label: string; value: number; icon: any; accent: 'lime' | 'coral' | 'azure' | 'moss'; delay: string; sub: string; isCurrency?: boolean
}) {
  const accentMap: Record<string, { chip: string; iconBg: string; iconColor: string; ring: string }> = {
    lime:   { chip: 'bg-lime',   iconBg: 'bg-ink',   iconColor: 'text-lime',  ring: 'from-lime/30' },
    coral:  { chip: 'bg-coral/15 text-coral',  iconBg: 'bg-coral',  iconColor: 'text-white', ring: 'from-coral/15' },
    azure:  { chip: 'bg-azure/15 text-azure',  iconBg: 'bg-azure',  iconColor: 'text-white', ring: 'from-azure/15' },
    moss:   { chip: 'bg-moss/15 text-moss',   iconBg: 'bg-moss',   iconColor: 'text-white', ring: 'from-moss/15' },
  }
  const c = accentMap[accent]

  return (
    <div className={`stat-card pop ${delay} relative bg-surface rounded-4xl lift p-7 overflow-hidden`}>
      <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br ${c.ring} to-transparent blur-2xl`} />

      <div className="relative flex items-start justify-between mb-9">
        <div className={`w-11 h-11 ${c.iconBg} rounded-2xl flex items-center justify-center`}>
          <Icon size={18} className={c.iconColor} strokeWidth={2.2} />
        </div>
        <span className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1">
          {label}
          <ArrowUpRight size={12} className="opacity-40" />
        </span>
      </div>

      <p className="display text-7xl tabular leading-none">
        {isCurrency && <span className="text-2xl text-muted align-top mr-1.5">PKR</span>}
        {isCurrency ? value.toLocaleString() : value.toString().padStart(2, '0')}
      </p>

      <p className="text-sm text-muted mt-5 pt-5 border-t border-line">
        {sub}
      </p>
    </div>
  )
}
