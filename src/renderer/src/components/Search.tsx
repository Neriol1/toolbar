import { useEffect, useRef } from "react"
import backIcon from '@renderer/assets/svg/back.svg'

interface SearchProps {
  searchText: string
  setSearchText: (term: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isChatWithAi: boolean
  onBack: () => void
}

export const Search = ({ searchText, setSearchText, onKeyDown, isChatWithAi, onBack }: SearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{
    inputRef.current?.focus()
  },[isChatWithAi])

  return (
    <section className={`p-3 bg-gray-200 flex items-center border-b border-solid border-zinc-400 ${isChatWithAi && 'no-drag'}`}>
      {isChatWithAi && (
        <img 
          className="w-5 h-5 mr-2 mt-1 cursor-pointer hover:bg-gray-300 rounded-md" 
          src={backIcon} 
          alt="back" 
          onClick={onBack}
        />
      )}
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