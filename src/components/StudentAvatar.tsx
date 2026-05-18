import { useEffect, useState } from 'react'
import { resolvePhoto } from '../lib/photoUrl'

interface Props {
  student: { photo_path?: string | null; photo_remote_path?: string | null; name: string }
  size?: number
  className?: string
}

const tintByLetter: Record<string, string> = {
  A: 'bg-lime',
  B: 'bg-coral/30',
  C: 'bg-azure/25',
  D: 'bg-plum/25',
  E: 'bg-moss/25',
  F: 'bg-amber-200',
  G: 'bg-lime',
  H: 'bg-coral/30',
  I: 'bg-azure/25',
  J: 'bg-plum/25',
  K: 'bg-moss/25',
  L: 'bg-amber-200',
  M: 'bg-lime',
  N: 'bg-coral/30',
  O: 'bg-azure/25',
  P: 'bg-plum/25',
  Q: 'bg-moss/25',
  R: 'bg-amber-200',
  S: 'bg-lime',
  T: 'bg-coral/30',
  U: 'bg-azure/25',
  V: 'bg-plum/25',
  W: 'bg-moss/25',
  X: 'bg-amber-200',
  Y: 'bg-lime',
  Z: 'bg-coral/30',
}

export function StudentAvatar({ student, size = 40, className = '' }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    resolvePhoto(student).then((u) => { if (alive) setUrl(u) })
    return () => { alive = false }
  }, [student.photo_path, student.photo_remote_path])

  const px = `${size}px`
  if (url) {
    return (
      <img
        src={url}
        alt={student.name}
        style={{ width: px, height: px }}
        className={`rounded-2xl object-cover ${className}`}
      />
    )
  }
  const initial = student.name?.[0]?.toUpperCase() ?? '?'
  const tint = tintByLetter[initial] ?? 'bg-surface-2'
  return (
    <div
      style={{ width: px, height: px, fontSize: Math.round(size * 0.4) }}
      className={`rounded-2xl ${tint} flex items-center justify-center text-ink font-display font-semibold ${className}`}
    >
      {initial}
    </div>
  )
}
