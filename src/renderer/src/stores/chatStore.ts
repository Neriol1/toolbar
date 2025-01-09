import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface ChatState {
  messages: Message[]
  loading: boolean
  currentResponse: string
  addMessage: (message: Message) => void
  updateLastMessage: (chunk: string) => void
  setLoading: (loading: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      messages: [],
      loading: false,
      currentResponse: '',

      addMessage: (message) => 
        set(
          (state) => ({ 
            messages: [...state.messages, message],
            currentResponse: ''
          }),
          false,
          'addMessage'
        ),

      updateLastMessage: (chunk) => 
        set(
          (state) => {
            const messages = [...state.messages]
            const lastMessage = messages[messages.length - 1]
            if (lastMessage) {
              state.currentResponse += chunk
              lastMessage.content = state.currentResponse
            }
            return { messages, currentResponse: state.currentResponse }
          },
          false,
          'updateLastMessage'
        ),

      setLoading: (loading) => 
        set(
          { loading },
          false,
          'setLoading'
        ),

      clearMessages: () => 
        set(
          { messages: [], currentResponse: '' },
          false,
          'clearMessages'
        )
    }),
    {
      name: 'Chat Store'
    }
  )
) 