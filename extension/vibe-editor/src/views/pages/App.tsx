import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import '../../styles/global.css'
import { Message } from '../../types/webview'
import { PostPage } from './PostPage'
import { TemplatePage } from './TemplatePage'

declare global {
  interface Window {
    vscode: {
      postMessage: (message: any) => void
    }
  }
}

export function App() {
  const [currentPage, setCurrentPage] = useState<'template' | 'post'>(
    'template',
  )

  const postMessageToExtension = (message: Message) => {
    window.vscode.postMessage(message)
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      if (message.type === 'NAVIGATE' || message.type === 'INITIAL_PAGE') {
        setCurrentPage(message.payload.page)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <React.StrictMode>
      {currentPage === 'template' ? (
        <TemplatePage postMessageToExtension={postMessageToExtension} />
      ) : (
        <PostPage postMessageToExtension={postMessageToExtension} />
      )}
    </React.StrictMode>
  )
}

// React 앱 마운트
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
