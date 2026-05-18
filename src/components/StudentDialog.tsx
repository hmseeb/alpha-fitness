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
    if (!data.name?.trim()) { alert('A name is required.'); return }
    if (isEdit) await window.api.students.update(student!.id, data)
    else await window.api.students.create(data)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="paper-rise bg-paper border border-ink shadow-deep w-full max-w-3xl max-h-[92vh] overflow-y-auto">
        {/* HEADER — like a form cover sheet */}
        <div className="sticky top-0 bg-paper border-b-4 border-double border-ink z-10">
          <div className="px-8 pt-5 pb-4">
            <div className="flex items-center justify-between mono text-[10px] tracking-widest2 uppercase text-ink-soft pb-3 border-b border-rule">
              <span>{isEdit ? 'Amendment · entry record' : 'Form A · enrolment'}</span>
              <span>Folio {isEdit ? String(student?.sr_no ?? '—').padStart(3, '0') : '— new'}</span>
            </div>
            <div className="flex items-end justify-between pt-3">
              <div>
                <h3 className="serif text-4xl tracking-tight">
                  {isEdit ? <>Edit <span className="serif-italic">{student?.name}</span></> : <>A new <span className="serif-italic">enrolment.</span></>}
                </h3>
                <p className="annotation text-sm mt-1">— record below in three parts</p>
              </div>
              <button onClick={onClose} className="border border-rule hover:border-ink p-2.5 text-ink-soft hover:text-ink transition">
                <X size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-10">
          {/* Photograph */}
          <div className="flex items-end gap-6 pb-8 border-b border-rule">
            <div className="relative">
              <div className="text-center mb-2 annotation text-[11px]">— photograph —</div>
              <StudentAvatar
                student={{ photo_path: data.photo_path, photo_remote_path: data.photo_remote_path, name: data.name || '' }}
                size={120}
                className="!bg-paper-2"
              />
            </div>
            <button onClick={pickPhoto} className="flex items-center gap-2 px-4 py-2.5 border border-ink hover:bg-ink hover:text-paper transition mono text-[10px] tracking-widest2 uppercase">
              <Upload size={12} />
              {data.photo_path || data.photo_remote_path ? 'Replace' : 'Affix'}
            </button>
          </div>

          <Section ordinal="I" label="Identity">
            <div className="grid grid-cols-2 gap-6">
              <Field label="Full name" required>
                <TextInput value={data.name ?? ''} onChange={(v) => setData({ ...data, name: v })} placeholder="Ammar Ali" serif />
              </Field>
              <Field label="Telephone">
                <TextInput value={data.contact ?? ''} onChange={(v) => setData({ ...data, contact: v })} placeholder="0333-8325556" mono />
              </Field>
              <Field label="Folio №">
                <TextInput type="number" value={String(data.sr_no ?? '')} onChange={(v) => setData({ ...data, sr_no: +v })} placeholder="assigned automatically" mono />
              </Field>
              <Field label="Tier">
                <SelectInput value={data.membership ?? 'Normal'} onChange={(v) => setData({ ...data, membership: v })} options={['Normal', 'Premium', 'VIP']} />
              </Field>
            </div>
          </Section>

          <Section ordinal="II" label="Schedule">
            <div className="grid grid-cols-2 gap-6">
              <Field label="Training hour">
                <SelectInput value={data.time_table ?? 'Evening'} onChange={(v) => setData({ ...data, time_table: v as any })} options={['Morning', 'Evening']} />
              </Field>
              <Field label="Month">
                <TextInput value={data.month ?? ''} onChange={(v) => setData({ ...data, month: v })} placeholder="May" />
              </Field>
              <Field label="Date of entry">
                <TextInput type="date" value={data.entry_date ?? ''} onChange={(v) => setData({ ...data, entry_date: v, next_fees_date: addMonth(v) })} mono />
              </Field>
              <Field label="Next fees due">
                <TextInput type="date" value={data.next_fees_date ?? ''} onChange={(v) => setData({ ...data, next_fees_date: v })} mono />
              </Field>
            </div>
          </Section>

          <Section ordinal="III" label="Accounts">
            <div className="grid grid-cols-2 gap-6">
              <Field label="Monthly fee (₨)">
                <TextInput type="number" value={String(data.fees ?? 0)} onChange={(v) => setData({ ...data, fees: +v })} mono />
              </Field>
              <Field label="Outstanding (₨)">
                <TextInput type="number" value={String(data.remaining ?? 0)} onChange={(v) => setData({ ...data, remaining: +v })} mono />
              </Field>
              <Field label="Registration fee">
                <SelectInput value={data.reg_fee_status ?? 'Nill'} onChange={(v) => setData({ ...data, reg_fee_status: v as any })} options={['Nill', 'Paid']} />
              </Field>
              <Field label="Paid by way of">
                <TextInput value={data.paid_through ?? ''} onChange={(v) => setData({ ...data, paid_through: v })} placeholder="Meezan Bank · Cash" />
              </Field>
            </div>
          </Section>
        </div>

        {/* FOOTER — signature line */}
        <div className="sticky bottom-0 bg-paper border-t-4 border-double border-ink px-8 py-5 flex items-center justify-between">
          <p className="annotation text-xs">
            {isEdit ? 'Changes are recorded and synchronised.' : 'On save, this entry joins the register.'}
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 border border-rule hover:border-ink hover:bg-paper-2 transition mono text-[10px] tracking-widest2 uppercase">
              Cancel
            </button>
            <button onClick={save} className="px-6 py-2.5 bg-ink text-paper hover:bg-oxblood transition mono text-[10px] tracking-widest2 uppercase">
              {isEdit ? 'Save amendments' : 'Enter member'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ ordinal, label, children }: { ordinal: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-4 mb-5">
        <p className="serif-italic text-2xl text-ink-faint">{ordinal}.</p>
        <h4 className="serif text-2xl tracking-tight">{label}<span className="text-oxblood">.</span></h4>
        <div className="flex-1 border-b border-rule mb-2" />
      </div>
      {children}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block group">
      <span className="mono text-[10px] tracking-widest2 uppercase text-ink-soft group-focus-within:text-oxblood transition">
        {label} {required && <span className="text-oxblood">·</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

function TextInput({ value, onChange, type = 'text', placeholder, mono, serif }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string; mono?: boolean; serif?: boolean }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-transparent border-0 border-b border-rule-strong focus:border-ink outline-none px-0 py-2 text-ink placeholder-ink-faint transition ${mono ? 'mono text-sm' : serif ? 'serif-body text-lg' : 'text-base'}`}
    />
  )
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent border-0 border-b border-rule-strong focus:border-ink outline-none px-0 py-2 text-ink text-base transition appearance-none cursor-pointer serif-body italic"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}
