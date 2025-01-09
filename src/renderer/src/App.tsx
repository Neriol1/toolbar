import { useState, useCallback, useEffect } from 'react'
import { Content } from './components/Content'
import { Search } from './components/Search'
import { debounce } from 'lodash-es'
import defaultBrowserIcon from '@renderer/assets/svg/browser.svg'
import ollamaIcon from '@renderer/assets/svg/ollama.svg'
import {Settings} from './components/Settings'
import { Chat } from './components/Chat'
import { useAiStore } from '@renderer/stores/aiStore'
import { useChatStore } from './stores/chatStore'
import { useNavigationStore } from './stores/navigationStore'

function App(): JSX.Element {
  const [searchText, setSearchText] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const { currentPage, pushPage, popPage } = useNavigationStore()

  const [isChatWithAi, setIsChatWithAi] = useState(false)
  const [isShowSettings, setShowSettings] = useState(false)

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.trim() !== '') {
        const results = await window.api.searchAppsAndFiles(term.trim())
        const browserItem = {
          type: 'search' as const,
          title: `open in browser: ${term}`,
          icon: defaultBrowserIcon,
          action: `https://www.google.com/search?q=${encodeURIComponent(term)}`
        }
        const result = [browserItem, ...results]

        if (term === 'chat') {
          const chatItem: SearchResult = {
            type: 'chat',
            title: 'chat to ai',
            icon: ollamaIcon,
            action: ''
          }
          result.unshift(chatItem)
        }
        setSearchResults(result)
        setSelectedIndex(0)
      } else {
        setSearchResults([])
      }
    }, 300),
    []
  )

  const executeSelectedAction = useCallback(async () => {
    if (currentPage === 'chat') {
      if (!searchText.trim()) return

      const { currentProvider, providers, currentModel, currentBaseUrl, currentApiKey } = useAiStore.getState()
      const { addMessage, updateLastMessage, setLoading } = useChatStore.getState()

      if (providers[currentProvider].needApiKey && !currentApiKey) {
        addMessage({ role: 'user', content: searchText })
        addMessage({ role: 'assistant', content: '错误: 请先在设置中配置 API Key' })
        return
      }

      const config: ChatConfig = {
        provider: currentProvider,
        modelName: currentModel,
        baseUrl: currentBaseUrl,
        apiKey: currentApiKey
      }

      try {
        const userMessage = searchText
        setSearchText('')
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
    } else {
      const selectedResult = searchResults[selectedIndex]
      if (selectedResult) {
        switch (selectedResult.type) {
          case 'app':
            window.api.execAction(selectedResult.action)
            break
          case 'file':
            window.api.openByPath(selectedResult.action)
            break
          case 'search':
            window.api.searchOnBrowser(selectedResult.action)
            break
          case 'chat':
            handleChatStart()
            setSearchText('')
            break
        }
      }
    }
  }, [searchResults, selectedIndex, searchText, currentPage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : searchResults.length - 1
          )
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prevIndex) =>
            prevIndex < searchResults.length - 1 ? prevIndex + 1 : 0
          )
          break
        case 'Enter':
          executeSelectedAction()
          break
        case 'Escape':
          if (isChatWithAi) {
            setIsChatWithAi(false)
          } else {
            window.api.hideWindow()
          }
          break
      }
    },
    [searchResults.length, executeSelectedAction, isChatWithAi]
  )

  const handleBack = () => {
    const previousPage = popPage()
    if (!previousPage) return

    switch (previousPage) {
      case 'search':
        setIsChatWithAi(false)
        setShowSettings(false)
        break
      case 'chat':
        setIsChatWithAi(true)
        setShowSettings(false)
        break
      case 'settings':
        setShowSettings(true)
        break
    }
  }

  const handleSettingsClick = () => {
    pushPage('settings')
    setShowSettings(true)
  }

  const handleChatStart = () => {
    pushPage('chat')
    setIsChatWithAi(true)
  }

  useEffect(() => {
    if(isChatWithAi){
      return
    }
    debouncedSearch(searchText)
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchText, debouncedSearch,isChatWithAi])

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [])

  return (
    <div className="drag rounded-lg overflow-hidden">
      

      {currentPage === 'settings' && <Settings />}
      {currentPage === 'chat' && <Chat />}
      
      <Search
        isChatWithAi={currentPage === 'chat'}
        searchText={searchText}
        setSearchText={setSearchText}
        onKeyDown={handleKeyDown}
        onBack={handleBack}
        isShowSettings={currentPage === 'settings'}
        onSettingsClick={handleSettingsClick}
      />

      {currentPage === 'search' && searchText !== '' && (
        <Content
          searchResults={searchResults}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          executeSelectedAction={executeSelectedAction}
        />
      )}
    </div>
  )
}

export default App
