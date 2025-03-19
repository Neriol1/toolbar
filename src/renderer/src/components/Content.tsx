import { useRef, useEffect, useCallback } from 'react'
import { ContentItem } from './ContentItem'
import { useEnter } from '../hooks/useEnter'
import { useSearchStore } from '../stores/searchStore'

export const Content = () => {
  const contentRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const { enter } = useEnter()
  const { searchResults, selectedIndex, setSelectedIndex } = useSearchStore()

  const scrollToSelectedItem = useCallback(() => {
    const container = contentRef.current
    const selectedItem = itemRefs.current[selectedIndex]
    if (container && selectedItem) {
      const containerRect = container.getBoundingClientRect()
      const selectedItemRect = selectedItem.getBoundingClientRect()

      if (selectedItemRect.bottom > containerRect.bottom) {
        container.scrollTop += selectedItemRect.bottom - containerRect.bottom
      } else if (selectedItemRect.top < containerRect.top) {
        container.scrollTop -= containerRect.top - selectedItemRect.top
      }
    }
  }, [selectedIndex])

  const onClick = (index: number) => {
    setSelectedIndex(index)
    enter()
  }

  useEffect(() => {
    scrollToSelectedItem()
  }, [scrollToSelectedItem])

  return (
    <main ref={contentRef} className="p-3 bg-gray-200 max-h-80 overflow-y-auto overflow-x-clip">
      {searchResults.map((result, index) => (
        <ContentItem
          key={index}
          ref={(el) => (itemRefs.current[index] = el)}
          {...result}
          isSelected={index === selectedIndex}
          onClick={() => onClick(index)}
        />
      ))}
    </main>
  )
}