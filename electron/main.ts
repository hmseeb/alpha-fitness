import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { initDb, listStudents, getStudent, createStudent, updateStudent, deleteStudent, savePhoto, listPayments, recordPayment, dashboardStats } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isDev = !!process.env.VITE_DEV_SERVER_URL

let win: BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1000,
    minHeight: 640,
    title: 'Alpha Fitness Jampur',
    backgroundColor: '#f8fafc',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL!)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  initDb()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('students:list', (_e, q?: string) => listStudents(q))
ipcMain.handle('students:get', (_e, id: number) => getStudent(id))
ipcMain.handle('students:create', (_e, data) => createStudent(data))
ipcMain.handle('students:update', (_e, id, data) => updateStudent(id, data))
ipcMain.handle('students:delete', (_e, id) => deleteStudent(id))
ipcMain.handle('photos:save', (_e, srcPath: string) => savePhoto(srcPath))
ipcMain.handle('payments:list', (_e, studentId: number) => listPayments(studentId))
ipcMain.handle('payments:create', (_e, data) => recordPayment(data))
ipcMain.handle('dashboard:stats', () => dashboardStats())

ipcMain.handle('dialog:pickImage', async () => {
  const res = await dialog.showOpenDialog({
    title: 'Pick a photo',
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
  })
  if (res.canceled || !res.filePaths[0]) return null
  return res.filePaths[0]
})

ipcMain.handle('dialog:saveExcel', async (_e, defaultName: string) => {
  const res = await dialog.showSaveDialog({
    title: 'Export students',
    defaultPath: defaultName,
    filters: [{ name: 'Excel', extensions: ['xlsx'] }],
  })
  if (res.canceled || !res.filePath) return null
  return res.filePath
})

ipcMain.handle('files:writeBuffer', (_e, filePath: string, buffer: Uint8Array) => {
  fs.writeFileSync(filePath, Buffer.from(buffer))
  return true
})
