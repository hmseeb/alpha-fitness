import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { v4 as uuidv4 } from 'uuid'

let db: Database.Database

export function getDb() { return db }

export function initDb() {
  const userData = app.getPath('userData')
  const dbPath = path.join(userData, 'alpha-fitness.db')
  const photosDir = path.join(userData, 'photos')
  fs.mkdirSync(photosDir, { recursive: true })
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      sr_no INTEGER,
      photo_path TEXT,
      photo_remote_path TEXT,
      name TEXT NOT NULL,
      contact TEXT DEFAULT '',
      time_table TEXT DEFAULT 'Evening',
      fees INTEGER DEFAULT 0,
      month TEXT DEFAULT '',
      reg_fee_status TEXT DEFAULT 'Nill',
      entry_date TEXT,
      next_fees_date TEXT,
      membership TEXT DEFAULT 'Normal',
      paid_through TEXT DEFAULT '',
      remaining INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      deleted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS students_owner_updated ON students(owner_id, updated_at);

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      paid_on TEXT NOT NULL,
      method TEXT DEFAULT '',
      note TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      deleted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS payments_student ON payments(student_id);
    CREATE INDEX IF NOT EXISTS payments_owner_updated ON payments(owner_id, updated_at);

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT '',
      photo_path TEXT,
      photo_remote_path TEXT,
      contact TEXT DEFAULT '',
      cnic TEXT DEFAULT '',
      address TEXT DEFAULT '',
      monthly_salary INTEGER DEFAULT 0,
      joined_date TEXT,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      deleted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS staff_owner_updated ON staff(owner_id, updated_at);

    CREATE TABLE IF NOT EXISTS staff_payments (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      staff_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      paid_on TEXT NOT NULL,
      kind TEXT DEFAULT 'advance',
      method TEXT DEFAULT '',
      note TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      deleted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS staff_payments_staff ON staff_payments(staff_id);
    CREATE INDEX IF NOT EXISTS staff_payments_owner_updated ON staff_payments(owner_id, updated_at);

    CREATE TABLE IF NOT EXISTS outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      op TEXT NOT NULL,
      payload TEXT NOT NULL,
      enqueued_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      attempts INTEGER DEFAULT 0,
      last_error TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_state (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `)
}

function now() { return new Date().toISOString() }

function enqueue(entity: 'students' | 'payments' | 'staff' | 'staff_payments', op: 'upsert' | 'delete', row: any) {
  db.prepare(`INSERT INTO outbox (entity, entity_id, op, payload) VALUES (?, ?, ?, ?)`)
    .run(entity, row.id, op, JSON.stringify(row))
}

export function listStudents(ownerId: string, q?: string) {
  const sql = q
    ? `SELECT * FROM students WHERE owner_id = ? AND deleted_at IS NULL AND (name LIKE ? OR contact LIKE ?) ORDER BY sr_no DESC`
    : `SELECT * FROM students WHERE owner_id = ? AND deleted_at IS NULL ORDER BY sr_no DESC`
  const params = q ? [ownerId, `%${q}%`, `%${q}%`] : [ownerId]
  return db.prepare(sql).all(...params)
}

export function getStudent(id: string) {
  return db.prepare(`SELECT * FROM students WHERE id = ?`).get(id)
}

function nextSrNo(ownerId: string): number {
  const row = db.prepare(`SELECT COALESCE(MAX(sr_no), 0) + 1 AS n FROM students WHERE owner_id = ?`).get(ownerId) as any
  return row.n
}

export function createStudent(ownerId: string, d: any) {
  const id = d.id ?? uuidv4()
  const ts = now()
  const row = {
    id,
    owner_id: ownerId,
    sr_no: d.sr_no ?? nextSrNo(ownerId),
    photo_path: d.photo_path ?? null,
    photo_remote_path: d.photo_remote_path ?? null,
    name: d.name,
    contact: d.contact ?? '',
    time_table: d.time_table ?? 'Evening',
    fees: d.fees ?? 0,
    month: d.month ?? '',
    reg_fee_status: d.reg_fee_status ?? 'Nill',
    entry_date: d.entry_date ?? null,
    next_fees_date: d.next_fees_date ?? null,
    membership: d.membership ?? 'Normal',
    paid_through: d.paid_through ?? '',
    remaining: d.remaining ?? 0,
    created_at: ts,
    updated_at: ts,
    deleted_at: null,
  }
  db.prepare(`
    INSERT INTO students (id, owner_id, sr_no, photo_path, photo_remote_path, name, contact, time_table, fees, month, reg_fee_status, entry_date, next_fees_date, membership, paid_through, remaining, created_at, updated_at, deleted_at)
    VALUES (@id, @owner_id, @sr_no, @photo_path, @photo_remote_path, @name, @contact, @time_table, @fees, @month, @reg_fee_status, @entry_date, @next_fees_date, @membership, @paid_through, @remaining, @created_at, @updated_at, @deleted_at)
  `).run(row)
  enqueue('students', 'upsert', row)
  return getStudent(id)
}

export function updateStudent(ownerId: string, id: string, d: any) {
  const existing: any = getStudent(id)
  if (!existing || existing.owner_id !== ownerId) throw new Error('Not found')
  const ts = now()
  const row = { ...existing, ...d, id, owner_id: ownerId, updated_at: ts, deleted_at: null }
  db.prepare(`
    UPDATE students SET
      sr_no = @sr_no, photo_path = @photo_path, photo_remote_path = @photo_remote_path,
      name = @name, contact = @contact, time_table = @time_table, fees = @fees,
      month = @month, reg_fee_status = @reg_fee_status, entry_date = @entry_date,
      next_fees_date = @next_fees_date, membership = @membership, paid_through = @paid_through,
      remaining = @remaining, updated_at = @updated_at
    WHERE id = @id AND owner_id = @owner_id
  `).run(row)
  enqueue('students', 'upsert', row)
  return getStudent(id)
}

export function deleteStudent(ownerId: string, id: string) {
  const ts = now()
  db.prepare(`UPDATE students SET deleted_at = ?, updated_at = ? WHERE id = ? AND owner_id = ?`).run(ts, ts, id, ownerId)
  enqueue('students', 'delete', { id, owner_id: ownerId, deleted_at: ts, updated_at: ts })
  return true
}

export function savePhoto(srcPath: string): string {
  const photosDir = path.join(app.getPath('userData'), 'photos')
  const ext = path.extname(srcPath) || '.jpg'
  const name = crypto.randomBytes(8).toString('hex') + ext
  const destPath = path.join(photosDir, name)
  fs.copyFileSync(srcPath, destPath)
  return destPath
}

export function listPayments(ownerId: string, studentId: string) {
  return db.prepare(`SELECT * FROM payments WHERE student_id = ? AND owner_id = ? AND deleted_at IS NULL ORDER BY paid_on DESC`).all(studentId, ownerId)
}

function todayIso() { return new Date().toISOString().slice(0, 10) }

function monthsBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso)
  const to = new Date(toIso)
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
}

export function recordPayment(ownerId: string, d: any) {
  const ts = now()
  const months = Math.max(1, parseInt(d.months ?? 1, 10))
  const s: any = getStudent(d.student_id)
  if (!s) throw new Error('Student not found')

  const today = todayIso()
  const wasOverdue = !!s.next_fees_date && s.next_fees_date < today
  const absentCount = wasOverdue ? Math.max(0, monthsBetween(s.next_fees_date, today)) : 0

  const tx = db.transaction(() => {
    // 1. Log absent months as PKR 0 entries
    if (wasOverdue && absentCount > 0) {
      for (let i = 0; i < absentCount; i++) {
        const dt = new Date(s.next_fees_date)
        dt.setMonth(dt.getMonth() + i)
        const absentRow = {
          id: uuidv4(), owner_id: ownerId,
          student_id: d.student_id,
          amount: 0,
          paid_on: dt.toISOString().slice(0, 10),
          method: '',
          note: 'absent',
          created_at: ts, updated_at: ts, deleted_at: null,
        }
        db.prepare(`
          INSERT INTO payments (id, owner_id, student_id, amount, paid_on, method, note, created_at, updated_at, deleted_at)
          VALUES (@id, @owner_id, @student_id, @amount, @paid_on, @method, @note, @created_at, @updated_at, @deleted_at)
        `).run(absentRow)
        enqueue('payments', 'upsert', absentRow)
      }
    }

    // 2. Insert the actual payment
    const row = {
      id: d.id ?? uuidv4(),
      owner_id: ownerId,
      student_id: d.student_id,
      amount: d.amount,
      paid_on: d.paid_on,
      method: d.method ?? '',
      note: d.note ?? (months > 1 ? `${months} months` : ''),
      created_at: ts, updated_at: ts, deleted_at: null,
    }
    db.prepare(`
      INSERT INTO payments (id, owner_id, student_id, amount, paid_on, method, note, created_at, updated_at, deleted_at)
      VALUES (@id, @owner_id, @student_id, @amount, @paid_on, @method, @note, @created_at, @updated_at, @deleted_at)
    `).run(row)
    enqueue('payments', 'upsert', row)

    // 3. Advance next_fees_date.
    //    If returning from absence: reset clock to today + N months.
    //    If current: advance current next_fees_date by N months.
    const base = wasOverdue ? new Date(today) : new Date(s.next_fees_date ?? today)
    base.setMonth(base.getMonth() + months)
    const newNext = base.toISOString().slice(0, 10)

    const upd = { ...s, next_fees_date: newNext, paid_through: d.method || s.paid_through, updated_at: ts }
    db.prepare(`UPDATE students SET next_fees_date = ?, paid_through = ?, updated_at = ? WHERE id = ?`).run(newNext, upd.paid_through, ts, d.student_id)
    enqueue('students', 'upsert', upd)
  })
  tx()
  return listPayments(ownerId, d.student_id)
}

export function dashboardStats(ownerId: string) {
  const active = (db.prepare(`SELECT COUNT(*) AS c FROM students WHERE owner_id = ? AND deleted_at IS NULL`).get(ownerId) as any).c
  const today = new Date().toISOString().slice(0, 10)
  const overdue = (db.prepare(`SELECT COUNT(*) AS c FROM students WHERE owner_id = ? AND deleted_at IS NULL AND next_fees_date IS NOT NULL AND next_fees_date < ?`).get(ownerId, today) as any).c
  const monthStart = today.slice(0, 7) + '-01'
  const revenue = (db.prepare(`SELECT COALESCE(SUM(amount), 0) AS s FROM payments WHERE owner_id = ? AND deleted_at IS NULL AND paid_on >= ?`).get(ownerId, monthStart) as any).s
  const staffPaid = (db.prepare(`SELECT COALESCE(SUM(amount), 0) AS s FROM staff_payments WHERE owner_id = ? AND deleted_at IS NULL AND paid_on >= ?`).get(ownerId, monthStart) as any).s
  return { active, overdue, revenue, staffPaid }
}

// =================== STAFF ===================

export function listStaff(ownerId: string, q?: string) {
  const sql = q
    ? `SELECT * FROM staff WHERE owner_id = ? AND deleted_at IS NULL AND (name LIKE ? OR role LIKE ? OR contact LIKE ?) ORDER BY name`
    : `SELECT * FROM staff WHERE owner_id = ? AND deleted_at IS NULL ORDER BY name`
  const params = q ? [ownerId, `%${q}%`, `%${q}%`, `%${q}%`] : [ownerId]
  return db.prepare(sql).all(...params)
}

export function getStaff(id: string) {
  return db.prepare(`SELECT * FROM staff WHERE id = ?`).get(id)
}

export function createStaff(ownerId: string, d: any) {
  const id = d.id ?? uuidv4()
  const ts = now()
  const row = {
    id, owner_id: ownerId,
    name: d.name,
    role: d.role ?? '',
    photo_path: d.photo_path ?? null,
    photo_remote_path: d.photo_remote_path ?? null,
    contact: d.contact ?? '',
    cnic: d.cnic ?? '',
    address: d.address ?? '',
    monthly_salary: d.monthly_salary ?? 0,
    joined_date: d.joined_date ?? null,
    notes: d.notes ?? '',
    created_at: ts, updated_at: ts, deleted_at: null,
  }
  db.prepare(`
    INSERT INTO staff (id, owner_id, name, role, photo_path, photo_remote_path, contact, cnic, address, monthly_salary, joined_date, notes, created_at, updated_at, deleted_at)
    VALUES (@id, @owner_id, @name, @role, @photo_path, @photo_remote_path, @contact, @cnic, @address, @monthly_salary, @joined_date, @notes, @created_at, @updated_at, @deleted_at)
  `).run(row)
  enqueue('staff', 'upsert', row)
  return getStaff(id)
}

export function updateStaff(ownerId: string, id: string, d: any) {
  const existing: any = getStaff(id)
  if (!existing || existing.owner_id !== ownerId) throw new Error('Not found')
  const ts = now()
  const row = { ...existing, ...d, id, owner_id: ownerId, updated_at: ts, deleted_at: null }
  db.prepare(`
    UPDATE staff SET
      name = @name, role = @role, photo_path = @photo_path, photo_remote_path = @photo_remote_path,
      contact = @contact, cnic = @cnic, address = @address, monthly_salary = @monthly_salary,
      joined_date = @joined_date, notes = @notes, updated_at = @updated_at
    WHERE id = @id AND owner_id = @owner_id
  `).run(row)
  enqueue('staff', 'upsert', row)
  return getStaff(id)
}

export function deleteStaff(ownerId: string, id: string) {
  const ts = now()
  db.prepare(`UPDATE staff SET deleted_at = ?, updated_at = ? WHERE id = ? AND owner_id = ?`).run(ts, ts, id, ownerId)
  enqueue('staff', 'delete', { id, owner_id: ownerId, deleted_at: ts, updated_at: ts })
  return true
}

export function listStaffPayments(ownerId: string, staffId: string) {
  return db.prepare(`SELECT * FROM staff_payments WHERE staff_id = ? AND owner_id = ? AND deleted_at IS NULL ORDER BY paid_on DESC`).all(staffId, ownerId)
}

export function recordStaffPayment(ownerId: string, d: any) {
  const id = d.id ?? uuidv4()
  const ts = now()
  const row = {
    id, owner_id: ownerId,
    staff_id: d.staff_id,
    amount: d.amount,
    paid_on: d.paid_on,
    kind: d.kind ?? 'advance',
    method: d.method ?? '',
    note: d.note ?? '',
    created_at: ts, updated_at: ts, deleted_at: null,
  }
  db.prepare(`
    INSERT INTO staff_payments (id, owner_id, staff_id, amount, paid_on, kind, method, note, created_at, updated_at, deleted_at)
    VALUES (@id, @owner_id, @staff_id, @amount, @paid_on, @kind, @method, @note, @created_at, @updated_at, @deleted_at)
  `).run(row)
  enqueue('staff_payments', 'upsert', row)
  return listStaffPayments(ownerId, d.staff_id)
}

export function upsertRemoteStaff(ownerId: string, remote: any) {
  const local: any = getStaff(remote.id)
  if (local && local.updated_at >= remote.updated_at) return
  db.prepare(`
    INSERT INTO staff (id, owner_id, name, role, photo_path, photo_remote_path, contact, cnic, address, monthly_salary, joined_date, notes, created_at, updated_at, deleted_at)
    VALUES (@id, @owner_id, @name, @role, @photo_path, @photo_remote_path, @contact, @cnic, @address, @monthly_salary, @joined_date, @notes, @created_at, @updated_at, @deleted_at)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name, role = excluded.role,
      photo_remote_path = excluded.photo_remote_path,
      contact = excluded.contact, cnic = excluded.cnic, address = excluded.address,
      monthly_salary = excluded.monthly_salary, joined_date = excluded.joined_date,
      notes = excluded.notes, updated_at = excluded.updated_at, deleted_at = excluded.deleted_at
  `).run({
    id: remote.id, owner_id: ownerId,
    name: remote.name, role: remote.role ?? '',
    photo_path: local?.photo_path ?? null,
    photo_remote_path: remote.photo_path ?? null,
    contact: remote.contact ?? '', cnic: remote.cnic ?? '', address: remote.address ?? '',
    monthly_salary: remote.monthly_salary ?? 0,
    joined_date: remote.joined_date ?? null,
    notes: remote.notes ?? '',
    created_at: remote.created_at, updated_at: remote.updated_at, deleted_at: remote.deleted_at,
  })
}

export function upsertRemoteStaffPayment(ownerId: string, remote: any) {
  const r = db.prepare(`SELECT updated_at FROM staff_payments WHERE id = ?`).get(remote.id) as any
  if (r && r.updated_at >= remote.updated_at) return
  db.prepare(`
    INSERT INTO staff_payments (id, owner_id, staff_id, amount, paid_on, kind, method, note, created_at, updated_at, deleted_at)
    VALUES (@id, @owner_id, @staff_id, @amount, @paid_on, @kind, @method, @note, @created_at, @updated_at, @deleted_at)
    ON CONFLICT(id) DO UPDATE SET
      amount = excluded.amount, paid_on = excluded.paid_on, kind = excluded.kind,
      method = excluded.method, note = excluded.note, updated_at = excluded.updated_at,
      deleted_at = excluded.deleted_at
  `).run({
    id: remote.id, owner_id: ownerId, staff_id: remote.staff_id,
    amount: remote.amount, paid_on: remote.paid_on, kind: remote.kind ?? 'advance',
    method: remote.method ?? '', note: remote.note ?? '',
    created_at: remote.created_at, updated_at: remote.updated_at, deleted_at: remote.deleted_at,
  })
}

export function outboxCount(): number {
  const r = db.prepare(`SELECT COUNT(*) AS c FROM outbox`).get() as any
  return r.c
}

export function outboxBatch(limit = 50) {
  return db.prepare(`SELECT * FROM outbox ORDER BY id ASC LIMIT ?`).all(limit) as any[]
}

export function outboxDelete(id: number) {
  db.prepare(`DELETE FROM outbox WHERE id = ?`).run(id)
}

export function outboxRetry(id: number, err: string) {
  db.prepare(`UPDATE outbox SET attempts = attempts + 1, last_error = ? WHERE id = ?`).run(err, id)
}

export function getSyncState(key: string): string | null {
  const r = db.prepare(`SELECT value FROM sync_state WHERE key = ?`).get(key) as any
  return r?.value ?? null
}

export function setSyncState(key: string, value: string) {
  db.prepare(`INSERT INTO sync_state(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(key, value)
}

export function upsertRemoteStudent(ownerId: string, remote: any) {
  const local: any = getStudent(remote.id)
  if (local && local.updated_at >= remote.updated_at) return
  db.prepare(`
    INSERT INTO students (id, owner_id, sr_no, photo_path, photo_remote_path, name, contact, time_table, fees, month, reg_fee_status, entry_date, next_fees_date, membership, paid_through, remaining, created_at, updated_at, deleted_at)
    VALUES (@id, @owner_id, @sr_no, @photo_path, @photo_remote_path, @name, @contact, @time_table, @fees, @month, @reg_fee_status, @entry_date, @next_fees_date, @membership, @paid_through, @remaining, @created_at, @updated_at, @deleted_at)
    ON CONFLICT(id) DO UPDATE SET
      sr_no = excluded.sr_no,
      photo_remote_path = excluded.photo_remote_path,
      name = excluded.name, contact = excluded.contact, time_table = excluded.time_table,
      fees = excluded.fees, month = excluded.month, reg_fee_status = excluded.reg_fee_status,
      entry_date = excluded.entry_date, next_fees_date = excluded.next_fees_date,
      membership = excluded.membership, paid_through = excluded.paid_through,
      remaining = excluded.remaining, updated_at = excluded.updated_at,
      deleted_at = excluded.deleted_at
  `).run({
    id: remote.id,
    owner_id: ownerId,
    sr_no: remote.sr_no ?? null,
    photo_path: local?.photo_path ?? null,
    photo_remote_path: remote.photo_path ?? null,
    name: remote.name,
    contact: remote.contact ?? '',
    time_table: remote.time_table ?? 'Evening',
    fees: remote.fees ?? 0,
    month: remote.month ?? '',
    reg_fee_status: remote.reg_fee_status ?? 'Nill',
    entry_date: remote.entry_date ?? null,
    next_fees_date: remote.next_fees_date ?? null,
    membership: remote.membership ?? 'Normal',
    paid_through: remote.paid_through ?? '',
    remaining: remote.remaining ?? 0,
    created_at: remote.created_at,
    updated_at: remote.updated_at,
    deleted_at: remote.deleted_at,
  })
}

export function upsertRemotePayment(ownerId: string, remote: any) {
  const r = db.prepare(`SELECT updated_at FROM payments WHERE id = ?`).get(remote.id) as any
  if (r && r.updated_at >= remote.updated_at) return
  db.prepare(`
    INSERT INTO payments (id, owner_id, student_id, amount, paid_on, method, note, created_at, updated_at, deleted_at)
    VALUES (@id, @owner_id, @student_id, @amount, @paid_on, @method, @note, @created_at, @updated_at, @deleted_at)
    ON CONFLICT(id) DO UPDATE SET
      amount = excluded.amount, paid_on = excluded.paid_on, method = excluded.method,
      note = excluded.note, updated_at = excluded.updated_at, deleted_at = excluded.deleted_at
  `).run({
    id: remote.id, owner_id: ownerId,
    student_id: remote.student_id,
    amount: remote.amount, paid_on: remote.paid_on,
    method: remote.method ?? '', note: remote.note ?? '',
    created_at: remote.created_at, updated_at: remote.updated_at, deleted_at: remote.deleted_at,
  })
}
