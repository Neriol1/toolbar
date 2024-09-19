import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  openByPath: (url: string) => ipcRenderer.invoke('open-by-path', url),
  searchOnBrowser: (url: string) => ipcRenderer.invoke('search-on-browser', url),
  getDefaultBrowserIcon: () => ipcRenderer.invoke('get-default-browser-icon'),
  searchAppsAndFiles: (searchTerm: string) => ipcRenderer.invoke('search-apps-and-files', searchTerm),
  execAction: (command: string) => ipcRenderer.invoke('exec-action', command)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}