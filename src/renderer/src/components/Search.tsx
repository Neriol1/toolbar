import { useCallback, useEffect, useRef, useState } from "react"
import backIcon from '@renderer/assets/svg/back.svg'
import settingsIcon from '@renderer/assets/svg/settings.svg'
import { useNavigation } from "../hooks/useNavigation"
import { useInputStore } from "@renderer/stores/inputStore"
import { useSearchStore } from "@renderer/stores/searchStore"
import { useSearchProcessors } from "../hooks/useSearchProcessors"
import { useEnter } from "../hooks/useEnter"
const PLACEHOLDERS: Record<string, string> = {
  '/': 'enter search term',
  '/chat': 'send your message to AI',
  '/translate': 'Please enter the content to be translated',
  '/settings': ''
}

export const Search = () => {
  const { back, navigate, location } = useNavigation()
  const { text, setText } = useInputStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isComposing, setIsComposing] = useState(false)
  const { selectNextItem, selectPreviousItem } = useSearchStore()
  const { search } = useSearchProcessors()
  const { enter } = useEnter()
  const currentPath = location.pathname
  const isSearchPage = currentPath === '/'
  const isDisabled = currentPath === '/settings' || currentPath === '/translate'

  useEffect(() => {
    if (currentPath !== '/settings') {
      inputRef.current?.focus()
    }
  }, [currentPath])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposing) {
      return // 如果正在输入中文，不处理键盘事件
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        selectPreviousItem();
        break;
      case 'ArrowDown':
        e.preventDefault();
        selectNextItem();
        break;
      case 'Enter':
          enter();
        break;
      default:
        break;
    }
  }, [isComposing, selectNextItem, selectPreviousItem, back])

  const handleSettingsClick = () => {
    navigate('/settings')
  }

  useEffect(() => {
    const currentPage = location.pathname
    if(currentPage !== '/') {
      return
    }
    search(text)
    return () => {
      search.cancel() 
    }
  }, [text, search])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        back()
      }
    }
    window.addEventListener('keydown', fn)
    return () => {
      window.removeEventListener('keydown', fn)
    }
  }, [back])


  return (
    <section className={`p-3 bg-gray-200 flex items-center border-b border-solid border-zinc-400 ${currentPath === '/chat' && 'no-drag'}`}>
      {!isSearchPage && (
        <img 
          className="w-5 h-5 mr-2 mt-1 cursor-pointer hover:bg-gray-300 rounded-md no-drag" 
          src={backIcon} 
          alt="back" 
          onClick={back}
        />
      )}
      <input
        type="text"
        className={`w-full h-8 outline-none bg-gray-200 no-drag ${
          isDisabled ? 'cursor-not-allowed' : ''
        }`}
        placeholder={PLACEHOLDERS[currentPath]}
        value={text}
        ref={inputRef}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        disabled={isDisabled}
      />
      <img 
        className="w-5 h-5 ml-2 cursor-pointer hover:bg-gray-300 rounded-md no-drag" 
        src={settingsIcon}
        alt="settings"
        onClick={handleSettingsClick}
      />
    </section>
  )
}