import { useState, useCallback, useEffect } from 'react'
import { Content } from './components/Content'
import { Search } from './components/Search'
import { debounce } from 'lodash-es'
import defaultBrowserIcon from '@renderer/assets/svg/browser.svg'
import ollamaIcon from '@renderer/assets/svg/ollama.svg'
import { motion } from 'framer-motion'

function App(): JSX.Element {
  const [searchText, setSearchText] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])


  const [isChatWithAi, setIsChatWithAi] = useState(false)

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

  const executeSelectedAction = useCallback(() => {
    if (isChatWithAi) {
      console.log('chat with ai') 
      console.log(searchText)
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
            setIsChatWithAi(true)
            setSearchText('')
            break
        }
      }
    }
  }, [searchResults, selectedIndex])

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

  useEffect(() => {
    debouncedSearch(searchText)
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchText, debouncedSearch])

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
      {isChatWithAi && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 400 }}
          className="bg-white w-full"
        >
          11111
        </motion.div>
      )}

      <Search
        isChatWithAi={isChatWithAi}
        searchText={searchText}
        setSearchText={setSearchText}
        onKeyDown={handleKeyDown}
        onBack={() => {
          setIsChatWithAi(false)
        }}
      />

      {!isChatWithAi && searchText !== '' && (
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
