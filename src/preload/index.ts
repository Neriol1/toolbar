import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ChatConfig } from '../main/langchain'
import { TranslateParams } from '../main/langchain/agents/translate'

const api = {
  openByPath: (url: string) => ipcRenderer.invoke('open-by-path', url),
  searchOnBrowser: (url: string) => ipcRenderer.invoke('search-on-browser', url),
  getDefaultBrowserIcon: () => ipcRenderer.invoke('get-default-browser-icon'),
  searchAppsAndFiles: (searchTerm: string) => ipcRenderer.invoke('search-apps-and-files', searchTerm),
  execAction: (command: string) => ipcRenderer.invoke('exec-action', command),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  getCurrentShortcut: () => ipcRenderer.invoke('get-current-shortcut'),
  setShortcut: (shortcut: string) => ipcRenderer.invoke('set-shortcut', shortcut),
  setShortcutEnabled: (enabled: boolean) => ipcRenderer.invoke('set-shortcut-enabled', enabled),
  chatWithLlm: (content: string, config: ChatConfig) => ipcRenderer.invoke('chat-with-llm',content,config),
  on: (channel: string, callback: (event: any, ...args: any[]) => void) => ipcRenderer.on(channel, callback),
  off: (channel: string) => ipcRenderer.removeAllListeners(channel),
  translate: (text: TranslateParams, config: ChatConfig) => ipcRenderer.invoke('translate',text,config)
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