export interface Student {
  id: string
  owner_id: string
  sr_no: number
  photo_path: string | null
  photo_remote_path: string | null
  name: string
  contact: string
  time_table: 'Morning' | 'Evening'
  pt_fee: number
  fees: number
  month: string
  reg_fee_status: 'Paid' | 'Nill'
  entry_date: string | null
  next_fees_date: string | null
  membership: string
  paid_through: string
  remaining: number
  notes: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface Payment {
  id: string
  student_id: string
  amount: number
  paid_on: string
  method: string
  note: string
}

export interface DashStats { active: number; overdue: number; revenue: number; staffPaid: number; upcoming: number }

// Which member subset the roster is filtered to (driven by clicking dashboard cards)
export type MemberFilter = 'all' | 'overdue' | 'upcoming'

export interface Staff {
  id: string
  owner_id: string
  name: string
  role: string
  photo_path: string | null
  photo_remote_path: string | null
  contact: string
  cnic: string
  address: string
  monthly_salary: number
  joined_date: string | null
  notes: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface StaffPayment {
  id: string
  staff_id: string
  amount: number
  paid_on: string
  kind: 'advance' | 'salary' | 'bonus'
  method: string
  note: string
}

export interface AuthUser { id: string; email?: string }

export interface SyncStatus {
  status: 'offline' | 'idle' | 'syncing' | 'error'
  pending: number
  lastSyncedAt: string | null
  lastError: string | null
}

declare global {
  interface Window {
    api: {
      auth: {
        signIn: (email: string, password: string) => Promise<AuthUser>
        signUp: (email: string, password: string) => Promise<AuthUser>
        signOut: () => Promise<boolean>
        state: () => Promise<AuthUser | null>
        onStateChange: (cb: (user: AuthUser | null) => void) => () => void
      }
      students: {
        list: (q?: string) => Promise<Student[]>
        get: (id: string) => Promise<Student>
        create: (data: Partial<Student>) => Promise<Student>
        update: (id: string, data: Partial<Student>) => Promise<Student>
        remove: (id: string) => Promise<boolean>
      }
      payments: {
        list: (studentId: string) => Promise<Payment[]>
        create: (data: Partial<Payment> & { student_id: string }) => Promise<Payment[]>
      }
      staff: {
        list: (q?: string) => Promise<Staff[]>
        get: (id: string) => Promise<Staff>
        create: (data: Partial<Staff>) => Promise<Staff>
        update: (id: string, data: Partial<Staff>) => Promise<Staff>
        remove: (id: string) => Promise<boolean>
      }
      staffPayments: {
        list: (staffId: string) => Promise<StaffPayment[]>
        create: (data: Partial<StaffPayment> & { staff_id: string }) => Promise<StaffPayment[]>
      }
      photos: {
        save: (srcPath: string) => Promise<string>
        remoteUrl: (remotePath: string) => Promise<string | null>
      }
      dialog: {
        pickImage: () => Promise<string | null>
        saveExcel: (defaultName: string) => Promise<string | null>
      }
      files: { writeBuffer: (filePath: string, buffer: Uint8Array) => Promise<boolean> }
      dashboard: { stats: () => Promise<DashStats> }
      sync: {
        now: () => Promise<{ pending: number; lastSyncedAt: string | null }>
        status: () => Promise<{ pending: number; lastSyncedAt: string | null }>
        onStatus: (cb: (s: SyncStatus) => void) => () => void
      }
      app: {
        installUpdate: () => Promise<void>
        onUpdateReady: (cb: () => void) => () => void
      }
    }
  }
}
