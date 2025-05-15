import {
  CreatePost,
  Post,
  UploadToNotionRequest,
  UploadToNotionResponse,
} from '../types/post'
import {
  CreatePrompt,
  Option,
  PromptResponse,
  SubmitPrompt,
} from '../types/template'
import { getRequest, postRequest, putRequest } from './api'

export const getPrompt = async (promptId: number) =>
  await getRequest<PromptResponse>(`/prompt/${promptId}`)

export const submitPrompt = async (data: {
  submitPrompt: SubmitPrompt
  promptId: number
}) =>
  await putRequest<UploadToNotionResponse>(
    `/prompt/${data.promptId}`,
    data.submitPrompt,
  )

export const savePrompt = async (data: CreatePrompt) =>
  await postRequest<CreatePost>('/prompt', data)

export const generateAIPost = async (data: UploadToNotionRequest) =>
  await postRequest<Post>('/prompt/ai-post', data)

export const getOptionList = async () =>
  await getRequest<Option[]>('/prompt/option')
