import React, { useEffect, useMemo, useState } from 'react'

import { CreateDatabase } from '../../types/database'
import { User } from '../../types/user'
import { MessageType, WebviewPageProps } from '../../types/webview'
import { formatTime } from '../../utils/formatTime'
import { DBSelector } from '../components/database/DBSelector'
import { DatabaseModal } from '../components/database/DatabaseModal'

export function SettingPage({ postMessageToExtension }: WebviewPageProps) {
  const [loginStatus, setLoginStatus] = useState(false)
  const [user, setUser] = useState<User>({
    notionActive: false,
    lastLoginAt: '',
    updatedAt: '',
    createdAt: '',
  })
  const [showDbModal, setShowDbModal] = useState(false)
  const [selectedDbId, setSelectedDbId] = useState(0)
  useEffect(() => {
    postMesasgeTypeToExtension(MessageType.GET_LOGIN_STATUS)
  }, [])
  const saveDatabase = (database: CreateDatabase) =>
    postMessageToExtension({
      type: MessageType.SAVE_DATABASE,
      payload: database,
    })

  const getDatabases = () =>
    postMesasgeTypeToExtension(MessageType.GET_DATABASE)

  useEffect(() => {
    if (loginStatus) {
      postMesasgeTypeToExtension(MessageType.GET_USER)
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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      if (message.type === MessageType.LOGIN_STATUS_LOADED) {
        setLoginStatus(message.payload)
      } else if (message.type === MessageType.USER_LOADED) {
        setUser(message.payload)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const postMesasgeTypeToExtension = (type: MessageType) =>
    postMessageToExtension({ type })

  return (
    <div className="min-h-screen w-full p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Vibe Editor 설정</h1>
        <div className="rounded-lg shadow-lg p-6">
          <div className="space-y-8">
            {loginStatus && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold border-b pb-4">
                  유저 정보
                </h2>
                {computedUser && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <h3 className="text-base font-medium">
                            노션 활성화 여부
                          </h3>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm ${computedUser.notionActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {computedUser.notionActive ? '활성화' : '비활성화'}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <h3 className="text-base font-medium">
                            마지막 로그인 일시
                          </h3>
                        </div>
                        <div className="text-sm">
                          {computedUser.lastLoginAt}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <h3 className="text-base font-medium">가입일</h3>
                        </div>
                        <div className="text-sm">{computedUser.createdAt}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          <h3 className="text-base font-medium">
                            유저 정보 변경일
                          </h3>
                        </div>
                        <div className="text-sm">{computedUser.updatedAt}</div>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() =>
                    postMesasgeTypeToExtension(
                      MessageType.SET_NOTION_SECRET_KEY,
                    )
                  }>
                  노션 PRIVATE API 키 설정
                </button>

                <DBSelector
                  selectedId={selectedDbId}
                  onChange={setSelectedDbId}
                  getDatabases={getDatabases}
                  onAddClick={() => setShowDbModal(true)}
                />

                {showDbModal && (
                  <DatabaseModal
                    saveDatabase={saveDatabase}
                    onClose={() => setShowDbModal(false)}
                  />
                )}
                <button
                  className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() =>
                    postMesasgeTypeToExtension(MessageType.LOG_OUT)
                  }>
                  로그아웃
                </button>
              </div>
            )}
            {!loginStatus && (
              <div className="space-y-4">
                <button
                  className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() =>
                    postMesasgeTypeToExtension(MessageType.GOOGLE_LOGIN)
                  }>
                  구글 로그인
                </button>
                <button
                  className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() =>
                    postMesasgeTypeToExtension(MessageType.GITHUB_LOGIN)
                  }>
                  깃허브 로그인
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
