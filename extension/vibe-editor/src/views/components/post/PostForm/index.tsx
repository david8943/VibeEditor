import React, { useEffect, useState } from 'react'

import { marked } from 'marked'

import {
  Post,
  PostDetail,
  UploadToNotionRequestPost,
} from '../../../../types/post'
import './styles.css'

interface PostFormProps {
  onSubmit: (data: Post) => void
  onUploadToNotion: (data: UploadToNotionRequestPost) => void
  defaultPost: PostDetail
}

export function PostForm({
  onSubmit,
  onUploadToNotion,
  defaultPost,
}: PostFormProps) {
  const [isViewer, setIsViewer] = useState(true)
  const [postContent, setPostContent] = useState(defaultPost.postContent)
  const [postTitle, setPostTitle] = useState(defaultPost.postTitle)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSubmit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    setPostContent(defaultPost.postContent)
    setPostTitle(defaultPost.postTitle)
  }, [defaultPost])

  const handleSubmit = () => {
    if (defaultPost.postId) {
      onSubmit({ postId: defaultPost.postId, postTitle, postContent })
    }
  }

  const uploadToNotion = () => {
    console.log('Notion에 게시')
    if (defaultPost.postId) {
      onUploadToNotion({ postId: defaultPost.postId })
    }
  }

  return (
    <form className="template-form">
      <div className="form-group">
        <label>포스트 제목</label>
        <input
          type="text"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
        />
      </div>
      <div className="form-group">
        <div className="viewer-header">
          <label>포스트 내용</label>
          <button
            type="button"
            onClick={() => setIsViewer(!isViewer)}
            className="viewer-toggle-button">
            {isViewer ? '에디터 보기' : '마크다운 보기'}
          </button>
        </div>
        {isViewer ? (
          <div
            className="markdown-viewer"
            dangerouslySetInnerHTML={{
              __html: marked(postContent),
            }}
          />
        ) : (
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
        )}
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          className="flex-1 py-2 px-4 rounded text-sm font-medium">
          포스트 저장
        </button>
        {uploadToNotion && (
          <button
            onClick={uploadToNotion}
            className="flex-1 py-2 px-4 rounded text-sm font-medium">
            Notion에 게시
          </button>
        )}
      </div>
    </form>
  )
}
