import React, { useEffect, useState } from 'react'

import { CreateDatabase, Database } from '../../types/database'
import { CreatePost, PostDetail } from '../../types/post'
import { User } from '../../types/user'
import { Message, MessageType, WebviewPageProps } from '../../types/webview'
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
    postMessageToExtension({
      type: MessageType.GET_LOGIN_STATUS,
      payload: {},
    })
  }, [])
  const saveDatabase = (database: CreateDatabase) => {
    console.log('saveDatabase', database)

    postMessageToExtension({
      type: MessageType.SAVE_DATABASE,
      payload: database,
    })
  }
  const getDatabases = () => {
    postMessageToExtension({
      type: MessageType.GET_DATABASE,
      payload: null,
    })
  }

  useEffect(() => {
    if (loginStatus) {
      postMessageToExtension({
        type: MessageType.GET_USER,
      })
    }
  }, [loginStatus])
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      console.log('message', message)
      if (message.type === MessageType.LOGIN_STATUS_LOADED) {
        setLoginStatus(message.payload)
      } else if (message.type === MessageType.USER_LOADED) {
        setUser(message.payload)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const onSubmit = (data: CreatePost) => {
    postMessageToExtension({
      type: MessageType.SUBMIT_POST,
      payload: data,
    })
  }

  return (
    <div className="app-container">
      <h1>Vibe Editor 설정</h1>
      <div className="setting-container">
        <div className="setting-item">
          {loginStatus && (
            <div className="flex flex-col gap-8">
              <h2>유저 정보</h2>
              {user && (
                <div className="w-full flex flex-col gap-8">
                  <div className="flex w-full justify-between">
                    <h3>노션 활성화 여부</h3>
                    <div>{user.notionActive ? '활성화' : '비활성화'}</div>
                  </div>

                  <div className="flex w-full justify-between">
                    <h3>마지막 로그인 일시</h3>
                    <div>{user.lastLoginAt}</div>
                  </div>

                  <div className="flex w-full justify-between">
                    <h3>가입일</h3>
                    <div>{user.createdAt}</div>
                  </div>

                  <div className="flex w-full justify-between">
                    <h3>유저 정보 변경일</h3>
                    <div>{user.updatedAt}</div>
                  </div>
                </div>
              )}
              <button
                onClick={() =>
                  postMessageToExtension({
                    type: MessageType.SET_NOTION_SECRET_KEY,
                  })
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
                onClick={() =>
                  postMessageToExtension({
                    type: MessageType.LOG_OUT,
                  })
                }>
                로그아웃
              </button>
            </div>
          )}
          {!loginStatus && (
            <div className="flex flex-col gap-8">
              <button
                onClick={() =>
                  postMessageToExtension({
                    type: MessageType.GOOGLE_LOGIN,
                  })
                }>
                구글 로그인
              </button>
              <button
                onClick={() =>
                  postMessageToExtension({
                    type: MessageType.GITHUB_LOGIN,
                  })
                }>
                깃허브 로그인
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
