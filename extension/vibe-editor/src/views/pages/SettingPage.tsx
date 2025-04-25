import React, { useEffect, useState } from 'react'

import { CreatePost, Post } from '../../types/post'
import { Message, MessageType, WebviewPageProps } from '../../types/webview'

export function SettingPage({ postMessageToExtension }: WebviewPageProps) {
  const [defaultPost, setDefaultPost] = useState<Post>({
    postId: 0,
    postName: '',
    postContent: '',
    createdAt: '',
    updatedAt: '',
    promptId: 0,
  })

  useEffect(() => {
    postMessageToExtension({
      type: MessageType.GET_CURRENT_POST,
      payload: {},
    })
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      if (message.type === MessageType.CURRENT_POST_LOADED) {
        setDefaultPost(message.payload.post)
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
          <h2>구글 로그인</h2>
          <h2>깃허브 로그인</h2>
          <h2>유저 정보</h2>
          <h2>노션 PRIVATE API 키 설정</h2>
          <h2>등록한 노션 데이터베이스 목록</h2>
          <h2>로그아웃</h2>
        </div>
      </div>
      <div className="setting-container">
        <div className="setting-item">
          <h2>템플릿 설정</h2>
        </div>
      </div>
    </div>
  )
}
