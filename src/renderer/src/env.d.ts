/// <reference types="vite/client" />

interface SearchResult {
  type: 'app' | 'file' | 'search' | 'chat'
  title: string
  content?: string
  icon?: string
  action: string
}
type AiProvider = 'openai' | 'deepseek' | 'ollama'

interface AiProviderConfig {
  label: string
  defaultModel: string
  models: string[]
  defaultBaseUrl: string
  apiKey?:string
  needApiKey: boolean
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatConfig {
  provider: string
  modelName: string
  baseUrl: string
  apiKey?: string
} 