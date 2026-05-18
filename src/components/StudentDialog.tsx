import { useState, useEffect } from 'react'
import type { Student } from '../types'
import { X, Upload } from 'lucide-react'
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
    if (!data.name?.trim()) { alert('name required'); return }
    if (isEdit) await window.api.students.update(student!.id, data)
    else await window.api.students.create(data)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="grain bg-ink-0 border border-line shadow-deep w-full max-w-3xl max-h-[90vh] overflow-y-auto rise">
        {/* HEADER */}
        <div className="sticky top-0 bg-ink-0/95 backdrop-blur border-b border-line z-10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <p className="mono text-[10px] tracking-widest2 uppercase text-crimson mb-1">
                {isEdit ? '/ edit member' : '/ new member'}
              </p>
              <h3 className="display text-3xl tracking-tight leading-none">
                {isEdit ? (student?.name?.toUpperCase() ?? 'EDIT') : 'ROSTER ENTRY'}
              </h3>
            </div>
            <button onClick={onClose} className="border border-line hover:border-crimson hover:text-crimson p-2.5 text-zinc-500 transition">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-8">
          {/* Photo block */}
          <div className="flex items-center gap-6 pb-6 border-b border-line">
            <div className="relative">
              <StudentAvatar
                student={{ photo_path: data.photo_path, photo_remote_path: data.photo_remote_path, name: data.name || '' }}
                size={96}
                className="!rounded-none border-2 border-line"
              />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-crimson border-2 border-ink-0" />
            </div>
            <div className="flex-1">
              <p className="mono text-[10px] tracking-widest2 uppercase text-zinc-500 mb-2">/ photo</p>
              <button onClick={pickPhoto} className="flex items-center gap-2 px-4 py-2.5 border border-line hover:border-line-bright bg-ink-1 hover:bg-ink-2 transition mono text-[10px] tracking-widest2 uppercase">
                <Upload size={13} />
                {data.photo_path || data.photo_remote_path ? 'replace' : 'upload'}
              </button>
            </div>
          </div>

          {/* Identity */}
          <FormSection label="01 · identity">
            <div className="grid grid-cols-2 gap-5">
              <Field label="full name" required>
                <Input value={data.name ?? ''} onChange={(v) => setData({ ...data, name: v })} placeholder="ammar ali" />
              </Field>
              <Field label="contact">
                <Input value={data.contact ?? ''} onChange={(v) => setData({ ...data, contact: v })} placeholder="0333-8325556" mono />
              </Field>
              <Field label="sr no">
                <Input type="number" value={String(data.sr_no ?? '')} onChange={(v) => setData({ ...data, sr_no: +v })} placeholder="auto" mono />
              </Field>
              <Field label="tier">
                <Select value={data.membership ?? 'Normal'} onChange={(v) => setData({ ...data, membership: v })} options={['Normal', 'Premium', 'VIP']} />
              </Field>
            </div>
          </FormSection>

          {/* Schedule */}
          <FormSection label="02 · schedule">
            <div className="grid grid-cols-2 gap-5">
              <Field label="time table">
                <Select value={data.time_table ?? 'Evening'} onChange={(v) => setData({ ...data, time_table: v as any })} options={['Morning', 'Evening']} />
              </Field>
              <Field label="month">
                <Input value={data.month ?? ''} onChange={(v) => setData({ ...data, month: v })} placeholder="may" />
              </Field>
              <Field label="entry date">
                <Input type="date" value={data.entry_date ?? ''} onChange={(v) => setData({ ...data, entry_date: v, next_fees_date: addMonth(v) })} mono />
              </Field>
              <Field label="next fees date">
                <Input type="date" value={data.next_fees_date ?? ''} onChange={(v) => setData({ ...data, next_fees_date: v })} mono />
              </Field>
            </div>
          </FormSection>

          {/* Money */}
          <FormSection label="03 · money">
            <div className="grid grid-cols-2 gap-5">
              <Field label="fees (pkr)">
                <Input type="number" value={String(data.fees ?? 0)} onChange={(v) => setData({ ...data, fees: +v })} mono />
              </Field>
              <Field label="remaining (pkr)">
                <Input type="number" value={String(data.remaining ?? 0)} onChange={(v) => setData({ ...data, remaining: +v })} mono />
              </Field>
              <Field label="registration fee">
                <Select value={data.reg_fee_status ?? 'Nill'} onChange={(v) => setData({ ...data, reg_fee_status: v as any })} options={['Nill', 'Paid']} />
              </Field>
              <Field label="paid through">
                <Input value={data.paid_through ?? ''} onChange={(v) => setData({ ...data, paid_through: v })} placeholder="meezan bank / cash" />
              </Field>
            </div>
          </FormSection>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-ink-0/95 backdrop-blur border-t border-line px-8 py-5 flex items-center justify-between">
          <p className="mono text-[10px] tracking-widest2 uppercase text-zinc-600">
            {isEdit ? 'changes sync automatically' : 'will sync to cloud on save'}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-5 py-2.5 border border-line hover:border-line-bright transition mono text-[10px] tracking-widest2 uppercase text-zinc-400">
              cancel
            </button>
            <button onClick={save} className="px-6 py-2.5 bg-crimson hover:bg-crimson-glow transition mono text-[10px] tracking-widest2 uppercase font-bold shadow-glow">
              {isEdit ? 'save changes' : 'create member'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mono text-[10px] tracking-widest2 uppercase text-zinc-500 mb-4 flex items-center gap-2">
        <span className="inline-block w-1 h-1 bg-crimson" />
        {label}
      </p>
      {children}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block group">
      <span className="mono text-[10px] tracking-widest2 uppercase text-zinc-500 group-focus-within:text-crimson transition">
        / {label} {required && <span className="text-crimson">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

function Input({ value, onChange, type = 'text', placeholder, mono }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string; mono?: boolean }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-ink-1 border border-line focus:border-crimson outline-none px-3 py-2.5 text-white placeholder-zinc-700 transition ${mono ? 'mono text-sm' : 'text-sm'}`}
    />
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-ink-1 border border-line focus:border-crimson outline-none px-3 py-2.5 text-white text-sm transition appearance-none cursor-pointer"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}
