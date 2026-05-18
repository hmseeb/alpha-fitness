export interface Student {
  id: number
  sr_no: number
  photo_path: string | null
  name: string
  contact: string
  time_table: 'Morning' | 'Evening'
  fees: number
  month: string
  reg_fee_status: 'Paid' | 'Nill'
  entry_date: string | null
  next_fees_date: string | null
  membership: string
  paid_through: string
  remaining: number
  created_at?: string
}

export interface Payment {
  id: number
  student_id: number
  amount: number
  paid_on: string
  method: string
  note: string
}

export interface DashStats {
  active: number
  overdue: number
  revenue: number
}

declare global {
  interface Window {
    api: {
      students: {
        list: (q?: string) => Promise<Student[]>
        get: (id: number) => Promise<Student>
        create: (data: Partial<Student>) => Promise<Student>
        update: (id: number, data: Partial<Student>) => Promise<Student>
        remove: (id: number) => Promise<boolean>
      }
      payments: {
        list: (studentId: number) => Promise<Payment[]>
        create: (data: Partial<Payment>) => Promise<Payment[]>
      }
      photos: { save: (srcPath: string) => Promise<string> }
      dialog: {
        pickImage: () => Promise<string | null>
        saveExcel: (defaultName: string) => Promise<string | null>
      }
      files: { writeBuffer: (filePath: string, buffer: Uint8Array) => Promise<boolean> }
      dashboard: { stats: () => Promise<DashStats> }
    }
  }
}
