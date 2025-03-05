import { useEffect, useRef, useState } from "react"
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
  isTranslate?: boolean
  placeholder?: string
}

export const Search = ({ isTranslate, ...props }: SearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [placeholder,setPlaceholder] = useState('enter search term')

  useEffect(() => {
    if (!props.isShowSettings) {
      inputRef.current?.focus()
    }
    if(props.isShowSettings){
      setPlaceholder('')
    }
    if(props.isChatWithAi){
      setPlaceholder('send your message to AI')
    }
    if(isTranslate){
      setPlaceholder('Please enter the content to be translated')
    }
  }, [props.isChatWithAi, props.isShowSettings,isTranslate])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposing) {
      return // 如果正在输入中文，不处理键盘事件
    }
    props.onKeyDown(e)
  }

  return (
    <section className={`p-3 bg-gray-200 flex items-center border-b border-solid border-zinc-400 ${props.isChatWithAi && 'no-drag'}`}>
      {(props.isChatWithAi || props.isShowSettings || isTranslate) && (
        <img 
          className="w-5 h-5 mr-2 mt-1 cursor-pointer hover:bg-gray-300 rounded-md no-drag" 
          src={backIcon} 
          alt="back" 
          onClick={props.onBack}
        />
      )}
      <input
        type="text"
        className={`w-full h-8 outline-none bg-gray-200 no-drag ${
          props.isShowSettings || isTranslate ? 'cursor-not-allowed' : ''
        }`}
        placeholder={isTranslate ? '' : props.placeholder}
        value={props.searchText}
        ref={inputRef}
        onChange={(e) => !(props.isShowSettings || isTranslate) && props.setSearchText(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        disabled={props.isShowSettings || isTranslate}
      />
      <img 
        className="w-5 h-5 ml-2 cursor-pointer hover:bg-gray-300 rounded-md no-drag" 
        src={settingsIcon}
        alt="settings"
        onClick={props.onSettingsClick}
      />
    </section>
  )
}