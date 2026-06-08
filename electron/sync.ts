import { BrowserWindow, net } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { getSupabase } from './supabase.js'
import {
  getDb, outboxBatch, outboxDelete, outboxRetry, outboxCount,
  getSyncState, setSyncState,
  upsertRemoteStudent, upsertRemotePayment,
  upsertRemoteStaff, upsertRemoteStaffPayment,
} from './db.js'

let timer: NodeJS.Timeout | null = null
let running = false
let lastError: string | null = null

type Status = 'offline' | 'idle' | 'syncing' | 'error'

function broadcast(win: BrowserWindow | null, status: Status, pending: number, lastSyncedAt: string | null) {
  win?.webContents.send('sync:status', { status, pending, lastSyncedAt, lastError })
}

export function startSync(win: BrowserWindow | null, getOwnerId: () => string | null) {
  stopSync()
  const tick = async () => {
    const ownerId = getOwnerId()
    if (!ownerId) return
    if (running) return
    if (!net.isOnline()) {
      broadcast(win, 'offline', outboxCount(), getSyncState('last_synced_at'))
      return
    }
    running = true
    broadcast(win, 'syncing', outboxCount(), getSyncState('last_synced_at'))
    try {
      await pushOutbox(ownerId)
      await pullStudents(ownerId)
      await pullPayments(ownerId)
      await pullStaff(ownerId)
      await pullStaffPayments(ownerId)
      setSyncState('last_synced_at', new Date().toISOString())
      lastError = null
      broadcast(win, 'idle', outboxCount(), getSyncState('last_synced_at'))
    } catch (err: any) {
      lastError = err?.message ?? String(err)
      broadcast(win, 'error', outboxCount(), getSyncState('last_synced_at'))
    } finally {
      running = false
    }
  }
  tick()
  timer = setInterval(tick, 30_000)
  return tick
}

export function stopSync() {
  if (timer) { clearInterval(timer); timer = null }
}

async function uploadPhotoIfNeeded(ownerId: string, row: any): Promise<string | null> {
  if (!row.photo_path) return row.photo_remote_path ?? null
  if (row.photo_remote_path) return row.photo_remote_path
  if (!fs.existsSync(row.photo_path)) return row.photo_remote_path ?? null
  const ext = path.extname(row.photo_path) || '.jpg'
  const remotePath = `${ownerId}/${row.id}${ext}`
  const buf = fs.readFileSync(row.photo_path)
  const sb = getSupabase()
  const { error } = await sb.storage.from('student-photos').upload(remotePath, buf, {
    upsert: true,
    contentType: ext === '.png' ? 'image/png' : 'image/jpeg',
  })
  if (error) throw new Error(`photo upload: ${error.message}`)
  getDb().prepare(`UPDATE students SET photo_remote_path = ? WHERE id = ?`).run(remotePath, row.id)
  return remotePath
}

