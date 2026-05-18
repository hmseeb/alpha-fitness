import { useEffect, useState } from 'react'
import { LogOut, Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react'
import type { SyncStatus } from '../types'

export function SyncBadge({ onSignOut }: { onSignOut: () => void }) {
  const [s, setS] = useState<SyncStatus>({ status: 'idle', pending: 0, lastSyncedAt: null, lastError: null })

  useEffect(() => {
    const off = window.api.sync.onStatus(setS)
    window.api.sync.status().then((r) => setS((x) => ({ ...x, ...r })))
    return off
  }, [])

  const cfg = {
    idle:    { icon: Cloud,        cls: 'bg-moss/15 text-moss',    label: 'Synced' },
    syncing: { icon: RefreshCw,    cls: 'bg-azure/15 text-azure',  label: 'Syncing', spin: true },
    offline: { icon: CloudOff,     cls: 'bg-surface-2 text-muted', label: 'Offline' },
    error:   { icon: AlertCircle,  cls: 'bg-coral/15 text-coral',  label: 'Retry' },
  }[s.status] as any
  const Icon = cfg.icon

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => window.api.sync.now()}
        className={`flex items-center gap-2 px-3.5 py-3 ${cfg.cls} rounded-2xl text-xs font-semibold transition hover:opacity-80`}
        title={s.lastError ?? (s.lastSyncedAt ? `Last synced ${new Date(s.lastSyncedAt).toLocaleTimeString()}` : 'Sync now')}
      >
        <Icon size={14} className={cfg.spin ? 'animate-spin' : ''} />
        <span>{cfg.label}</span>
        {s.pending > 0 && (
          <span className="bg-surface/60 px-1.5 rounded-full mono text-[10px] tabular">
            {s.pending}
          </span>
        )}
      </button>
      <button
        onClick={onSignOut}
        className="p-3 rounded-2xl bg-surface hover:bg-surface-2 border border-line text-muted hover:text-ink transition"
        title="Sign out"
      >
        <LogOut size={14} />
      </button>
    </div>
  )
}
