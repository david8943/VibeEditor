import React, { useEffect, useRef, useState } from 'react'

import { marked } from 'marked'

import {
  Post,
  PostDetail,
  UploadToNotionRequestPost,
} from '../../../../types/post'
import TuiEditor, { TuiEditorRef } from '../../../components/editor/TuiEditor'
import './styles.css'

interface PostFormProps {
  onSubmit: (data: Post) => void
  onUploadToNotion: (data: { post: Post; shouldSave: boolean }) => void
  defaultPost: PostDetail
}

export function PostForm({
  onSubmit,
  onUploadToNotion,
  defaultPost,
}: PostFormProps) {
  const [isViewer, setIsViewer] = useState(true)
  const [shouldSave, setShouldSave] = useState(false)
  const [postTitle, setPostTitle] = useState(defaultPost.postTitle)
  const [postContent, setPostContent] = useState(defaultPost.postContent)
  const editorRef = useRef<TuiEditorRef>(null)

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
    setPostTitle(defaultPost.postTitle)
    setPostContent(defaultPost.postContent)
    setShouldSave(false)
  }, [defaultPost])

  const handleSubmit = () => {
    const content =
      isViewer && editorRef.current
        ? editorRef.current.getMarkdown()
        : postContent

    if (defaultPost.postId) {
      onSubmit({
        postId: defaultPost.postId,
        postTitle,
        postContent: content,
      })
    }
  }

  const uploadToNotion = () => {
    if (defaultPost.postId) {
      onUploadToNotion({
        post: { postId: defaultPost.postId, postContent, postTitle },
        shouldSave,
      })
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
            dangerouslySetInnerHTML={{ __html: marked(postContent) as string }}
          />
        ) : (
          <TuiEditor
            ref={editorRef}
            initialValue={postContent}
            onChange={(value) => {
              setShouldSave(true)
              setPostContent(value)
            }}
          />
        )}
      </div>
      {defaultPost.uploadStatus != 'LOADING' && (
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-2 px-4 rounded text-sm font-medium">
            포스트 저장
          </button>
          {uploadToNotion && (
            <button
              type="button"
              onClick={uploadToNotion}
              className="flex-1 py-2 px-4 rounded text-sm font-medium">
              Notion에 게시
            </button>
          )}
        </div>
      )}
    </form>
  )
}
