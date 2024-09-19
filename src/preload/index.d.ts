import { ElectronAPI } from '@electron-toolkit/preload'

interface Api {
  openByPath: (url: string) => Promise<void>;
  searchOnBrowser: (url: string) => Promise<void>;
  getDefaultBrowserIcon: () => Promise<string | null>;
  searchAppsAndFiles:(searchTerm: string) => Promise<SearchResult[]>;
  execAction: (command: string) => void;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
