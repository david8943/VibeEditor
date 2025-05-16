import React, { useEffect, useState } from 'react'
import { DotLoader } from 'react-spinners'

import { Post, PostDetail, UploadToNotionRequestPost } from '../../types/post'
import { MessageType, WebviewPageProps } from '../../types/webview'
import { PostForm } from '../components'

export function PostPage({ postMessageToExtension }: WebviewPageProps) {
  const [loading, setLoading] = useState(false)
  const [defaultPost, setDefaultPost] = useState<PostDetail>({
    postId: 0,
    postTitle: '디폴트 포스트 제목',
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
      console.log('handleMessage', message)
      if (message.type === MessageType.CURRENT_POST_LOADED) {
        setDefaultPost(message.payload.post)
      } else if (message.type === MessageType.SHOW_POST_VIEWER) {
        setDefaultPost(message.payload)
      } else if (message.type === MessageType.START_LOADING) {
        setLoading(true)
      } else if (message.type === MessageType.STOP_LOADING) {
        setLoading(false)
      } else if (message.type === MessageType.GET_CURRENT_POST) {
        postMessageToExtension({ type: MessageType.GET_CURRENT_POST })
      } else if (message.type === MessageType.NAVIGATE) {
        postMessageToExtension({ type: MessageType.GET_CURRENT_POST })
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const onUploadToNotion = (data: UploadToNotionRequestPost) => {
    postMessageToExtension({
      type: MessageType.UPLOAD_POST,
      payload: data,
    })
  }
  //TODO: 연타 안 되게 막아야 함
  const onSubmit = (data: Post) => {
    console.log('onSubmit 이 작동함', data)
    setLoading(true)
    postMessageToExtension({
      type: MessageType.SUBMIT_POST,
      payload: data,
    })
  }
  return (
    <div className="app-container">
      <h1>포스트 미리보기</h1>
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
          <DotLoader color="var(--vscode-button-background)" />
        </div>
      )}
      <PostForm
        defaultPost={defaultPost}
        onSubmit={onSubmit}
        onUploadToNotion={onUploadToNotion}
      />
    </div>
  )
}
