import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export const Settings = () => {
  const [shortcut, setShortcut] = useState('')
  const [recording, setRecording] = useState(false)
  const [currentShortcut, setCurrentShortcut] = useState('Option + Space')
  const [error, setError] = useState('')

  useEffect(() => {
    // 获取当前快捷键
    window.api.getCurrentShortcut().then((shortcut) => {
      setCurrentShortcut(shortcut)
    })
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault()
    if (!recording) return
    
    const keys: string[] = []
    if (e.metaKey) keys.push('Command')
    if (e.ctrlKey) keys.push('Control') 
    if (e.altKey) keys.push('Option')
    if (e.shiftKey) keys.push('Shift')
    if(e.code === 'Space') keys.push('Space')
    if(e.code === "Backspace") keys.push('Backspace')
    setShortcut(keys.join(' + '))
  }

  const handleSave = async () => {
    if (shortcut) {
      setError('')
      await window.api.setShortcutEnabled(true)
      const res = await window.api.setShortcut(shortcut)
      if(res){
        setCurrentShortcut(shortcut)
        setRecording(false)
        setShortcut('')
        setError('')
      } else {
        setError(`当前快捷键 ${shortcut} 不支持设置`)
      }
    }
  }

  const onFocus = ()=>{
    window.api.setShortcutEnabled(false)
    setRecording(true)
  }

  const onCancle = async ()=>{
    window.api.setShortcutEnabled(true)
    setRecording(false)
    setShortcut('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 400 }}
      className="bg-white w-full pt-4 overflow-hidden no-drag"
    >
      <div className='container h-full overflow-scroll px-3'>
        <h2 className="text-lg font-medium mb-4">设置</h2>
        
        <div className="space-y-4">
          <section>
            <h3 className="text-base font-medium mb-2">快捷键设置</h3>
            <div className="space-y-2">
              <input 
                type="text"
                className="w-full p-2 border rounded"
                placeholder={currentShortcut}
                value={recording ? shortcut : currentShortcut}
                onKeyDown={handleKeyDown}
                onFocus={onFocus}
                readOnly
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {recording && (
                <div className="flex justify-end gap-2">
                  <button 
                    className="px-3 py-1 bg-gray-200 rounded"
                    onClick={onCancle}
                  >
                    取消
                  </button>
                  <button 
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                    onClick={handleSave}
                  >
                    保存
                  </button>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-base font-medium mb-2">主题设置</h3>
            <select className="w-full p-2 border rounded">
              <option value="light">浅色主题</option>
              <option value="dark">深色主题</option>
            </select>
          </section>
        </div>
      </div>
    </motion.div>
  )
}