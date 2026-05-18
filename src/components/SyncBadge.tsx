import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import type { SyncStatus } from '../types'

export function SyncBadge({ onSignOut }: { onSignOut: () => void }) {
  const [s, setS] = useState<SyncStatus>({ status: 'idle', pending: 0, lastSyncedAt: null, lastError: null })

  useEffect(() => {
    const off = window.api.sync.onStatus(setS)
    window.api.sync.status().then((r) => setS((x) => ({ ...x, ...r })))
    return off
  }, [])

  const cfg = {
    idle: { dot: 'bg-olive', label: 'In good order', color: 'text-olive' },
    syncing: { dot: 'bg-teal ink-pulse', label: 'Synchronising', color: 'text-teal' },
    offline: { dot: 'bg-ink-faint', label: 'Off the wire', color: 'text-ink-soft' },
    error: { dot: 'bg-oxblood ink-pulse', label: 'Awaiting retry', color: 'text-oxblood' },
  }[s.status]

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => window.api.sync.now()}
        className="flex items-center gap-2.5 px-3.5 py-2.5 border border-rule hover:border-ink bg-paper hover:bg-paper-2 transition"
        title={s.lastError ?? (s.lastSyncedAt ? `Last synchronised ${new Date(s.lastSyncedAt).toLocaleTimeString()}` : 'Synchronise')}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        <span className={`mono text-[10px] tracking-widest2 uppercase ${cfg.color}`}>{cfg.label}</span>
        {s.pending > 0 && (
          <span className="mono text-[10px] text-ink-soft border-l border-rule pl-2 tabular">
            {String(s.pending).padStart(2, '0')}
          </span>
        )}
      </button>
      <button
        onClick={onSignOut}
        className="border border-rule hover:border-oxblood hover:text-oxblood p-2.5 text-ink-soft transition"
        title="Sign out"
      >
        <LogOut size={14} />
      </button>
    </div>
  )
}
