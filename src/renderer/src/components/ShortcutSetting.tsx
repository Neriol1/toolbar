import { useState, useEffect } from 'react'
import { Label } from './Label'

export const ShortcutSetting = () => {
  const [shortcut, setShortcut] = useState('')
  const [recording, setRecording] = useState(false)
  const [currentShortcut, setCurrentShortcut] = useState('Option + Space')
  const [error, setError] = useState('')

  useEffect(() => {
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
    <section>
      <Label label='快捷键设置'></Label>
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
  )
} 