import {
  CreatePost,
  Post,
  UploadToNotionRequest,
  UploadToNotionResponse,
} from '../types/post'
import { CreatePrompt, Option, Prompt, UpdatePrompt } from '../types/template'
import { getRequest, postRequest, putRequest } from './api'

export const getPrompt = async (promptId: number) =>
  await getRequest<Prompt>(`/prompt/${promptId}`)

export const updatePrompt = async (data: {
  updatePrompt: UpdatePrompt
  promptId: number
}) =>
  await putRequest<UploadToNotionResponse>(
    `/prompt/${data.promptId}`,
    data.updatePrompt,
  )

// 넣음
export const savePrompt = async (data: CreatePrompt) =>
  await postRequest<CreatePost>('/prompt', data)

export const generateClaude = async (data: UploadToNotionRequest) =>
  await postRequest<Post>('/prompt/ai-post', data)

export const getOptionList = async () =>
  await getRequest<Option[]>('/prompt/option')
