/// <reference types="vite/client" />

interface SearchResult {
  type: 'app' | 'file' | 'search'
  title: string
  content?: string
  icon?: string
  action: string
}