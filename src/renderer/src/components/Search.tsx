import { useEffect, useRef } from "react"

interface SearchProps {
  searchText: string
  setSearchText: (term: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export const Search = ({ searchText, setSearchText, onKeyDown }: SearchProps) => {

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{
    inputRef.current?.focus()
  },[])

  return (
    <section className="p-3 bg-gray-200 border-b border-solid border-zinc-400">
      <input
        type="text"
        className="w-full h-8 outline-none bg-gray-200 no-drag"
        placeholder="input search term"
        value={searchText}
        ref={inputRef}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </section>
  )
}