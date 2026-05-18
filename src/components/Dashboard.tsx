import type { DashStats } from '../types'

export function Dashboard({ stats }: { stats: DashStats }) {
  const cards = [
    {
      ordinal: 'I',
      label: 'Active members',
      sub: 'currently enrolled',
      value: stats.active.toString().padStart(2, '0'),
      footnote: 'inclusive of all tiers',
      delay: 'ink-1',
      accent: 'text-ink',
    },
    {
      ordinal: 'II',
      label: 'In arrears',
      sub: stats.overdue > 0 ? 'requires attention' : 'none — well in hand',
      value: stats.overdue.toString().padStart(2, '0'),
      footnote: 'fees overdue past next-due date',
      delay: 'ink-2',
      accent: stats.overdue > 0 ? 'text-oxblood' : 'text-olive',
    },
    {
      ordinal: 'III',
      label: 'Receipts this month',
      sub: 'as on today',
      value: `₨ ${stats.revenue.toLocaleString()}`,
      footnote: 'sum of recorded payments',
      delay: 'ink-3',
      accent: 'text-ink',
    },
  ]

  return (
    <section>
      <div className="flex items-end justify-between mb-6 pb-3 border-b border-ink">
        <div className="flex items-baseline gap-4">
          <p className="mono text-[10px] tracking-widest2 uppercase text-ink-soft">§ 01</p>
          <h2 className="serif text-4xl tracking-tight">
            The <span className="serif-italic">snapshot.</span>
          </h2>
          <p className="annotation text-sm">— a summary of present standing</p>
        </div>
        <p className="annotation text-xs">
          Recorded {new Date().toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-r border-rule">
        {cards.map((c, i) => (
          <div
            key={c.ordinal}
            className={`ink-in ${c.delay} relative px-8 py-10 ${i < cards.length - 1 ? 'border-r border-rule' : ''}`}
          >
            <div className="flex items-start justify-between mb-8">
              <span className="serif-italic text-2xl text-ink-faint">{c.ordinal}.</span>
              <span className="mono text-[10px] tracking-widest2 uppercase text-ink-soft">
                {c.label}
              </span>
            </div>
            <p className={`serif text-7xl tabular leading-none tracking-tight ${c.accent}`}>
              {c.value}
            </p>
            <div className="mt-6 pt-4 border-t border-rule">
              <p className="serif-italic text-sm text-ink-soft">{c.sub}</p>
              <p className="annotation text-[11px] mt-1">— {c.footnote}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
