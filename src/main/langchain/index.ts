// import { Ollama } from 'langchain/llms/ollama'
import { Ollama } from '@langchain/ollama'

const ollama = new Ollama({
  baseUrl: 'http://localhost:11434',
  model: 'llama3:8b',
})
