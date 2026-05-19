import { Users, AlertTriangle, TrendingUp, ArrowUpRight, Wallet } from 'lucide-react'
import type { DashStats } from '../types'

export function Dashboard({ stats }: { stats: DashStats; totalMembers?: number }) {
  const net = stats.revenue - stats.staffPaid
  return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="display-md text-[2.5rem]">Today.</h2>
          <p className="text-sm text-muted mt-1">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-muted font-semibold">Net cashflow · month</p>
          <p className={`display-sm text-2xl tabular mt-1 ${net >= 0 ? 'text-moss' : 'text-coral'}`}>
            {net >= 0 ? '+' : '−'} PKR {Math.abs(net).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          label="Fees in"
          value={stats.revenue}
          icon={TrendingUp}
          accent="azure"
          delay="pop-3"
          sub="received this month"
          isCurrency
        />
        <StatCard
          label="Staff paid"
          value={stats.staffPaid}
          icon={Wallet}
          accent="plum"
          delay="pop-4"
          sub="payroll this month"
          isCurrency
        />
      </div>
    </section>
  )
}

function StatCard({ label, value, icon: Icon, accent, delay, sub, isCurrency }: {
  label: string; value: number; icon: any; accent: 'lime' | 'coral' | 'azure' | 'moss' | 'plum'; delay: string; sub: string; isCurrency?: boolean
}) {
  const accentMap: Record<string, { iconBg: string; iconColor: string; ring: string }> = {
    lime:   { iconBg: 'bg-ink',   iconColor: 'text-lime',  ring: 'from-lime/30' },
    coral:  { iconBg: 'bg-coral', iconColor: 'text-white', ring: 'from-coral/15' },
    azure:  { iconBg: 'bg-azure', iconColor: 'text-white', ring: 'from-azure/15' },
    moss:   { iconBg: 'bg-moss',  iconColor: 'text-white', ring: 'from-moss/15' },
    plum:   { iconBg: 'bg-plum',  iconColor: 'text-white', ring: 'from-plum/15' },
  }
  const c = accentMap[accent]

  return (
    <div className={`stat-card pop ${delay} relative bg-surface rounded-4xl lift p-6 overflow-hidden`}>
      <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br ${c.ring} to-transparent blur-2xl`} />

      <div className="relative flex items-start justify-between mb-7">
        <div className={`w-10 h-10 ${c.iconBg} rounded-2xl flex items-center justify-center`}>
          <Icon size={16} className={c.iconColor} strokeWidth={2.2} />
        </div>
        <span className="text-[11px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1">
          {label}
          <ArrowUpRight size={11} className="opacity-40" />
        </span>
      </div>

      <p className="display text-5xl tabular leading-none">
        {isCurrency && <span className="text-lg text-muted align-top mr-1.5">PKR</span>}
        {isCurrency ? value.toLocaleString() : value.toString().padStart(2, '0')}
      </p>

      <p className="text-xs text-muted mt-4 pt-4 border-t border-line">
        {sub}
      </p>
    </div>
  )
}
