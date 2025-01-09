export const AIPROVIDERS: Record<AiProvider, AiProviderConfig> = {
  openai: {
    label: 'OpenAI',
    defaultModel: 'gpt-3.5-turbo',
    models: ['gpt-3.5-turbo','gpt-4o'],
    defaultBaseUrl: 'https://api.openai.com/v1',
    needApiKey: true
  },
  deepseek: {
    label: 'Deepseek',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat'],
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    needApiKey: true
  },
  ollama: {
    label: 'Ollama',
    defaultModel: 'llama3.1',
    models: ['llama3.1','qwen2.5'],
    defaultBaseUrl: 'http://localhost:11434',
    needApiKey: false
  }
}

export const initProvidersStorage = () => {
  const storages = localStorage.getItem('providers')
  if(storages) {
    return
  }else{
    localStorage.setItem('providers',JSON.stringify(AIPROVIDERS))
    return AIPROVIDERS
  }
}

export const getProvidersStorage = () => {
  const storages = localStorage.getItem('providers')
  if(storages) {
    return JSON.parse(storages) as Record<AiProvider, AiProviderConfig>
  }else{
    return AIPROVIDERS
  }
}