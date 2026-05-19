import { app, BrowserWindow, ipcMain, dialog, nativeImage } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'

app.setName('Alpha Fitness')
import {
  initDb, listStudents, getStudent, createStudent, updateStudent, deleteStudent,
  savePhoto, listPayments, recordPayment, dashboardStats,
} from './db.js'
import { initSupabase, restoreSession, signIn, signUp, signOut } from './supabase.js'
import { startSync, stopSync, statusSnapshot, getSignedPhotoUrl } from './sync.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = !!process.env.VITE_DEV_SERVER_URL

const iconPath = path.join(__dirname, '../assets/build/icon.png')
const iconIcnsPath = path.join(__dirname, '../assets/build/icon.icns')

let win: BrowserWindow | null = null
let currentOwnerId: string | null = null
let triggerSync: (() => Promise<void>) | null = null

// Set dock icon on macOS as soon as app is ready
if (process.platform === 'darwin') {
  app.whenReady().then(() => {
    try {
      const img = nativeImage.createFromPath(fs.existsSync(iconIcnsPath) ? iconIcnsPath : iconPath)
      if (!img.isEmpty()) app.dock?.setIcon(img)
    } catch {}
  })
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1000,
    minHeight: 640,
    title: 'Alpha Fitness',
    icon: iconPath,
    backgroundColor: '#f5f4ef',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  if (isDev) win.loadURL(process.env.VITE_DEV_SERVER_URL!)
  else win.loadFile(path.join(__dirname, '../dist/index.html'))
}

function requireOwner(): string {
  if (!currentOwnerId) throw new Error('Not authenticated')
  return currentOwnerId
}

app.whenReady().then(async () => {
  initDb()
  initSupabase()
  createWindow()

  const session = await restoreSession().catch(() => null)
  if (session?.user) {
    currentOwnerId = session.user.id
    triggerSync = startSync(win, () => currentOwnerId)
  }

  win?.webContents.once('did-finish-load', () => {
    win?.webContents.send('auth:state', session?.user ? { id: session.user.id, email: session.user.email } : null)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  stopSync()
  if (process.platform !== 'darwin') app.quit()
})

// Auth
ipcMain.handle('auth:signIn', async (_e, email: string, password: string) => {
  const data = await signIn(email, password)
  currentOwnerId = data.user?.id ?? null
  if (currentOwnerId) triggerSync = startSync(win, () => currentOwnerId)
  return { id: data.user?.id, email: data.user?.email }
})

ipcMain.handle('auth:signUp', async (_e, email: string, password: string) => {
  const data = await signUp(email, password)
  currentOwnerId = data.user?.id ?? null
  if (currentOwnerId) triggerSync = startSync(win, () => currentOwnerId)
  return { id: data.user?.id, email: data.user?.email }
})

ipcMain.handle('auth:signOut', async () => {
  await signOut()
  currentOwnerId = null
  stopSync()
  return true
})

ipcMain.handle('auth:state', async () => {
  if (!currentOwnerId) return null
  return { id: currentOwnerId }
})

// Students
ipcMain.handle('students:list', (_e, q?: string) => listStudents(requireOwner(), q))
ipcMain.handle('students:get', (_e, id: string) => getStudent(id))
ipcMain.handle('students:create', async (_e, data) => {
  const s = createStudent(requireOwner(), data)
  triggerSync?.()
  return s
})
ipcMain.handle('students:update', async (_e, id, data) => {
  const s = updateStudent(requireOwner(), id, data)
  triggerSync?.()
  return s
})
ipcMain.handle('students:delete', async (_e, id) => {
  deleteStudent(requireOwner(), id)
  triggerSync?.()
  return true
})

// Photos
ipcMain.handle('photos:save', (_e, srcPath: string) => savePhoto(srcPath))
ipcMain.handle('photos:remoteUrl', (_e, remotePath: string) => getSignedPhotoUrl(remotePath))

// Payments
ipcMain.handle('payments:list', (_e, studentId: string) => listPayments(requireOwner(), studentId))
ipcMain.handle('payments:create', async (_e, data) => {
  const r = recordPayment(requireOwner(), data)
  triggerSync?.()
  return r
})

// Dashboard + sync
ipcMain.handle('dashboard:stats', () => dashboardStats(requireOwner()))
ipcMain.handle('sync:now', async () => { await triggerSync?.(); return statusSnapshot() })
ipcMain.handle('sync:status', () => statusSnapshot())

// Dialogs
ipcMain.handle('dialog:pickImage', async () => {
  const res = await dialog.showOpenDialog({
    title: 'Pick a photo', properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
  })
  if (res.canceled || !res.filePaths[0]) return null
  return res.filePaths[0]
})

ipcMain.handle('dialog:saveExcel', async (_e, defaultName: string) => {
  const res = await dialog.showSaveDialog({
    title: 'Export students', defaultPath: defaultName,
    filters: [{ name: 'Excel', extensions: ['xlsx'] }],
  })
  if (res.canceled || !res.filePath) return null
  return res.filePath
})

ipcMain.handle('files:writeBuffer', (_e, filePath: string, buffer: Uint8Array) => {
  fs.writeFileSync(filePath, Buffer.from(buffer))
  return true
})
