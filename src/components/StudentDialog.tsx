import { useState, useEffect } from 'react'
import type { Student } from '../types'
import { X, Upload, User } from 'lucide-react'

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
    setData((d) => ({ ...d, photo_path: dest }))
  }

  const save = async () => {
    if (!data.name?.trim()) { alert('Name is required'); return }
    if (isEdit) await window.api.students.update(student!.id, data)
    else await window.api.students.create(data)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">{isEdit ? 'Edit Student' : 'New Student'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            {data.photo_path ? (
              <img src={`file://${data.photo_path}`} className="w-24 h-24 rounded-2xl object-cover ring-2 ring-slate-100" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <User size={36} />
              </div>
            )}
            <button onClick={pickPhoto} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium">
              <Upload size={16} /> {data.photo_path ? 'Change photo' : 'Upload photo'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Student Name" required>
              <input className={inputCls} value={data.name ?? ''} onChange={(e) => setData({ ...data, name: e.target.value })} />
            </Field>
            <Field label="Contact Number">
              <input className={inputCls} value={data.contact ?? ''} onChange={(e) => setData({ ...data, contact: e.target.value })} placeholder="0333-8325556" />
            </Field>

            <Field label="Time Table">
              <select className={inputCls} value={data.time_table} onChange={(e) => setData({ ...data, time_table: e.target.value as any })}>
                <option>Morning</option>
                <option>Evening</option>
              </select>
            </Field>
            <Field label="Membership">
              <select className={inputCls} value={data.membership} onChange={(e) => setData({ ...data, membership: e.target.value })}>
                <option>Normal</option>
                <option>Premium</option>
                <option>VIP</option>
              </select>
            </Field>

            <Field label="Fees (PKR)">
              <input type="number" className={inputCls} value={data.fees ?? 0} onChange={(e) => setData({ ...data, fees: +e.target.value })} />
            </Field>
            <Field label="Month">
              <input className={inputCls} value={data.month ?? ''} onChange={(e) => setData({ ...data, month: e.target.value })} />
            </Field>

            <Field label="Entry Date">
              <input type="date" className={inputCls} value={data.entry_date ?? ''} onChange={(e) => setData({ ...data, entry_date: e.target.value, next_fees_date: addMonth(e.target.value) })} />
            </Field>
            <Field label="Next Fees Date">
              <input type="date" className={inputCls} value={data.next_fees_date ?? ''} onChange={(e) => setData({ ...data, next_fees_date: e.target.value })} />
            </Field>

            <Field label="Registration Fee">
              <select className={inputCls} value={data.reg_fee_status} onChange={(e) => setData({ ...data, reg_fee_status: e.target.value as any })}>
                <option>Nill</option>
                <option>Paid</option>
              </select>
            </Field>
            <Field label="Paid Through">
              <input className={inputCls} value={data.paid_through ?? ''} onChange={(e) => setData({ ...data, paid_through: e.target.value })} placeholder="Meezan Bank / Cash" />
            </Field>

            <Field label="Remaining (PKR)">
              <input type="number" className={inputCls} value={data.remaining ?? 0} onChange={(e) => setData({ ...data, remaining: +e.target.value })} />
            </Field>
            <Field label="SR No">
              <input type="number" className={inputCls} value={data.sr_no ?? ''} onChange={(e) => setData({ ...data, sr_no: +e.target.value })} placeholder="auto" />
            </Field>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium">Cancel</button>
          <button onClick={save} className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow">
            {isEdit ? 'Save Changes' : 'Create Student'}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputCls = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  )
}
