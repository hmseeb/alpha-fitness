import * as XLSX from 'xlsx'
import type { Student } from '../types'

export function exportToExcel(students: Student[]): Uint8Array {
  const rows = students.map((s) => ({
    'SR No': s.sr_no,
    'Name': s.name,
    'Contact': s.contact,
    'Time Table': s.time_table,
    'PT Fee': s.pt_fee,
    'Fees': s.fees,
    'Month': s.month,
    'Reg Fee Status': s.reg_fee_status,
    'Entry Date': s.entry_date,
    'Next Fees Date': s.next_fees_date,
    'Membership': s.membership,
    'Paid Through': s.paid_through,
    'Remaining': s.remaining,
    'Notes': s.notes,
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Students')
  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return new Uint8Array(out)
}
