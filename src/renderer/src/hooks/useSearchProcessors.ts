import defaultBrowserIcon from '@renderer/assets/svg/browser.svg'
import ollamaIcon from '@renderer/assets/svg/ollama.svg'
import translateIcon from '@renderer/assets/svg/translate.svg'
import { useNavigation } from '@renderer/hooks/useNavigation';
import { debounce } from 'lodash-es';
import { useSearchStore } from '@renderer/stores/searchStore';
import { useCallback } from 'react';

export interface SearchResultProcessor {
  priority: number;
  match: (text: string) => boolean;
  createResult: (text: string) => SearchResult;
}

export const useSearchProcessors = () => {
  const { navigate } = useNavigation()
  const { setSearchResults, setSelectedIndex } = useSearchStore()


  const browserResult: SearchResultProcessor = {
    priority: 0,
    match: (text) => true,
    createResult: (text) => ({
      type: 'search',
      title: `open in browser: ${text}`,
      icon: defaultBrowserIcon,
      action: `https://www.google.com/search?q=${encodeURIComponent(text)}`
    })
  }
  
  const chatProcessor: SearchResultProcessor = {
    priority: 10,
    match: (text) => 'chat'.includes(text),
    createResult: (_) => ({
      type: 'chat',
      title: 'chat to ai',
      icon: ollamaIcon,
      action:()=>{
        navigate('/chat')
      }
    })
  }
  
  const translateProcessor: SearchResultProcessor = {
    priority: 20,
    match: (text) => 'translate'.includes(text),
    createResult: (_) => ({
      type: 'translate',
      title: 'Translate',
      icon: translateIcon,
      action:()=>{
        navigate('/translate')
      }
    })
  };

  const processors = [browserResult, chatProcessor, translateProcessor]

  const search = useCallback(debounce(async (text: string) => {
    if (!text.trim()) {
      setSearchResults([])
      return;
    }
    const results = await window.api.searchAppsAndFiles(text.trim());
    const allResults = [...results];
    for (const processor of processors) {
      if (processor.match(text)) {
        const result = processor.createResult(text);
        allResults.unshift(result);
      }
    }
    setSearchResults(allResults)
    setSelectedIndex(0)
  }, 300),[])

  return {
    processors,
    search
  }
}
