import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
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
    return <img src={url} alt={student.name} style={{ width: px, height: px }} className={`rounded-full object-cover ring-2 ring-white shadow ${className}`} />
  }
  return (
    <div style={{ width: px, height: px }} className={`rounded-full bg-slate-100 flex items-center justify-center text-slate-400 ${className}`}>
      <User size={Math.round(size * 0.45)} />
    </div>
  )
}
