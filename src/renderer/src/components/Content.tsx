import { useState, useEffect, useCallback } from 'react'
import { ContentItem } from './ContentItem'
import { debounce } from 'lodash-es'

interface ContentProps {
  searchText: string
}

interface SearchResult {
  type: 'app' | 'file'
  title: string
  content?: string
  icon?: string
}

export const Content = ({ searchText }: ContentProps) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.trim() !== '') {
        const results = await window.api.searchAppsAndFiles(term.trim())
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    }, 300),
    []
  )

  useEffect(() => {
    debouncedSearch(searchText)

    // 清理函数
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchText, debouncedSearch])

  return (
    <main className="p-3 bg-gray-200 max-h-80 overflow-y-scroll overflow-x-clip">
      {searchResults.map((result, index) => (
        <ContentItem
          key={index}
          title={result.title}
          content={result.type === 'file' ? result.content : 'Application'}
          icon={result.icon}
          onClick={() => {
            if (result.type === 'app') {
              // 打开应用
            } else if (result.type === 'file') {
              window.api.openExternal(`file://${result.content}`)
            }
          }}
        />
      ))}
    </main>
  )
}