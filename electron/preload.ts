import { contextBridge, ipcRenderer } from 'electron'

const api = {
  auth: {
    signIn: (email: string, password: string) => ipcRenderer.invoke('auth:signIn', email, password),
    signUp: (email: string, password: string) => ipcRenderer.invoke('auth:signUp', email, password),
    signOut: () => ipcRenderer.invoke('auth:signOut'),
    state: () => ipcRenderer.invoke('auth:state'),
    onStateChange: (cb: (user: any) => void) => {
      const handler = (_e: any, user: any) => cb(user)
      ipcRenderer.on('auth:state', handler)
      return () => ipcRenderer.off('auth:state', handler)
    },
  },
  students: {
    list: (q?: string) => ipcRenderer.invoke('students:list', q),
    get: (id: string) => ipcRenderer.invoke('students:get', id),
    create: (data: any) => ipcRenderer.invoke('students:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('students:update', id, data),
    remove: (id: string) => ipcRenderer.invoke('students:delete', id),
  },
  payments: {
    list: (studentId: string) => ipcRenderer.invoke('payments:list', studentId),
    create: (data: any) => ipcRenderer.invoke('payments:create', data),
  },
  photos: {
    save: (srcPath: string) => ipcRenderer.invoke('photos:save', srcPath),
    remoteUrl: (remotePath: string) => ipcRenderer.invoke('photos:remoteUrl', remotePath),
  },
  dialog: {
    pickImage: () => ipcRenderer.invoke('dialog:pickImage'),
    saveExcel: (defaultName: string) => ipcRenderer.invoke('dialog:saveExcel', defaultName),
  },
  files: { writeBuffer: (p: string, b: Uint8Array) => ipcRenderer.invoke('files:writeBuffer', p, b) },
  dashboard: { stats: () => ipcRenderer.invoke('dashboard:stats') },
  sync: {
    now: () => ipcRenderer.invoke('sync:now'),
    status: () => ipcRenderer.invoke('sync:status'),
    onStatus: (cb: (s: any) => void) => {
      const handler = (_e: any, s: any) => cb(s)
      ipcRenderer.on('sync:status', handler)
      return () => ipcRenderer.off('sync:status', handler)
    },
  },
}

contextBridge.exposeInMainWorld('api', api)
export type Api = typeof api
