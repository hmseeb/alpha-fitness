import { contextBridge, ipcRenderer } from 'electron'

const api = {
  students: {
    list: (q?: string) => ipcRenderer.invoke('students:list', q),
    get: (id: number) => ipcRenderer.invoke('students:get', id),
    create: (data: any) => ipcRenderer.invoke('students:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('students:update', id, data),
    remove: (id: number) => ipcRenderer.invoke('students:delete', id),
  },
  payments: {
    list: (studentId: number) => ipcRenderer.invoke('payments:list', studentId),
    create: (data: any) => ipcRenderer.invoke('payments:create', data),
  },
  photos: {
    save: (srcPath: string) => ipcRenderer.invoke('photos:save', srcPath),
  },
  dialog: {
    pickImage: () => ipcRenderer.invoke('dialog:pickImage'),
    saveExcel: (defaultName: string) => ipcRenderer.invoke('dialog:saveExcel', defaultName),
  },
  files: {
    writeBuffer: (filePath: string, buffer: Uint8Array) => ipcRenderer.invoke('files:writeBuffer', filePath, buffer),
  },
  dashboard: {
    stats: () => ipcRenderer.invoke('dashboard:stats'),
  },
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
