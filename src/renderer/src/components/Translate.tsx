import { useTranslateStore } from '@renderer/stores/translateStore'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const Word = ({meanings}: Pick<TranslateWord, 'meanings'>) => {
  return (
    <div className="h-full">
      <div className="space-y-4">
        {meanings.map(v => (
          <div className="flex gap-4" key={v.pos}>
            <span className="min-w-12 h-8 flex items-center justify-center border border-gray-200 rounded-md text-sm text-gray-600">
              {v.pos}
            </span>
            <span className="text-lg">{v.meaning}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const Sentence = ({meanings}: Pick<TranslateSentence, 'meanings'>) => {
  return (
    <div className='flex-1 flex flex-col gap-4 h-full'>
      <div className='text-lg text-gray-700'>{meanings}</div>
    </div>
  )
}

const Loading = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + '.' : ''));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='w-full h-full flex flex-col items-center justify-center'>
        <span className="mt-4 text-gray-600">正在翻译{dots}</span>
    </div>
  );
}

const Invalid = () => {
  return (
    <div className='w-full h-full flex flex-col items-center justify-center'>
      <span className="text-gray-500">请输入要翻译的文本</span>
      <span className="text-gray-500">（按回车键开始翻译）</span>
    </div>
  )
}

export const Translate = () => {
  const { loading, currentResponse, setInput, clearCurrentResponse } = useTranslateStore()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [localInput, setLocalInput] = useState('')

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault() // 阻止换行
      if (localInput.trim() === '') {
        return
      }
      setInput(localInput) // 触发翻译
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // 如果输入只是一个换行符（回车键造成的），并且之前没有内容，则忽略
    if (e.target.value === '\n' && localInput === '') {
      return;
    }
    setLocalInput(e.target.value);
    clearCurrentResponse();
  }

  const renderResult = () => {
    if (loading) {
      return <Loading />
    }
    if(localInput.trim() === '') {
      return <Invalid />
    }

    switch (currentResponse?.type) {
      case 'word':
        return <Word meanings={currentResponse.meanings as TranslateWord['meanings']} />
      case 'sentence':
        return <Sentence meanings={currentResponse.meanings as TranslateSentence['meanings']} />
      case 'invalid':
        return <Sentence meanings={localInput} />
      default:
        return <Invalid />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 400 }}
      className="bg-white w-full px-6 py-4 overflow-hidden no-drag flex flex-col"
    >
      <div className='flex justify-end mb-2'>
        <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
          生词本
        </button>
      </div>
      
      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 border rounded-lg overflow-hidden flex flex-col">
          <textarea
            ref={inputRef}
            value={localInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 w-full p-4 resize-none focus:outline-none"
          />
        </div>

        <div className={'flex-1 border rounded-lg p-4 overflow-auto'}>
          {renderResult()}
        </div>
      </div>
    </motion.div>
  )
}