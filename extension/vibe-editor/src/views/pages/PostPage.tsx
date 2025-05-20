import React, { useEffect, useState } from 'react'
import { DotLoader } from 'react-spinners'

import AIBookImage from '../../assets/images/ai-book.svg'
import AINotesImage from '../../assets/images/ai-notes.svg'
import AIPostImage from '../../assets/images/ai-post.svg'
import { Post, PostDetail, UploadToNotionRequestPost } from '../../types/post'
import { MessageType, PageType, WebviewPageProps } from '../../types/webview'
import { PostForm } from '../components'

export function PostPage({ postMessageToExtension }: WebviewPageProps) {
  const [loading, setLoading] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [defaultPost, setDefaultPost] = useState<PostDetail>({
    postId: 0,
    postTitle: '디폴트 포스트 제목',
    postContent: '',
    createdAt: '',
    updatedAt: '',
    promptId: 0,
    templateId: 0,
    parentPostIdList: [],
    uploadStatus: 'LOADING',
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
        if (message.payload.post) {
          setDefaultPost(message.payload.post)
        }
        setShowOnboarding(false)
      } else if (message.type === MessageType.SHOW_POST_VIEWER) {
        setDefaultPost(message.payload)
        setShowOnboarding(false)
      } else if (message.type === MessageType.START_LOADING) {
        setLoading(true)
      } else if (message.type === MessageType.STOP_LOADING) {
        setLoading(false)
      } else if (message.type === MessageType.NAVIGATE) {
        postMessageToExtension({ type: MessageType.GET_CURRENT_POST })
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const onUploadToNotion = (data: { post: Post; shouldSave: boolean }) => {
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

  const navigateToTemplate = () => {
    const page = PageType.TEMPLATE
    postMessageToExtension({
      type: MessageType.NAVIGATE,
      payload: { page },
    })
  }
  useEffect(() => {
    console.log('defaultPost', defaultPost)
    setLoading(defaultPost?.uploadStatus == 'LOADING' || !defaultPost)
  }, [defaultPost])
  return (
    <div className="app-container items-center justify-center">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
          <DotLoader color="var(--vscode-button-background)" />
        </div>
      )}
      {showOnboarding && (
        <div
          id="container"
          style={{ height: '90vh' }}
          className="max-w-lg w-full flex items-center justify-center">
          <div
            id="item"
            className="flex flex-col items-center gap-6">
            <div className="rounded-full p-8 flex items-center justify-center border-2">
              <AIBookImage
                width={100}
                height={100}
                className="text-[var(--vscode-foreground)]"
              />
            </div>
            <div className="space-y-3 text-center">
              <h1 className="text-3xl font-bold">포스트를 생성해주세요</h1>
              <p className="text-base opacity-75">
                AI로 초안 포스트 생성 후, <br />
                포스트를 Notion에 작성할 수 있습니다
              </p>
            </div>
            <button
              type="button"
              className="px-6 py-3 rounded-full text-base font-medium transition-all hover:scale-105 active:scale-100"
              onClick={navigateToTemplate}>
              템플릿 페이지로 이동하기
            </button>
          </div>
        </div>
      )}
      {!showOnboarding && (
        <>
          <h1 className="text-2xl font-bold whitespace-pre-wrap">
            {`${defaultPost?.postTitle ?? '포스트'} 미리보기`}
          </h1>
          <PostForm
            defaultPost={defaultPost}
            onSubmit={onSubmit}
            onUploadToNotion={onUploadToNotion}
          />
        </>
      )}
    </div>
  )
}
