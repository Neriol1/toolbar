/// <reference types="vite/client" />

interface SearchResult {
  type: 'app' | 'file' | 'search' | 'chat' | 'translate'
  title: string
  content?: string
  icon?: string
  action: string | Function
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

interface TranslateSentence {
  text: string
  meanings:string
}
interface TranslateWord {
  text: string
  meanings: {pos:string,meaning:string}[]
}
type TranslateTextType = 'word' | 'sentence' | 'invalid' 

type TranslateResponse = {
  type: 'word' | 'sentence' | 'invalid'  | 'error'
  meanings: string | {pos:string,meaning:string}[]
}