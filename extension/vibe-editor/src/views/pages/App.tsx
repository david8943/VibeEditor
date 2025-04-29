import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'

import '../../styles/global.css'
import { Message, MessageType, PageType } from '../../types/webview'
import { PostPage } from './PostPage'
import { SettingPage } from './SettingPage'
import { TemplatePage } from './TemplatePage'

declare global {
  interface Window {
    vscode: {
      postMessage: (message: any) => void
    }
  }
}

export function App() {
  // 초기 상태를 LOADING으로 설정하여 즉시 렌더링
  const [currentPage, setCurrentPage] = useState<PageType>(PageType.LOADING)
  const [isInitialized, setIsInitialized] = useState(false)

  const postMessageToExtension = useCallback((message: Message) => {
    window.vscode.postMessage(message)
  }, [])

  useEffect(() => {
    if (!isInitialized) {
      console.log('isInitialized WEBVIEW_READY')
      postMessageToExtension({ type: MessageType.WEBVIEW_READY })
      setIsInitialized(true)
    }

    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      if (
        message.type === MessageType.INITIAL_PAGE ||
        message.type === MessageType.NAVIGATE
      ) {
        console.log('handleMessage', message)
        setCurrentPage(message.payload.page)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [isInitialized, postMessageToExtension])

  // 페이지 컴포넌트를 메모이제이션하여 불필요한 리렌더링 방지
  const renderPage = useMemo(() => {
    console.log('renderPage', currentPage)
    switch (currentPage) {
      case PageType.TEMPLATE:
        return <TemplatePage postMessageToExtension={postMessageToExtension} />
      case PageType.POST:
        return <PostPage postMessageToExtension={postMessageToExtension} />
      case PageType.SETTING:
        return <SettingPage postMessageToExtension={postMessageToExtension} />
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold">Vibe Editor</h1>
            <div className="text-sm text-gray-500">로딩 중이에요</div>
          </div>
        )
    }
  }, [currentPage, postMessageToExtension])

  return <React.StrictMode>{renderPage}</React.StrictMode>
}

// React 앱 마운트
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
