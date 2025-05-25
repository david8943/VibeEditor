import React, { useEffect, useMemo, useRef, useState } from 'react'

import ArrowUpIcon from '@/assets/icons/arrow-up.svg'
import MinusIcon from '@/assets/icons/circle-slash.svg'

import { Database } from '../../types/database'
import { Snapshot } from '../../types/snapshot'
import type { Option } from '../../types/template'
import { User } from '../../types/user'
import { MessageType, WebviewPageProps } from '../../types/webview'
import { formatTime } from '../../utils/formatTime'
import { AIProviderModal } from '../components/aiProvider/AIProviderModal'
import { AIProviderSelector } from '../components/aiProvider/AIProviderSelector'
import { DBSelector } from '../components/database/DBSelector'
import { DatabaseModal } from '../components/database/DatabaseModal'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export function ChatPage({ postMessageToExtension }: WebviewPageProps) {
  const [loginStatus, setLoginStatus] = useState(false)
  const [user, setUser] = useState<User>({
    notionActive: false,
    lastLoginAt: '',
    updatedAt: '',
    createdAt: '',
  })
  const [showDbModal, setShowDbModal] = useState(false)
  const [showAIProviderModal, setShowAIProviderModal] = useState(false)
  const [showStartGuide, setShowStartGuide] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [snapshot, setSnapshot] = useState<Snapshot[]>([])
  const [input, setInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log('로그인 스테이터스', loginStatus)
    if (loginStatus) {
      postMessageToExtension({ type: MessageType.GET_DATABASE })
      postMesasgeTypeToExtension(MessageType.GET_USER)
      postMessageToExtension({ type: MessageType.GET_OPTIONS })
      postMessageToExtension({ type: MessageType.GET_CONFIG })
    }
  }, [loginStatus])

  const computedUser = useMemo(() => {
    if (user) {
      return {
        ...user,
        lastLoginAt: formatTime(user.lastLoginAt),
        createdAt: formatTime(user.createdAt),
        updatedAt: formatTime(user.updatedAt),
      }
    }
  }, [user])
  const handleStartGuide = () => {
    setShowStartGuide(!showStartGuide)
    postMessageToExtension({
      type: MessageType.START_GUIDE,
      payload: showStartGuide,
    })
  }
  const postMesasgeTypeToExtension = (type: MessageType) =>
    postMessageToExtension({ type })

  useEffect(() => {
    postMesasgeTypeToExtension(MessageType.GET_LOGIN_STATUS)
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      if (message.type === MessageType.LOGIN_STATUS_LOADED) {
        setLoginStatus(message.payload)
      } else if (message.type === MessageType.USER_LOADED) {
        setUser(message.payload)
      } else if (message.type === MessageType.OPTIONS_LOADED) {
        setOptionList(message.payload)
      } else if (message.type === MessageType.CONFIG_LOADED) {
        console.log('message', message)
        setSelectedOptionIds(message.payload.defaultPromptOptionIds ?? [])
        setDefaultPostType(message.payload.defaultPostType ?? 'TECH_CONCEPT')
        setDefaultNotionDatabaseId(message.payload.defaultNotionDatabaseId ?? 0)
        setDefaultUserAIProviderId(message.payload.defaultUserAIProviderId ?? 0)
        setShowStartGuide(message.payload.showStartGuide ?? false)
      } else if (message.type === MessageType.GET_DATABASE) {
        setNotionDbList(message.payload)
      } else if (message.type === MessageType.AI_MESSAGE) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: message.payload.text },
        ])
      } else if (message.type === MessageType.INSERT_SNAPSHOT_TO_CHAT) {
        setSnapshot((prev) => [...prev, message.payload])
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

  const [optionList, setOptionList] = useState<Option[]>([])
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([])
  const [defaultPostType, setDefaultPostType] = useState('TECH_CONCEPT')
  const [defaultNotionDatabaseId, setDefaultNotionDatabaseId] = useState(0)
  const [notionDbList, setNotionDbList] = useState<Database[]>([])
  const [defaultUserAIProviderId, setDefaultUserAIProviderId] = useState(0)

  // 스크롤 항상 아래로
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    setMessages((prev) => [...prev, { role: 'user', content: input }])
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
        '위 질문과 파일 내용을 바탕으로 정확하고 유용한 답변을 해주세요'
    } else {
      message = `
      나의 말:
      ${message}
      `
    }
    postMessageToExtension({ type: MessageType.USER_MESSAGE, payload: message })
    setInput('')
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  if (!loginStatus) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div>로그인 후 이용 가능합니다.</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 bg-white rounded shadow">
        {messages.length === 0 && (
          <div className="text-gray-400 text-center mt-10">
            대화를 시작해보세요!
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`px-3 py-2 rounded-lg max-w-[70%] ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="flex flex-col gap-2 mt-2 p-3 bg-white rounded-xl shadow-lg">
        <div className="flex flex-wrap gap-2 justify-start">
          {snapshot.map((snapshot) => (
            <div
              key={snapshot.snapshotId}
              className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-md px-1 py-1 shadow-sm mr-2 transition-all duration-200 hover:from-blue-100 hover:to-blue-200 hover:shadow-md group">
              <span
                className="truncate text-xs text-blue-900 font-medium cursor-pointer"
                style={{ maxWidth: 100 }}
                onClick={() => showSnapshot(snapshot)}>
                {snapshot.snapshotName}
              </span>
              <MinusIcon
                onClick={() => removeSnapshot(snapshot.snapshotId)}
                width={8}
                height={8}
                className="ml-1 w-3 h-3 cursor-pointer opacity-60 group-hover:opacity-100 transition-colors duration-150 hover:text-red-500"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2 w-full p-3 bg-white rounded-xl shadow-lg items-end">
          <input
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base shadow-sm bg-gray-50"
            type="text"
            value={input}
            placeholder="메시지를 입력하세요..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <button
            className="flex items-center justify-center w-9 h-9 p-0 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={handleSend}
            style={{
              padding: 0,
            }}>
            <ArrowUpIcon
              width={20}
              height={20}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
