import { BrowserItem } from './BrowserItem'

interface ContentProps {
  searchText: string
}

export const Content = ({ searchText }: ContentProps) => {

  return (
    <main className="p-3 bg-gray-200">
      {searchText.trim() !== '' && (
        <BrowserItem searchText={searchText}></BrowserItem>
      )}
    </main>
  )
}