async function pushOutbox(ownerId: string) {
  const sb = getSupabase()
  const items = outboxBatch(100)
  for (const item of items) {
    try {
      const payload = JSON.parse(item.payload)
      if (item.entity === 'students') {
        if (item.op === 'upsert') {
          const photoRemote = await uploadPhotoIfNeeded(ownerId, payload)
          const remote = {
            id: payload.id, owner_id: ownerId,
            sr_no: payload.sr_no, name: payload.name, contact: payload.contact,
            time_table: payload.time_table, fees: payload.fees, month: payload.month,
            reg_fee_status: payload.reg_fee_status, entry_date: payload.entry_date,
            next_fees_date: payload.next_fees_date, membership: payload.membership,
            paid_through: payload.paid_through, remaining: payload.remaining,
            notes: payload.notes,
            photo_path: photoRemote,
            updated_at: payload.updated_at, deleted_at: payload.deleted_at,
          }
          const { error } = await sb.from('students').upsert(remote)
          if (error) throw error
        } else if (item.op === 'delete') {
          const { error } = await sb.from('students')
            .update({ deleted_at: payload.deleted_at, updated_at: payload.updated_at })
            .eq('id', payload.id)
          if (error) throw error
        }
      } else if (item.entity === 'payments') {
        if (item.op === 'upsert') {
          const remote = {
            id: payload.id, owner_id: ownerId, student_id: payload.student_id,
            amount: payload.amount, paid_on: payload.paid_on, method: payload.method,
            note: payload.note,
            updated_at: payload.updated_at, deleted_at: payload.deleted_at,
          }
          const { error } = await sb.from('payments').upsert(remote)
          if (error) throw error
        } else if (item.op === 'delete') {
          const { error } = await sb.from('payments')
            .update({ deleted_at: payload.deleted_at, updated_at: payload.updated_at })
            .eq('id', payload.id)
          if (error) throw error
        }
      } else if (item.entity === 'staff') {
        if (item.op === 'upsert') {
          const photoRemote = await uploadPhotoIfNeeded(ownerId, payload)
          const remote = {
            id: payload.id, owner_id: ownerId,
            name: payload.name, role: payload.role, contact: payload.contact,
            cnic: payload.cnic, address: payload.address,
            monthly_salary: payload.monthly_salary,
            joined_date: payload.joined_date,
            notes: payload.notes,
            photo_path: photoRemote,
            updated_at: payload.updated_at, deleted_at: payload.deleted_at,
          }
          const { error } = await sb.from('staff').upsert(remote)
          if (error) throw error
        } else if (item.op === 'delete') {
          const { error } = await sb.from('staff')
            .update({ deleted_at: payload.deleted_at, updated_at: payload.updated_at })
            .eq('id', payload.id)
          if (error) throw error
        }
      } else if (item.entity === 'staff_payments') {
        if (item.op === 'upsert') {
          const remote = {
            id: payload.id, owner_id: ownerId, staff_id: payload.staff_id,
            amount: payload.amount, paid_on: payload.paid_on,
            kind: payload.kind, method: payload.method, note: payload.note,
            updated_at: payload.updated_at, deleted_at: payload.deleted_at,
          }
          const { error } = await sb.from('staff_payments').upsert(remote)
          if (error) throw error
        } else if (item.op === 'delete') {
          const { error } = await sb.from('staff_payments')
            .update({ deleted_at: payload.deleted_at, updated_at: payload.updated_at })
            .eq('id', payload.id)
          if (error) throw error
        }
      }
      outboxDelete(item.id)
    } catch (err: any) {
      outboxRetry(item.id, err?.message ?? String(err))
      if (item.attempts >= 5) outboxDelete(item.id)
      throw err
    }
  }
}

async function pullStudents(ownerId: string) {
  const sb = getSupabase()
  const since = getSyncState('students_pulled_at') ?? '1970-01-01T00:00:00Z'
  const { data, error } = await sb.from('students')
    .select('*')
    .eq('owner_id', ownerId)
    .gt('updated_at', since)
    .order('updated_at', { ascending: true })
    .limit(500)
  if (error) throw error
  if (data && data.length) {
    for (const row of data) upsertRemoteStudent(ownerId, row)
    setSyncState('students_pulled_at', data[data.length - 1].updated_at)
  }
}

async function pullPayments(ownerId: string) {
  const sb = getSupabase()
  const since = getSyncState('payments_pulled_at') ?? '1970-01-01T00:00:00Z'
  const { data, error } = await sb.from('payments')
    .select('*')
    .eq('owner_id', ownerId)
    .gt('updated_at', since)
    .order('updated_at', { ascending: true })
    .limit(500)
  if (error) throw error
  if (data && data.length) {
    for (const row of data) upsertRemotePayment(ownerId, row)
    setSyncState('payments_pulled_at', data[data.length - 1].updated_at)
  }
}

async function pullStaff(ownerId: string) {
  const sb = getSupabase()
  const since = getSyncState('staff_pulled_at') ?? '1970-01-01T00:00:00Z'
  const { data, error } = await sb.from('staff')
    .select('*')
    .eq('owner_id', ownerId)
    .gt('updated_at', since)
    .order('updated_at', { ascending: true })
    .limit(500)
  if (error) throw error
  if (data && data.length) {
    for (const row of data) upsertRemoteStaff(ownerId, row)
    setSyncState('staff_pulled_at', data[data.length - 1].updated_at)
  }
}

async function pullStaffPayments(ownerId: string) {
  const sb = getSupabase()
  const since = getSyncState('staff_payments_pulled_at') ?? '1970-01-01T00:00:00Z'
  const { data, error } = await sb.from('staff_payments')
    .select('*')
    .eq('owner_id', ownerId)
    .gt('updated_at', since)
    .order('updated_at', { ascending: true })
    .limit(500)
  if (error) throw error
  if (data && data.length) {
    for (const row of data) upsertRemoteStaffPayment(ownerId, row)
    setSyncState('staff_payments_pulled_at', data[data.length - 1].updated_at)
  }
}

export async function getSignedPhotoUrl(remotePath: string): Promise<string | null> {
  const sb = getSupabase()
  const { data, error } = await sb.storage.from('student-photos').createSignedUrl(remotePath, 3600)
  if (error) return null
  return data?.signedUrl ?? null
}

export function statusSnapshot(): { pending: number; lastSyncedAt: string | null } {
  return { pending: outboxCount(), lastSyncedAt: getSyncState('last_synced_at') }
}
