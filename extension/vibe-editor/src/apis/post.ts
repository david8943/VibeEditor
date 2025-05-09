import {
  UploadToNotionRequest,
  UploadToNotionRequestPost,
  UploadToNotionResponse,
} from '../types/post'
import { postRequest } from './api'

// 넣음
export const uploadPost = async (data: UploadToNotionRequestPost) =>
  await postRequest<UploadToNotionResponse>('/ai-post/upload', data)
