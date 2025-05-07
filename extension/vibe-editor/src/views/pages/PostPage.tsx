import React, { useEffect, useState } from 'react'

import { CreatePost, PostDetail } from '../../types/post'
import { MessageType, WebviewPageProps } from '../../types/webview'
import { PostForm } from '../components'

export function PostPage({ postMessageToExtension }: WebviewPageProps) {
  const [defaultPost, setDefaultPost] = useState<PostDetail>({
    postId: 0,
    postTitle: '',
    postContent: '',
    createdAt: '',
    updatedAt: '',
    promptId: 0,
    templateId: 0,
    parentPostIdList: [],
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

      if (message.type === MessageType.SHOW_POST_VIEWER) {
        setDefaultPost(message.payload)
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
      <h1>포스트 생성기</h1>
      <PostForm
        defaultPost={defaultPost}
        onSubmit={onSubmit}
      />
    </div>
  )
}
