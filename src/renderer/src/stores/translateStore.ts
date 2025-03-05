import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useAiStore } from './aiStore'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from "immer"
enableMapSet()

type LanguageType = string

type TranslateState =  {
  targetLanguage: LanguageType
  setTargetLanguage: (targetLanguage: LanguageType) => void
  sourceLanguage: LanguageType
  setSourceLanguage: (sourceLanguage: LanguageType) => void
  currentResponse?: TranslateResponse
  loading: boolean
  setLoading: (loading: boolean) => void
  history: Map<string, number>
  addHistory: (text: string) => void
  input:string
  setInput: (input:string) => void
  setCurrentResponse: (currentResponse: TranslateResponse) => void
  clearCurrentResponse: () => void
}

export const useTranslateStore = create<TranslateState>()(
  devtools(
    immer(
      (set, get) => ({
        targetLanguage: 'en',
        sourceLanguage: 'zh',
        input:'',
        currentResponse: undefined,
        history: new Map(),
        loading: false,

        setSourceLanguage: (sourceLanguage) => 
          set(state => {
            state.sourceLanguage = sourceLanguage
          }, false, 'setSourceLanguage'),

        setTargetLanguage: (targetLanguage) => 
          set(state => {
            state.targetLanguage = targetLanguage
          }, false, 'setTargetLanguage'),

        setLoading: (loading) => set({ loading }, false, 'setLoading'),

        addHistory: (text) => set((state)=>{
          const count = state.history.get(text) || 0
          state.history.set(text, count + 1)
        }, false, 'addHistory'),

        setInput: async (input) => {
          set({ input }, false, 'setInput')
          get().setLoading(true)

          const { currentProvider, providers, currentModel, currentBaseUrl, currentApiKey } = useAiStore.getState()

          if (providers[currentProvider].needApiKey && !currentApiKey) {
            get().setLoading(false)
            return
          }
            
          const config: ChatConfig = {
            provider: currentProvider,
            modelName: currentModel,
            baseUrl: currentBaseUrl,
            apiKey: currentApiKey
          }
          try {
            const res = await window.api.translate(
              {
                text:input,
                targetLang:get().targetLanguage,
              },
              config
            )
            set(state => {
               state.currentResponse = res
              if(res.type === 'word'){
                state.history.set(input, (state.history.get(input) || 0) + 1)
              }
            }, false, 'setTranslateResult')
            console.log(get().history,'--------');
            console.log(res);
            
          } catch (error) {
            console.log(error);
          } finally {
            get().setLoading(false)
          }
        },
        setCurrentResponse: (currentResponse) => set({ currentResponse }, false, 'setCurrentResponse'),
        clearCurrentResponse: () => set({ currentResponse: undefined }, false, 'clearCurrentResponse')
      })
    ),
    { name: 'TranslateStore' }
  )
)