import { ipcMain } from "electron"
import { ChatConfig, chat, LLMError } from "."

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

ipcMain.handle('chat-with-llm', async (event, content: string, config: ChatConfig) => {
  try {
    const stream = await chat(content, config)
    for await (const chunk of stream) {
      await sleep(50)
      event.sender.send('llm-chunk', chunk)
    }
    return 'done'
  } catch (error) {
    // 发送错误消息到渲染进程
    if (error instanceof LLMError) {
      event.sender.send('llm-chunk', `错误: ${error.message}`)
    } else {
      event.sender.send('llm-chunk', '发生未知错误，请稍后重试')
    }
    return 'error'
  }
})
