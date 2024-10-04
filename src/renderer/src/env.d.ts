/// <reference types="vite/client" />

interface SearchResult {
  type: 'app' | 'file' | 'search' | 'chat'
  title: string
  content?: string
  icon?: string
  action: string
}