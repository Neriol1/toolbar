import { useEffect, useState } from 'react'
import { ContentItem } from './ContentItem'
import defaultBrowserIcon from '@renderer/assets/svg/browser.svg'

export const BrowserItem = ({ searchText }: { searchText: string }) => {
  const [browserIcon, setBrowserIcon] = useState<string | null>('')

  useEffect(() => {
    if (window.api && window.api.getDefaultBrowserIcon) {
      window.api.getDefaultBrowserIcon().then(setBrowserIcon)
    }
  }, [])

  const handleSearch = () => {
    if (window.api && window.api.openExternal) {
      window.api.openExternal(`https://www.google.com/search?q=${encodeURIComponent(searchText)}`)
    }
  }

  return (
    <ContentItem
      icon={browserIcon || defaultBrowserIcon}
      title={`open in broswer: ${searchText}`}
      onClick={handleSearch}
    />
  )
}
