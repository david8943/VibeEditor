import { UploadToNotionRequest, UploadToNotionResponse } from '../types/post'
import { postRequest } from './api'

export const uploadPost = async (data: UploadToNotionRequest) =>
  await postRequest<UploadToNotionResponse>('/post', data)
