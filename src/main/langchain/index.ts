import { Ollama } from '@langchain/ollama'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage } from '@langchain/core/messages'
import { StringOutputParser } from '@langchain/core/output_parsers'

export interface ChatConfig {
  provider: string
  modelName: string
  baseUrl: string
  apiKey?: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

// 自定义错误类
export class LLMError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'LLMError'
  }
}

export const createLLM = (config: ChatConfig) => {
  try {
    switch (config.provider) {
      case 'ollama':
        if (!config.baseUrl) {
          throw new LLMError('Ollama 需要提供 baseUrl', 'MISSING_BASE_URL')
        }
        return new Ollama({
          baseUrl: config.baseUrl,
          model: config.modelName
        })
      case 'deepseek':
      case 'openai':
        if (!config.apiKey) {
          throw new LLMError(`${config.provider} 需要提供 API Key`, 'MISSING_API_KEY')
        }
        if (!config.baseUrl) {
          throw new LLMError(`${config.provider} 需要提供 baseUrl`, 'MISSING_BASE_URL')
        }
        return new ChatOpenAI({
          model: config.modelName,
          configuration: {
            baseURL: config.baseUrl,
            apiKey: config.apiKey
          }
        })
      default:
        throw new LLMError(`不支持的AI提供商: ${config.provider}`, 'UNSUPPORTED_PROVIDER')
    }
  } catch (error) {
    if (error instanceof LLMError) {
      throw error
    }
    throw new LLMError('创建 LLM 实例失败', 'CREATE_LLM_FAILED')
  }
}

export const chat = async (content: string, config: ChatConfig) => {
  console.log(content);
  console.log(config);
  
  try {
    if (!content.trim()) {
      throw new LLMError('对话内容不能为空', 'EMPTY_CONTENT')
    }

    const llm = createLLM(config)
    const p = llm.pipe(new StringOutputParser())
    
    const stream = await p.stream([
      new HumanMessage(content)
    ])
    return stream
  } catch (error) {
    if (error instanceof LLMError) {
      throw error
    }
    // 处理网络错误
    if (error instanceof Error && error.name.includes('ResponseError')) {
      throw new LLMError('无法连接到 AI 服务器或服务器出现错误', 'CONNECTION_FAILED')
    }

    //one-api错误
    if((error as {error:Error})?.error ){
      throw new LLMError((error as {error:Error}).error.message, 'UNKNOWN_ERROR') 
    }
    // 其他未知错误
    throw new LLMError((error as Error).message, 'UNKNOWN_ERROR') 
  }
}
