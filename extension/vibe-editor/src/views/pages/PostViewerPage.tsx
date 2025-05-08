import React, { useEffect, useState } from 'react'

import { PostDetail } from '../../types/post'
import { MessageType } from '../../types/webview'

export default function PostViewerPage() {
  const [post, setPost] = useState<PostDetail | null>(null)

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === MessageType.SHOW_POST_VIEWER) {
        setPost(event.data.payload)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  if (!post) return <p>불러오는 중...</p>

  return (
    <div className="app-container">
      <h1>제목: {post.postTitle}</h1>
      <p>
        <strong>템플릿 ID:</strong> {post.templateId}
      </p>
      <p>
        <strong>프롬프트 ID:</strong> {post.promptId}
      </p>
      <pre>{post.postContent}</pre>
    </div>
  )
}
