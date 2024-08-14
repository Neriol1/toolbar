import { ElectronAPI } from '@electron-toolkit/preload'

interface Api {
  openExternal: (url: string) => Promise<void>;
  getDefaultBrowserIcon: () => Promise<string | null>;
  searchAppsAndFiles:(searchTerm: string) => Promise<SearchResult[]>;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
