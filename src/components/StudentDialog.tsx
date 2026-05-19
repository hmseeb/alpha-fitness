import { useState, useEffect } from 'react'
import type { Student } from '../types'
import { X, Upload, Camera } from 'lucide-react'
import { StudentAvatar } from './StudentAvatar'

const empty: Partial<Student> = {
  name: '',
  contact: '',
  time_table: 'Evening',
  fees: 4000,
  month: new Date().toLocaleString('default', { month: 'long' }),
  reg_fee_status: 'Nill',
  entry_date: new Date().toISOString().slice(0, 10),
  next_fees_date: null,
  membership: 'Normal',
  paid_through: '',
  remaining: 0,
  photo_path: null,
  photo_remote_path: null,
}

function addMonth(dateStr: string): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + 1)
  return d.toISOString().slice(0, 10)
}

export function StudentDialog({ student, onClose, onSaved }: { student: Student | null; onClose: () => void; onSaved: () => void }) {
  const [data, setData] = useState<Partial<Student>>(student ?? empty)
  const isEdit = !!student

  useEffect(() => {
    if (!data.next_fees_date && data.entry_date) {
      setData((d) => ({ ...d, next_fees_date: addMonth(d.entry_date!) }))
    }
  }, [data.entry_date])

  const pickPhoto = async () => {
    const src = await window.api.dialog.pickImage()
    if (!src) return
    const dest = await window.api.photos.save(src)
    setData((d) => ({ ...d, photo_path: dest, photo_remote_path: null }))
  }

  const save = async () => {
    if (!data.name?.trim()) { alert('Name is required'); return }
    if (isEdit) await window.api.students.update(student!.id, data)
    else await window.api.students.create(data)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-ink/50 backdrop-blur-md flex items-center justify-center z-[100] p-6">
      <div
        className="drop rounded-4xl lift-deep w-full max-w-3xl max-h-[92vh] overflow-y-auto"
        style={{ background: '#ffffff' }}
      >
        {/* HEADER */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur-xl z-10 px-8 py-6 flex items-center justify-between border-b border-line">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted font-semibold">
              {isEdit ? 'Member · edit' : 'Add member'}
            </p>
            <h3 className="display-md text-3xl mt-1">
              {isEdit ? student?.name : 'New entry.'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-2xl bg-surface-2 hover:bg-surface-3 text-muted hover:text-ink transition">
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-8">
          {/* Photo */}
          <div className="flex items-center gap-5 p-5 bg-canvas rounded-3xl">
            <div className="relative">
              <StudentAvatar
                student={{ photo_path: data.photo_path, photo_remote_path: data.photo_remote_path, name: data.name || '' }}
                size={88}
              />
              <button
                onClick={pickPhoto}
                className="absolute -bottom-1 -right-1 w-9 h-9 bg-ink text-lime rounded-2xl flex items-center justify-center hover:bg-ink-2 transition"
              >
                <Camera size={14} />
              </button>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ink">Photograph</p>
              <p className="text-sm text-muted mt-0.5">Tap the camera to {data.photo_path || data.photo_remote_path ? 'replace' : 'upload'}</p>
            </div>
            {(data.photo_path || data.photo_remote_path) && (
              <button onClick={pickPhoto} className="text-xs font-semibold text-azure hover:underline flex items-center gap-1.5">
                <Upload size={13} /> Replace
              </button>
            )}
          </div>

          {/* Identity */}
          <Group label="Identity" emoji="①">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full name" required>
                <TextInput value={data.name ?? ''} onChange={(v) => setData({ ...data, name: v })} placeholder="Ammar Ali" />
              </Field>
              <Field label="Contact number">
                <TextInput value={data.contact ?? ''} onChange={(v) => setData({ ...data, contact: v })} placeholder="0333-8325556" />
              </Field>
              <Field label="Tier">
                <SelectInput value={data.membership ?? 'Normal'} onChange={(v) => setData({ ...data, membership: v })} options={['Normal', 'Premium', 'VIP']} />
              </Field>
            </div>
          </Group>

          {/* Schedule */}
          <Group label="Schedule" emoji="②">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Training time">
                <SelectInput value={data.time_table ?? 'Evening'} onChange={(v) => setData({ ...data, time_table: v as any })} options={['Morning', 'Evening']} />
              </Field>
              <Field label="Month">
                <TextInput value={data.month ?? ''} onChange={(v) => setData({ ...data, month: v })} placeholder="May" />
              </Field>
              <Field label="Entry date">
                <TextInput type="date" value={data.entry_date ?? ''} onChange={(v) => setData({ ...data, entry_date: v, next_fees_date: addMonth(v) })} />
              </Field>
              <Field label="Next fees due">
                <TextInput type="date" value={data.next_fees_date ?? ''} onChange={(v) => setData({ ...data, next_fees_date: v })} />
              </Field>
            </div>
          </Group>

          {/* Money */}
          <Group label="Payment" emoji="③">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Monthly fee (PKR)">
                <TextInput type="number" value={String(data.fees ?? 0)} onChange={(v) => setData({ ...data, fees: +v })} />
              </Field>
              <Field label="Remaining (PKR)">
                <TextInput type="number" value={String(data.remaining ?? 0)} onChange={(v) => setData({ ...data, remaining: +v })} />
              </Field>
              <Field label="Registration fee">
                <SelectInput value={data.reg_fee_status ?? 'Nill'} onChange={(v) => setData({ ...data, reg_fee_status: v as any })} options={['Nill', 'Paid']} />
              </Field>
              <Field label="Paid via">
                <TextInput value={data.paid_through ?? ''} onChange={(v) => setData({ ...data, paid_through: v })} placeholder="Meezan Bank · Cash" />
              </Field>
            </div>
          </Group>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-surface/95 backdrop-blur-xl px-8 py-5 border-t border-line flex items-center justify-between">
          <p className="text-xs text-muted">
            {isEdit ? 'Changes save and sync immediately' : 'Will sync after creating'}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-5 py-3 rounded-2xl bg-surface-2 hover:bg-surface-3 text-ink font-semibold text-sm transition">
              Cancel
            </button>
            <button onClick={save} className="px-6 py-3 rounded-2xl bg-lime text-ink hover:bg-lime-deep transition font-bold text-sm glow-lime">
              {isEdit ? 'Save changes' : 'Create member'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Group({ label, emoji, children }: { label: string; emoji: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-4 flex items-center gap-2">
        <span className="text-lg leading-none text-ink">{emoji}</span> {label}
      </p>
      {children}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted mb-1.5 block">
        {label} {required && <span className="text-coral">*</span>}
      </span>
      {children}
    </label>
  )
}

function TextInput({ value, onChange, type = 'text', placeholder }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-canvas border border-line focus:bg-surface focus:border-ink rounded-2xl px-4 py-3 text-sm outline-none transition placeholder-soft"
    />
  )
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-canvas border border-line focus:bg-surface focus:border-ink rounded-2xl px-4 py-3 text-sm outline-none transition cursor-pointer appearance-none"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}
