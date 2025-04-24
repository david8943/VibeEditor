import React, { useEffect, useState } from 'react'

import { CreatePost } from '../../types/post'
import { Snapshot } from '../../types/snapshot'
import { Message } from '../../types/webview'
import { PostForm } from '../components'

interface PostPageProps {
  postMessageToExtension: (message: Message) => void
}

export function PostPage({ postMessageToExtension }: PostPageProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(0)
  const [selectedPromptId, setSelectedPromptId] = useState<number>(0)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [defaultPost, setDefaultPost] = useState<CreatePost>({
    postName: '',
    postContent: '',
  })

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      if (message.type === 'SNAPSHOT_LIST') {
        setSnapshots(message.payload.snapshots)
      } else if (message.type === 'CONFIG_CHANGE') {
        setSelectedTemplateId(message.payload.selectedTemplateId)
        setSelectedPromptId(message.payload.selectedPromptId)
      } else if (message.type === 'SNAPSHOTS_DATA') {
        setSnapshots(message.payload.snapshots)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    postMessageToExtension({
      type: 'GET_CURRENT_POST',
      payload: {},
    })
  }, [])

  return (
    <div className="app-container">
      <h1>포스트 생성기</h1>
      <PostForm
        defaultPost={defaultPost}
        onSubmit={(data: CreatePost) => {
          postMessageToExtension({
            type: 'submitPost',
            payload: data,
          })
        }}
      />
    </div>
  )
}
