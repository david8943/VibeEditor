import { UploadToNotionRequest, UploadToNotionResponse } from '../types/post'
import { postRequest } from './api'

// 넣음
export const uploadPost = async (data: UploadToNotionRequest) =>
  await postRequest<UploadToNotionResponse>('/post', data)
