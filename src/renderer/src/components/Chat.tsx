import { motion } from 'framer-motion'
import { useChatStore } from '@renderer/stores/chatStore'
import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const Chat = () => {
  const { messages, loading } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 400 }}
      className="bg-white w-full pt-4 overflow-hidden no-drag flex flex-col"
    >
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto px-4 space-y-4"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 py-[0.5em] text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.role === 'user' ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  className="markdown-body prose prose-sm max-w-none"
                  components={{
                    pre: ({ node, ...props }) => (
                      <div className="overflow-auto my-2 bg-gray-800 text-white p-2 rounded">
                        <pre {...props} />
                      </div>
                    ),
                    code: ({ node, inline, ...props }) => (
                      inline ? 
                        <code className="bg-gray-200 px-1 rounded" {...props} /> :
                        <code {...props} />
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg flex space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </motion.div>
  )
}