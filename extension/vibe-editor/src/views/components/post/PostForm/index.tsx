import React, { FormEvent, useState } from 'react'

import { marked } from 'marked'

import { PostDetail, UploadToNotionRequestPost } from '../../../../types/post'
import './styles.css'

interface PostFormProps {
  onSubmit: (data: UploadToNotionRequestPost) => void
  defaultPost: PostDetail
}

export function PostForm({ onSubmit, defaultPost }: PostFormProps) {
  const [isViewer, setIsViewer] = useState(true)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (defaultPost.postId) {
      onSubmit({ postId: defaultPost.postId })
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="template-form">
      <div className="form-group">
        <label>포스트 제목</label>
        <input
          type="text"
          value={defaultPost.postTitle}
          readOnly
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
              __html: marked(defaultPost.postContent),
            }}
          />
        ) : (
          <textarea
            value={defaultPost.postContent}
            readOnly
          />
        )}
      </div>
      <button
        type="submit"
        className="submit-button">
        포스트 생성
      </button>
    </form>
  )
}
