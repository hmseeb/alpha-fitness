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
    idle: { dot: 'bg-emerald-400', label: 'synced', text: 'text-emerald-400', spin: false },
    syncing: { dot: 'bg-blue-400 rec-dot', label: 'syncing', text: 'text-blue-400', spin: true },
    offline: { dot: 'bg-zinc-500', label: 'offline', text: 'text-zinc-500', spin: false },
    error: { dot: 'bg-amber-400 rec-dot', label: 'retry', text: 'text-amber-400', spin: false },
  }[s.status]

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => window.api.sync.now()}
        className="group flex items-center gap-2.5 px-3.5 py-2.5 border border-line hover:border-line-bright bg-ink-1 hover:bg-ink-2 transition"
        title={s.lastError ?? (s.lastSyncedAt ? `last synced ${new Date(s.lastSyncedAt).toLocaleTimeString()}` : 'sync now')}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        <span className={`mono text-[10px] tracking-widest2 uppercase ${cfg.text}`}>{cfg.label}</span>
        {s.pending > 0 && (
          <span className="mono text-[10px] text-zinc-500 border-l border-line pl-2 tabular">
            {String(s.pending).padStart(2, '0')}
          </span>
        )}
      </button>
      <button
        onClick={onSignOut}
        className="border border-line hover:border-crimson hover:text-crimson p-2.5 text-zinc-500 transition"
        title="sign out"
      >
        <LogOut size={14} />
      </button>
    </div>
  )
}
