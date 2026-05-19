import type { Student } from '../types'

interface Props {
  contact: string | null | undefined
  size?: number
  message?: string
}

export function overdueMessage(student: Student, daysLate: number): string {
  const firstName = (student.name || '').trim().split(/\s+/)[0] || 'there'
  const amount = (student.remaining > 0 ? student.remaining : student.fees) || 0
  const dueDate = student.next_fees_date || ''
  const dueLine = dueDate ? ` (due ${dueDate}, ${daysLate} day${daysLate === 1 ? '' : 's'} ago)` : ''
  return `Assalam o Alaikum ${firstName}, this is a reminder from Alpha Fitness — your monthly fee of PKR ${amount.toLocaleString()} is pending${dueLine}. Please clear it at your earliest convenience. JazakAllah!`
}

// Pakistani local "0333-1234567" -> "923331234567". Already-intl numbers pass through.
function toWaNumber(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('92')) return digits
  if (digits.startsWith('0')) return '92' + digits.slice(1)
  return digits
}

export function WhatsAppLink({ contact, size = 14, message }: Props) {
  if (!contact) return null
  const num = toWaNumber(contact)
  if (!num) return null
  const href = `https://wa.me/${num}${message ? `?text=${encodeURIComponent(message)}` : ''}`
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      title="Message on WhatsApp"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center justify-center p-1.5 rounded-lg text-[#25D366] hover:bg-[#25D366]/10 transition"
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.554-5.338 11.89-11.893 11.89a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
      </svg>
    </a>
  )
}
