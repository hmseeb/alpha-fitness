import { useState } from 'react'
import type { Staff } from '../types'
import { X, Upload, Camera } from 'lucide-react'
import { StudentAvatar } from './StudentAvatar'

const empty: Partial<Staff> = {
  name: '',
  role: 'Trainer',
  contact: '',
  cnic: '',
  address: '',
  monthly_salary: 25000,
  joined_date: new Date().toISOString().slice(0, 10),
  notes: '',
  photo_path: null,
  photo_remote_path: null,
}

const ROLES = ['Trainer', 'Cleaner', 'Manager', 'Receptionist', 'Security', 'Other']

export function StaffDialog({ staff, onClose, onSaved }: { staff: Staff | null; onClose: () => void; onSaved: () => void }) {
  const [data, setData] = useState<Partial<Staff>>(staff ?? empty)
  const isEdit = !!staff

  const pickPhoto = async () => {
    const src = await window.api.dialog.pickImage()
    if (!src) return
    const dest = await window.api.photos.save(src)
    setData((d) => ({ ...d, photo_path: dest, photo_remote_path: null }))
  }

  const save = async () => {
    if (!data.name?.trim()) { alert('Name is required'); return }
    if (isEdit) await window.api.staff.update(staff!.id, data)
    else await window.api.staff.create(data)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-ink/50 backdrop-blur-md flex items-center justify-center z-[100] p-6">
      <div className="drop rounded-4xl lift-deep w-full max-w-3xl max-h-[92vh] overflow-y-auto" style={{ background: '#ffffff' }}>
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl z-10 px-8 py-6 flex items-center justify-between border-b border-line">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted font-semibold">
              {isEdit ? 'Employee · edit' : 'Add employee'}
            </p>
            <h3 className="display-md text-3xl mt-1">
              {isEdit ? staff?.name : 'New employee.'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-2xl bg-surface-2 hover:bg-surface-3 text-muted hover:text-ink transition">
            <X size={16} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex items-center gap-5 p-5 bg-canvas rounded-3xl">
            <div className="relative">
              <StudentAvatar
                student={{ photo_path: data.photo_path, photo_remote_path: data.photo_remote_path, name: data.name || '' }}
                size={88}
              />
              <button onClick={pickPhoto} className="absolute -bottom-1 -right-1 w-9 h-9 bg-ink text-lime rounded-2xl flex items-center justify-center hover:bg-ink-2 transition">
                <Camera size={14} />
              </button>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ink">Photograph</p>
              <p className="text-sm text-muted mt-0.5">{data.photo_path || data.photo_remote_path ? 'replace' : 'upload'}</p>
            </div>
            {(data.photo_path || data.photo_remote_path) && (
              <button onClick={pickPhoto} className="text-xs font-semibold text-azure hover:underline flex items-center gap-1.5">
                <Upload size={13} /> Replace
              </button>
            )}
          </div>

          <Group label="Identity" emoji="①">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full name" required>
                <TextInput value={data.name ?? ''} onChange={(v) => setData({ ...data, name: v })} placeholder="Imran Khan" />
              </Field>
              <Field label="Role">
                <SelectInput value={data.role || 'Trainer'} onChange={(v) => setData({ ...data, role: v })} options={ROLES} />
              </Field>
              <Field label="Contact number">
                <TextInput value={data.contact ?? ''} onChange={(v) => setData({ ...data, contact: v })} placeholder="0333-1234567" />
              </Field>
              <Field label="CNIC">
                <TextInput value={data.cnic ?? ''} onChange={(v) => setData({ ...data, cnic: v })} placeholder="35202-0000000-0" />
              </Field>
            </div>
          </Group>

          <Group label="Employment" emoji="②">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date joined">
                <TextInput type="date" value={data.joined_date ?? ''} onChange={(v) => setData({ ...data, joined_date: v })} />
              </Field>
              <Field label="Monthly salary (PKR)">
                <TextInput type="number" value={String(data.monthly_salary ?? 0)} onChange={(v) => setData({ ...data, monthly_salary: +v })} />
              </Field>
              <Field label="Address" full>
                <TextInput value={data.address ?? ''} onChange={(v) => setData({ ...data, address: v })} placeholder="Mohalla, Jampur" />
              </Field>
              <Field label="Notes" full>
                <TextInput value={data.notes ?? ''} onChange={(v) => setData({ ...data, notes: v })} placeholder="Anything to remember" />
              </Field>
            </div>
          </Group>
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl px-8 py-5 border-t border-line flex items-center justify-between">
          <p className="text-xs text-muted">
            {isEdit ? 'Changes sync immediately' : 'Will sync to cloud after creating'}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-5 py-3 rounded-2xl bg-surface-2 hover:bg-surface-3 text-ink font-semibold text-sm transition">
              Cancel
            </button>
            <button onClick={save} className="px-6 py-3 rounded-2xl bg-lime text-ink hover:bg-lime-deep transition font-bold text-sm glow-lime">
              {isEdit ? 'Save changes' : 'Add employee'}
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

function Field({ label, required, children, full }: { label: string; required?: boolean; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? 'col-span-2' : ''}`}>
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
      type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-canvas border border-line focus:bg-surface focus:border-ink rounded-2xl px-4 py-3 text-sm outline-none transition placeholder-soft"
    />
  )
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full bg-canvas border border-line focus:bg-surface focus:border-ink rounded-2xl px-4 py-3 text-sm outline-none transition cursor-pointer appearance-none"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}
