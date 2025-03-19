import { useNavigation } from './useNavigation'
import { useSearchStore } from '../stores/searchStore'
import { useInputStore } from '../stores/inputStore'
import { useAiStore } from '../stores/aiStore'
import { useChatStore } from '../stores/chatStore'

export const useEnter = () => {
  const { location } = useNavigation()
  const { searchResults, selectedIndex } = useSearchStore()
  const { setText } = useInputStore()
  const { text } = useInputStore()

  const onChatEnter = async () => {
    if (!text.trim()) return

    const { getChatConfig, validateLLMCanUse } = useAiStore.getState()
    const { addMessage, updateLastMessage, setLoading } = useChatStore.getState()

    if (!validateLLMCanUse()) {
      addMessage({ role: 'user', content: text })
      addMessage({ role: 'assistant', content: '错误: 请先在设置中配置 API Key' })
      return
    }

    const config: ChatConfig = getChatConfig()

    try {
      const userMessage = text
      setText('')
      addMessage({ role: 'user', content: userMessage })
      addMessage({ role: 'assistant', content: '' })
      setLoading(true)

      window.api.off('llm-chunk')
      window.api.on('llm-chunk', (_event, chunk) => {
        updateLastMessage(chunk)
      })

      const result = await window.api.chatWithLlm(userMessage, config)
      setLoading(false)

      if (result === 'error') {
        return
      }
    } catch (error) {
      setLoading(false)
      updateLastMessage('与 AI 服务器通信时发生错误，请检查网络连接')
    }
  }

  const enter = () => {
    const currentPage = location.pathname
    if (currentPage === '/chat') {
      onChatEnter()
    } else {
      const selectedResult = searchResults[selectedIndex]
      if (selectedResult) {
        switch (selectedResult.type) {
          case 'app':
            window.api.execAction(selectedResult.action as string)
            break
          case 'file':
            window.api.openByPath(selectedResult.action as string)
            break
          case 'search':
            window.api.searchOnBrowser(selectedResult.action as string)
            break
          default:
            const fn = selectedResult.action as Function
            fn()
            setText('')
            break
        }
      }
    }
  }

  return { enter }
}
