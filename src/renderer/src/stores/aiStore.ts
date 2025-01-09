import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AIPROVIDERS, getProvidersStorage } from '@renderer/lib/AiProviders'

interface AiState {
  providers: Record<AiProvider, AiProviderConfig>
  currentProvider: AiProvider
  currentModel: string
  currentBaseUrl: string
  currentApiKey: string
  setProviders: (providers: Record<AiProvider, AiProviderConfig>) => void
  setCurrentProvider: (provider: AiProvider) => void
  setCurrentModel: (model: string) => void
  setCurrentBaseUrl: (baseUrl: string) => void
  setCurrentApiKey: (apiKey: string) => void
  updateProviderConfig: (provider: AiProvider, config: Partial<AiProviderConfig>) => void
}

export const useAiStore = create<AiState>()(
  devtools(
    (set) => ({
      providers: getProvidersStorage(),
      currentProvider: localStorage.getItem('aiProvider') as AiProvider || 'ollama',
      currentModel: localStorage.getItem('aiModelName') || AIPROVIDERS.ollama.defaultModel,
      currentBaseUrl: localStorage.getItem('aiBaseUrl') || AIPROVIDERS.ollama.defaultBaseUrl,
      currentApiKey: localStorage.getItem('aiApiKey') || '',

      setProviders: (providers) => {
        localStorage.setItem('providers', JSON.stringify(providers))
        set({ providers }, false, 'setProviders')
      },

      setCurrentProvider: (provider) => {
        localStorage.setItem('aiProvider', provider)
        set({ currentProvider: provider }, false, 'setCurrentProvider')
      },

      setCurrentModel: (model) => {
        localStorage.setItem('aiModelName', model)
        set({ currentModel: model }, false, 'setCurrentModel')
      },

      setCurrentBaseUrl: (baseUrl) => {
        localStorage.setItem('aiBaseUrl', baseUrl)
        set({ currentBaseUrl: baseUrl }, false, 'setCurrentBaseUrl')
      },

      setCurrentApiKey: (apiKey) => {
        localStorage.setItem('aiApiKey', apiKey)
        set({ currentApiKey: apiKey }, false, 'setCurrentApiKey')
      },

      updateProviderConfig: (provider, config) => {
        set(
          (state) => {
            const newProviders = {
              ...state.providers,
              [provider]: {
                ...state.providers[provider],
                ...config
              }
            }
            localStorage.setItem('providers', JSON.stringify(newProviders))
            return { providers: newProviders }
          },
          false,
          'updateProviderConfig'
        )
      }
    }),
    {
      name: 'AI Store'
    }
  )
) 