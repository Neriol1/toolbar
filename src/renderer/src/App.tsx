import { useState, useCallback, useEffect } from 'react'
import { Content } from './components/Content'
import { Search } from './components/Search'
import { debounce } from 'lodash-es'
import defaultBrowserIcon from '@renderer/assets/svg/browser.svg'

function App(): JSX.Element {
  const [searchText, setSearchText] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const [browserIcon, setBrowserIcon] = useState<string | null>('')
  useEffect(() => {
    window.api.getDefaultBrowserIcon().then(setBrowserIcon)
  }, [])

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.trim() !== '') {
        const results = await window.api.searchAppsAndFiles(term.trim())
        const browserItem = {
          type: 'search' as const,
          title: `open in browser: ${term}`,
          icon: browserIcon || defaultBrowserIcon,
          action: `https://www.google.com/search?q=${encodeURIComponent(term)}`
        }
        setSearchResults([...results, browserItem])
        setSelectedIndex(0)
      } else {
        setSearchResults([])
      }
    }, 300),
    [browserIcon]
  )

  const executeSelectedAction = useCallback(() => {
    const selectedResult = searchResults[selectedIndex]
    if (selectedResult) {
      selectedResult.type === 'app'
        ? window.api.execAction(selectedResult.action)
        : window.api.openPath(selectedResult.action)
    }
  }, [searchResults, selectedIndex])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : searchResults.length - 1))
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prevIndex) => (prevIndex < searchResults.length - 1 ? prevIndex + 1 : 0))
        break
      case 'Enter':
        executeSelectedAction()
        break
    }
  }, [searchResults.length, executeSelectedAction])

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
      <Search 
        searchText={searchText} 
        setSearchText={setSearchText} 
        onKeyDown={handleKeyDown}
      />
      <Content 
        searchResults={searchResults}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        executeSelectedAction={executeSelectedAction}
      />
    </div>
  )
}

export default App