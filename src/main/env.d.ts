
interface ImportMetaEnv {
  readonly VITE_SERPAPI_KEY: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}