import { useState, useCallback, useEffect } from 'react'
import { Content } from './components/Content'
import { Search } from './components/Search'
import { debounce } from 'lodash-es'

interface SearchResult {
  type: 'app' | 'file'
  title: string
  content?: string
  icon?: string
  action: string
}

function App(): JSX.Element {
  const [searchText, setSearchText] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.trim() !== '') {
        const results = await window.api.searchAppsAndFiles(term.trim())
        setSearchResults(results)
        setSelectedIndex(0)
      } else {
        setSearchResults([])
      }
    }, 300),
    []
  )

  useEffect(() => {
    debouncedSearch(searchText)
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchText, debouncedSearch])

  const executeSelectedAction = useCallback(() => {
    if (searchResults.length > 0) {
      const selectedResult = searchResults[selectedIndex]
      if (selectedResult.type === 'app') {
        window.api.execAction(selectedResult.action)
      } else if (selectedResult.type === 'file') {
        window.api.openExternal(`file://${selectedResult.content}`)
      }
    }
  }, [searchResults, selectedIndex])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    switch (e.key) {
      case 'ArrowUp':
        setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : searchResults.length - 1))
        break
      case 'ArrowDown':
        setSelectedIndex((prevIndex) => (prevIndex < searchResults.length - 1 ? prevIndex + 1 : 0))
        break
      case 'Enter':
        executeSelectedAction()
        break
    }
  }, [searchResults.length, executeSelectedAction])

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