import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import '@renderer/assets/css/tailwind.css'
import '@renderer/assets/css/global.scss'
import { initProvidersStorage } from './lib/AiProviders'

// 在渲染前初始化
initProvidersStorage()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
