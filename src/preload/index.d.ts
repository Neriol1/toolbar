import { ElectronAPI } from '@electron-toolkit/preload'
import { TranslateResponse, TranslateParams } from '../main/langchain/agents/translate'

interface Api {
  openByPath: (url: string) => Promise<void>;
  searchOnBrowser: (url: string) => Promise<void>;
  getDefaultBrowserIcon: () => Promise<string | null>;
  searchAppsAndFiles:(searchTerm: string) => Promise<SearchResult[]>;
  execAction: (command: string) => void;
  hideWindow: () => void;
  getCurrentShortcut: () => Promise<string>
  setShortcut: (shortcut: string) => Promise<boolean>
  setShortcutEnabled: (enable: boolean) => void
  chatWithLlm: (content: string, config: ChatConfig) => Promise<string>
  on: (channel: 'llm-chunk', callback: (event: any, chunk: string) => void) => void
  off: (channel: 'llm-chunk') => void
  translate: (text: TranslateParams, config: ChatConfig) => TranslateResponse
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
