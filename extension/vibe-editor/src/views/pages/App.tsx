import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { DotLoader } from 'react-spinners'

import '../../styles/global.css'
import { Message, MessageType, PageType } from '../../types/webview'
import { PostPage } from './PostPage'
import { SettingPage } from './SettingPage'
import { StartGuidePage } from './StartGuidePage'
import { TemplatePage } from './TemplatePage'

declare global {
  interface Window {
    vscode: {
      postMessage: (message: any) => void
    }
  }
}

export function App() {
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
      console.log('app 메시지', message)
      if (
        message.type === MessageType.INITIAL_PAGE ||
        message.type === MessageType.NAVIGATE
      ) {
        setCurrentPage(message.payload.page)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [isInitialized, postMessageToExtension])

  const renderPage = useMemo(() => {
    console.log('renderPage', currentPage)
    switch (currentPage) {
      case PageType.TEMPLATE:
        return <TemplatePage postMessageToExtension={postMessageToExtension} />
      case PageType.POST:
        return <PostPage postMessageToExtension={postMessageToExtension} />
      case PageType.POST_VIEWER:
        return <PostPage postMessageToExtension={postMessageToExtension} />
      case PageType.SETTING:
        return <SettingPage postMessageToExtension={postMessageToExtension} />
      case PageType.STARTING_GUIDE:
        return (
          <StartGuidePage postMessageToExtension={postMessageToExtension} />
        )
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full gap-10">
            <h1 className="text-2xl font-bold">Vibe Editor</h1>
            <DotLoader color="var(--vscode-button-background)" />
            <div className="text-sm">로딩 중이에요</div>
          </div>
        )
    }
  }, [currentPage, postMessageToExtension])

  return (
    <React.StrictMode>
      <div className="">
        <div className="p-4">{renderPage}</div>
      </div>
    </React.StrictMode>
  )
}

// React 앱 마운트
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
