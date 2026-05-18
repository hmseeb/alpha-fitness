import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'

let db: Database.Database

export function initDb() {
  const userData = app.getPath('userData')
  const dbPath = path.join(userData, 'alpha-fitness.db')
  const photosDir = path.join(userData, 'photos')
  fs.mkdirSync(photosDir, { recursive: true })
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sr_no INTEGER,
      photo_path TEXT,
      name TEXT NOT NULL,
      contact TEXT,
      time_table TEXT DEFAULT 'Evening',
      fees INTEGER DEFAULT 0,
      month TEXT,
      reg_fee_status TEXT DEFAULT 'Nill',
      entry_date TEXT,
      next_fees_date TEXT,
      membership TEXT DEFAULT 'Normal',
      paid_through TEXT,
      remaining INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      paid_on TEXT NOT NULL,
      method TEXT,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `)
}

export function listStudents(q?: string) {
  const sql = q
    ? `SELECT * FROM students WHERE name LIKE ? OR contact LIKE ? ORDER BY sr_no DESC, id DESC`
    : `SELECT * FROM students ORDER BY sr_no DESC, id DESC`
  const params = q ? [`%${q}%`, `%${q}%`] : []
  return db.prepare(sql).all(...params)
}

export function getStudent(id: number) {
  return db.prepare(`SELECT * FROM students WHERE id = ?`).get(id)
}

export function createStudent(d: any) {
  const stmt = db.prepare(`
    INSERT INTO students (sr_no, photo_path, name, contact, time_table, fees, month, reg_fee_status, entry_date, next_fees_date, membership, paid_through, remaining)
    VALUES (@sr_no, @photo_path, @name, @contact, @time_table, @fees, @month, @reg_fee_status, @entry_date, @next_fees_date, @membership, @paid_through, @remaining)
  `)
  const info = stmt.run({
    sr_no: d.sr_no ?? nextSrNo(),
    photo_path: d.photo_path ?? null,
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
  })
  return getStudent(info.lastInsertRowid as number)
}

function nextSrNo(): number {
  const row = db.prepare(`SELECT COALESCE(MAX(sr_no), 0) + 1 AS next FROM students`).get() as any
  return row.next
}

export function updateStudent(id: number, d: any) {
  db.prepare(`
    UPDATE students SET
      sr_no = @sr_no,
      photo_path = @photo_path,
      name = @name,
      contact = @contact,
      time_table = @time_table,
      fees = @fees,
      month = @month,
      reg_fee_status = @reg_fee_status,
      entry_date = @entry_date,
      next_fees_date = @next_fees_date,
      membership = @membership,
      paid_through = @paid_through,
      remaining = @remaining
    WHERE id = @id
  `).run({ ...d, id })
  return getStudent(id)
}

export function deleteStudent(id: number) {
  db.prepare(`DELETE FROM students WHERE id = ?`).run(id)
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

export function listPayments(studentId: number) {
  return db.prepare(`SELECT * FROM payments WHERE student_id = ? ORDER BY paid_on DESC, id DESC`).all(studentId)
}

export function recordPayment(d: any) {
  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO payments (student_id, amount, paid_on, method, note)
      VALUES (@student_id, @amount, @paid_on, @method, @note)
    `).run({
      student_id: d.student_id,
      amount: d.amount,
      paid_on: d.paid_on,
      method: d.method ?? '',
      note: d.note ?? '',
    })
    const s: any = getStudent(d.student_id)
    if (s?.next_fees_date) {
      const dt = new Date(s.next_fees_date)
      dt.setMonth(dt.getMonth() + 1)
      const newNext = dt.toISOString().slice(0, 10)
      db.prepare(`UPDATE students SET next_fees_date = ?, paid_through = ? WHERE id = ?`).run(newNext, d.method ?? s.paid_through, d.student_id)
    }
  })
  tx()
  return listPayments(d.student_id)
}

export function dashboardStats() {
  const active = (db.prepare(`SELECT COUNT(*) AS c FROM students`).get() as any).c
  const today = new Date().toISOString().slice(0, 10)
  const overdue = (db.prepare(`SELECT COUNT(*) AS c FROM students WHERE next_fees_date IS NOT NULL AND next_fees_date < ?`).get(today) as any).c
  const monthStart = today.slice(0, 7) + '-01'
  const revenue = (db.prepare(`SELECT COALESCE(SUM(amount), 0) AS s FROM payments WHERE paid_on >= ?`).get(monthStart) as any).s
  return { active, overdue, revenue }
}
