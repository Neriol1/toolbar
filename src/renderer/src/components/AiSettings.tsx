import { useState } from 'react'
import { Label } from './Label'
import { useAiStore } from '@renderer/stores/aiStore'

export const AiSettings = () => {
  const {
    providers,
    currentProvider,
    currentModel,
    currentBaseUrl,
    currentApiKey,
    setCurrentProvider,
    setCurrentModel,
    setCurrentBaseUrl,
    setCurrentApiKey,
    updateProviderConfig
  } = useAiStore()

  const [error, setError] = useState('')

  const handleProviderChange = (newProvider: AiProvider) => {
    setCurrentProvider(newProvider)
    setCurrentModel(providers[newProvider].defaultModel)
    setCurrentBaseUrl(providers[newProvider].defaultBaseUrl)
  }

  const handleBaseUrlChange = (url: string) => {
    if (!url.trim()) {
      setError('请输入有效的 URL 地址，例如: http://localhost:11434')
      setCurrentBaseUrl('')
      updateProviderConfig(currentProvider, { defaultBaseUrl: '' })
      return
    }

    try {
      const urlObj = new URL(url)
      
      if (!urlObj.host) {
        setError('请输入有效的主机名')
        setCurrentBaseUrl(url)
        return
      }

      setError('')
      setCurrentBaseUrl(url)
      updateProviderConfig(currentProvider, { defaultBaseUrl: url })
    } catch {
      setError('请输入有效的 URL 地址，例如: http://localhost:11434')
      setCurrentBaseUrl(url)
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <Label label="AI 服务商" />
        <select
          className="w-full p-2 border rounded"
          value={currentProvider}
          onChange={(e) => handleProviderChange(e.target.value as AiProvider)}
        >
          {Object.entries(providers).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <Label label="AI 模型" />
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder={`输入模型名称，如 ${providers[currentProvider].defaultModel}`}
          value={currentModel}
          onChange={(e) => {
            setCurrentModel(e.target.value)
            updateProviderConfig(currentProvider, { defaultModel: e.target.value })
          }}
        />
      </div>

      <div>
        <Label label="服务器地址" />
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="输入服务器地址"
          value={currentBaseUrl}
          onChange={(e) => handleBaseUrlChange(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      {providers[currentProvider].needApiKey && (
        <div>
          <Label label="API Key" />
          <input
            type="password"
            className="w-full p-2 border rounded"
            placeholder="输入 API Key"
            value={currentApiKey}
            onChange={(e) => setCurrentApiKey(e.target.value)}
          />
        </div>
      )}
    </section>
  )
}
