import { useEffect, useState } from 'react'
import { resolvePhoto } from '../lib/photoUrl'

interface Props {
  student: { photo_path?: string | null; photo_remote_path?: string | null; name: string }
  size?: number
  className?: string
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
        className={`object-cover border border-rule-strong ${className}`}
      />
    )
  }
  const initial = student.name?.[0]?.toUpperCase() ?? '?'
  return (
    <div
      style={{ width: px, height: px, fontSize: Math.round(size * 0.45) }}
      className={`bg-paper-2 border border-rule-strong flex items-center justify-center text-ink-soft serif font-medium ${className}`}
    >
      {initial}
    </div>
  )
}
