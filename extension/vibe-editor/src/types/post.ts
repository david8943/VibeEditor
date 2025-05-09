// 목록 조회용
export interface PostSummary {
  postId: number
  postTitle: string
  createdAt: string
  updatedAt: string
}

// 부모 포스트 정보
export interface ParentPost {
  postId: number
  postTitle: string
  createdAt: string
  updatedAt: string
}

// 상세 조회용
export interface PostDetail {
  postId: number
  postTitle: string
  postContent: string
  templateId: number
  promptId: number
  createdAt: string
  updatedAt: string
  parentPostIdList: ParentPost[]
}
export interface Post {
  postId: number
  postTitle: string
  postContent: string
}

export interface CreatePostRequest {
  promptId: number
}

export type CreatePost = Pick<PostDetail, 'postTitle' | 'postContent'>

export interface UploadToNotionRequest {
  promptId: number
}
export interface UploadToNotionRequestPost {
  postId: number
}

// 생성/수정 요청용
export interface PostSummary {
  postId: number
  postTitle: string
  createdAt: string
  updatedAt: string
  isLoading: boolean
}
export interface UploadToNotionResponse {
  postUrl: string
}
