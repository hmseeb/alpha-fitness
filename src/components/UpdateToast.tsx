import { useEffect, useState } from 'react'
import { Sparkles, X } from 'lucide-react'

export function UpdateToast() {
  const [ready, setReady] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const off = window.api.app.onUpdateReady(() => setReady(true))
    return off
  }, [])

  if (!ready || dismissed) return null

  return (
    <div className="fixed bottom-6 right-6 z-[200] pop">
      <div className="flex items-center gap-3 bg-ink text-canvas pl-4 pr-2 py-2 rounded-2xl shadow-2xl border border-ink/50">
        <span className="w-8 h-8 bg-lime text-ink rounded-xl flex items-center justify-center">
          <Sparkles size={14} />
        </span>
        <div className="pr-2">
          <p className="text-sm font-semibold leading-tight">Update ready</p>
          <p className="text-[11px] text-canvas/70 leading-tight mt-0.5">Restart to apply the new version</p>
        </div>
        <button
          onClick={() => window.api.app.installUpdate()}
          className="px-3 py-2 bg-lime text-ink hover:bg-lime-deep transition rounded-xl text-xs font-bold"
        >
          Restart now
        </button>
        <button
          onClick={() => setDismissed(true)}
          title="Dismiss"
          className="p-2 text-canvas/60 hover:text-canvas rounded-xl"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
