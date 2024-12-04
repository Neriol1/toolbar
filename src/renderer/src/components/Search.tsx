import { useEffect, useRef } from "react"
import backIcon from '@renderer/assets/svg/back.svg'
import settingsIcon from '@renderer/assets/svg/settings.svg'

interface SearchProps {
  searchText: string
  setSearchText: (term: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isChatWithAi: boolean
  onBack: () => void
  isShowSettings: boolean
  onSettingsClick: () => void
}

export const Search = ({ searchText, setSearchText, onKeyDown, isChatWithAi, onBack, onSettingsClick,isShowSettings }: SearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{
    inputRef.current?.focus()
  },[isChatWithAi])

  return (
    <section className={`p-3 bg-gray-200 flex items-center border-b border-solid border-zinc-400 ${isChatWithAi && 'no-drag'}`}>
      {(isChatWithAi || isShowSettings) && (
        <img 
          className="w-5 h-5 mr-2 mt-1 cursor-pointer hover:bg-gray-300 rounded-md no-drag" 
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
      <img 
        className="w-5 h-5 ml-2 cursor-pointer hover:bg-gray-300 rounded-md no-drag" 
        src={settingsIcon}
        alt="settings"
        onClick={onSettingsClick}
      />
    </section>
  )
}