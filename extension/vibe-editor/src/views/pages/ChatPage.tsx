import React, { useEffect, useMemo, useRef, useState } from 'react'

import DOMPurify from 'dompurify'
import { marked } from 'marked'

import ArrowUpIcon from '@/assets/icons/arrow-up.svg'
import MinusIcon from '@/assets/icons/circle-slash.svg'

import { Database } from '../../types/database'
import { Snapshot } from '../../types/snapshot'
import type { Option } from '../../types/template'
import { User } from '../../types/user'
import { MessageType, WebviewPageProps } from '../../types/webview'
import './styles.css'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  snapshot?: Snapshot[]
}

export function ChatPage({ postMessageToExtension }: WebviewPageProps) {
  const [loginStatus, setLoginStatus] = useState(false)
  const [user, setUser] = useState<User>({
    notionActive: false,
    lastLoginAt: '',
    updatedAt: '',
    createdAt: '',
  })
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [snapshot, setSnapshot] = useState<Snapshot[]>([])
  const [input, setInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log('로그인 스테이터스', loginStatus)
    if (loginStatus) {
      postMessageToExtension({ type: MessageType.GET_DATABASE })
      postMessageToExtension({ type: MessageType.GET_CONFIG })
    }
  }, [loginStatus])

  const postMesasgeTypeToExtension = (type: MessageType) =>
    postMessageToExtension({ type })

  useEffect(() => {
    postMesasgeTypeToExtension(MessageType.GET_LOGIN_STATUS)
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      if (message.type === MessageType.LOGIN_STATUS_LOADED) {
        setLoginStatus(message.payload)
      } else if (message.type === MessageType.AI_MESSAGE) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: message.payload.text },
        ])
      } else if (message.type === MessageType.INSERT_SNAPSHOT_TO_CHAT) {
        setSnapshot((prev) => {
          const isDuplicate = prev.some(
            (snapshot) => snapshot.snapshotId === message.payload.snapshotId,
          )
          return isDuplicate ? prev : [...prev, message.payload]
        })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const removeSnapshot = (snapshotId: number) => {
    setSnapshot((prev) =>
      prev.filter((snapshot) => snapshot.snapshotId !== snapshotId),
    )
  }

  const showSnapshot = (snapshot: Snapshot) => {
    postMessageToExtension({
      type: MessageType.SHOW_SNAPSHOT,
      payload: snapshot,
    })
  }

  // 스크롤 항상 아래로
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    setMessages((prev) => [...prev, { role: 'user', content: input, snapshot }])
    let message = `사용자가 다음과 같은 질문을 했습니다:[${input}]`
    if (snapshot.length > 0) {
      message += `\n또한, 사용자가 다음 파일을 제공했습니다:`
      message += snapshot.map((snapshot) => {
        return `
        <${snapshot.snapshotName}>
        """
        ${snapshot.snapshotContent}
        """
        `
      })
      message +=
        '위 질문과 파일 내용을 바탕으로 정확하고 유용한 답변을 해 주세요.'
      setSnapshot([])
    } else {
      message = `
      사용자의 말:
      ${message}
      `
      message += '위 질문을 바탕으로 정확하고 유용한 답변을 해 주세요.'
    }

    postMessageToExtension({ type: MessageType.USER_MESSAGE, payload: message })
    setInput('')
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  const renderMarkdown = (content: string) => {
    const htmlContent = marked(content) as string
    const sanitizedContent = DOMPurify.sanitize(htmlContent)
    return { __html: sanitizedContent }
  }

  if (!loginStatus) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div>로그인 후 이용 가능합니다.</div>
      </div>
    )
  }

  return (
    <div className="h-full bg-[var(--vscode-editor-background)] relative">
      <div className="overflow-y-auto p-6 pb-24 h-full">
        {messages.length === 0 && (
          <div className="text-[var(--vscode-descriptionForeground)] text-center mt-10 text-lg font-light">
            AI와 새로운 대화를 시작해보세요 ✨<br />
            대화에 스냅샷을 추가할 수 있습니다.📸
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex flex-col gap-2">
              <div
                className={`px-3 py-2 rounded-lg break-words w-fit ${
                  msg.role === 'user'
                    ? 'bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] self-end ml-auto max-w-[60%]'
                    : 'bg-[var(--vscode-editor-inactiveSelectionBackground)] text-[var(--vscode-editor-foreground)] self-start max-w-[75%]'
                }`}
                style={{ minWidth: 'max(80px, 30vw)' }}>
                <div
                  className="markdown-content"
                  dangerouslySetInnerHTML={renderMarkdown(msg.content)}
                  style={
                    {
                      '--markdown-color':
                        msg.role === 'user'
                          ? 'var(--vscode-button-foreground)'
                          : 'var(--vscode-editor-foreground)',
                      '--markdown-link-color':
                        'var(--vscode-textLink-foreground)',
                      '--markdown-code-bg':
                        'var(--vscode-editor-inactiveSelectionBackground)',
                      '--markdown-border-color': 'var(--vscode-panel-border)',
                    } as any
                  }
                />
              </div>

              {msg.snapshot && (
                <div className="flex flex-col flex-wrap gap-2 justify-end">
                  {msg.snapshot.map((snapshot) => (
                    <div
                      key={`${idx}-${snapshot.snapshotId}`}
                      className="flex items-center bg-[var(--vscode-badge-background)] border border-[var(--vscode-badge-foreground)] rounded-md px-2 py-1 mr-2 transition-all duration-200 hover:bg-[var(--vscode-badge-foreground)] hover:text-[var(--vscode-badge-background)] group">
                      <span
                        className="text-ellipsis text-xs font-medium cursor-pointer"
                        style={{
                          maxWidth: 120,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}
                        onClick={() => showSnapshot(snapshot)}>
                        {snapshot.snapshotName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div
        className="fixed bottom-0 left-0 right-0 flex flex-col gap-3 p-4 border-t border-[var(--vscode-panel-border)] bg-[var(--vscode-editor-background)] z-10"
        id="sticky-chat-input">
        <div className="flex flex-wrap gap-2 justify-start">
          {snapshot.map((snapshot) => (
            <div
              key={snapshot.snapshotId}
              className="flex items-center bg-[var(--vscode-badge-background)] border border-[var(--vscode-badge-foreground)] rounded-md px-3 py-1.5 mr-2 transition-all duration-200 hover:bg-[var(--vscode-badge-foreground)] hover:text-[var(--vscode-badge-background)] group">
              <span
                className="text-ellipsis text-xs font-medium cursor-pointer"
                style={{
                  maxWidth: 120,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => showSnapshot(snapshot)}>
                {snapshot.snapshotName}
              </span>
              <MinusIcon
                onClick={() => removeSnapshot(snapshot.snapshotId)}
                width={8}
                height={8}
                className="ml-2 w-3 h-3 cursor-pointer opacity-60 group-hover:opacity-100 transition-colors duration-150"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 w-full items-end">
          <div className="relative flex-1">
            <input
              className="w-full rounded-md px-4 py-2.5 transition-all duration-200 text-base"
              type="text"
              value={input}
              placeholder="메시지를 입력하세요..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              style={{
                caretColor: 'var(--vscode-editor-foreground)',
              }}
            />
          </div>
          <button
            className="sendButton flex mb-1 items-center justify-center transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[var(--vscode-focusBorder)] h-[44px] w-[44px] ml-2"
            onClick={handleSend}>
            <ArrowUpIcon
              width={18}
              height={18}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
