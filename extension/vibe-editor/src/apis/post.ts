import {
  Post,
  PostDetail,
  PostListItem,
  UpdatePost,
  UploadToNotionRequest,
  UploadToNotionRequestPost,
  UploadToNotionResponse,
} from '../types/post'
import { getRequest, postRequest, putBooleanRequest } from './api'

// 넣음
export const uploadPost = async (data: UploadToNotionRequestPost) =>
  await postRequest<UploadToNotionResponse>('/ai-post/upload', data)

export const upgradePost = async ({
  postId,
  updatePost,
}: {
  postId: number
  updatePost: UpdatePost
}) => await putBooleanRequest(`/ai-post/${postId}`, updatePost)

// getPostList
export const getPostList = async () =>
  await getRequest<PostListItem[]>('/ai-post')

// 포스트 조회
export const getPostDetail = async (postId: number) =>
  await getRequest<PostDetail>(`/ai-post/${postId}`)
