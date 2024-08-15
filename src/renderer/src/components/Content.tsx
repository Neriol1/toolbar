import { useRef, useEffect } from 'react'
import { ContentItem } from './ContentItem'

interface ContentProps {
  searchResults: SearchResult[]
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  executeSelectedAction: () => void
}

interface SearchResult {
  type: 'app' | 'file'
  title: string
  content?: string
  icon?: string
  action: string
}

export const Content = ({ searchResults, selectedIndex, setSelectedIndex, executeSelectedAction }: ContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (contentRef.current && itemRefs.current[selectedIndex]) {
      const container = contentRef.current
      const selectedItem = itemRefs.current[selectedIndex]

      const containerRect = container.getBoundingClientRect()
      const selectedItemRect = selectedItem.getBoundingClientRect()

      if (selectedItemRect.bottom > containerRect.bottom) {
        container.scrollTop += selectedItemRect.bottom - containerRect.bottom
      } else if (selectedItemRect.top < containerRect.top) {
        container.scrollTop -= containerRect.top - selectedItemRect.top
      }
    }
  }, [selectedIndex])

  return (
    <main ref={contentRef} className="p-3 bg-gray-200 max-h-80 overflow-y-scroll overflow-x-clip">
      {searchResults.map((result, index) => (
        <div
          key={index}
          ref={(el) => (itemRefs.current[index] = el)}
        >
          <ContentItem
            title={result.title}
            content={result.type === 'file' ? result.content : 'Application'}
            icon={result.icon}
            isSelected={index === selectedIndex}
            onClick={() => {
              setSelectedIndex(index)
              executeSelectedAction()
            }}
          />
        </div>
      ))}
    </main>
  )
}