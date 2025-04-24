import React, { FormEvent, useState } from 'react'

import { CreatePost } from '../../../../types/post'
import { Message } from '../../../../types/webview'
import './styles.css'

interface PostFormProps {
  onSubmit: (prompt: CreatePost) => void
  defaultPost: CreatePost
}

export function PostForm({ onSubmit, defaultPost }: PostFormProps) {
  const [formData, setFormData] = useState<CreatePost>({
    postName: defaultPost.postName,
    postContent: defaultPost.postContent,
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="template-form">
      <div className="form-group">
        <label htmlFor="postName">포스트 제목</label>
        <input
          type="text"
          id="postName"
          name="postName"
          title="postName"
          value={formData.postName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="postContent">포스트 내용</label>
        <textarea
          id="postContent"
          name="postContent"
          value={formData.postContent}
          onChange={handleChange}
          required
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
