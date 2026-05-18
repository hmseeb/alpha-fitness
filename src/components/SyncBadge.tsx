import { useEffect, useState } from 'react'
import { Cloud, CloudOff, RefreshCw, AlertCircle, LogOut } from 'lucide-react'
import type { SyncStatus } from '../types'

export function SyncBadge({ onSignOut }: { onSignOut: () => void }) {
  const [s, setS] = useState<SyncStatus>({ status: 'idle', pending: 0, lastSyncedAt: null, lastError: null })

  useEffect(() => {
    const off = window.api.sync.onStatus(setS)
    window.api.sync.status().then((r) => setS((x) => ({ ...x, ...r })))
    return off
  }, [])

  const cfg = {
    idle: { icon: Cloud, color: 'bg-emerald-100 text-emerald-700', label: 'Synced' },
    syncing: { icon: RefreshCw, color: 'bg-blue-100 text-blue-700', label: 'Syncing…', spin: true },
    offline: { icon: CloudOff, color: 'bg-slate-200 text-slate-600', label: 'Offline' },
    error: { icon: AlertCircle, color: 'bg-amber-100 text-amber-800', label: 'Sync error' },
  }[s.status] as any
  const Icon = cfg.icon

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => window.api.sync.now()}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.color} hover:opacity-80 transition`}
        title={s.lastError ?? (s.lastSyncedAt ? `Last synced ${new Date(s.lastSyncedAt).toLocaleTimeString()}` : 'Click to sync now')}
      >
        <Icon size={14} className={cfg.spin ? 'animate-spin' : ''} />
        {cfg.label}
        {s.pending > 0 && <span className="bg-white/60 px-1.5 rounded-full">{s.pending}</span>}
      </button>
      <button
        onClick={onSignOut}
        className="bg-white/15 hover:bg-white/25 transition p-2 rounded-lg text-white backdrop-blur"
        title="Sign out"
      >
        <LogOut size={16} />
      </button>
    </div>
  )
}
