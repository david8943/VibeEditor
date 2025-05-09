import React, { FormEvent } from 'react'

import {
  PostDetail,
  UploadToNotionRequest,
  UploadToNotionRequestPost,
} from '../../../../types/post'
import './styles.css'

interface PostFormProps {
  onSubmit: (data: UploadToNotionRequestPost) => void
  defaultPost: PostDetail
}

export function PostForm({ onSubmit, defaultPost }: PostFormProps) {
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
        <label>포스트 내용</label>
        <textarea
          value={defaultPost.postContent}
          readOnly
        />
      </div>
      <button
        type="submit"
        className="submit-button">
        포스트 생성
      </button>
    </form>
  )
}
