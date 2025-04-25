import React, { useEffect, useState } from 'react'

import { CreatePost, Post } from '../../types/post'
import { Message, MessageType } from '../../types/webview'
import { PostForm } from '../components'

interface PostPageProps {
  postMessageToExtension: (message: Message) => void
}

export function PostPage({ postMessageToExtension }: PostPageProps) {
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
      <h1>포스트 생성기</h1>
      <PostForm
        defaultPost={defaultPost}
        onSubmit={onSubmit}
      />
    </div>
  )
}
