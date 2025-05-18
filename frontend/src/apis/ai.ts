import { AIAPIKey, AIProvider } from '../types/ai'
import { getRequest, postBooleanRequest, putBooleanRequest } from './api'

// 사용자 사용 가능 AI 조회
export const getAiProviderList = async () =>
  await getRequest<AIProvider[]>('/user/ai')

// 사용자 커스텀 AI의 API Key 수정
export const updateUserAPIKey = async (data: AIAPIKey) =>
  await putBooleanRequest('/user/ai', data)

// 사용자 커스텀 AI 등록
export const registerUserAPIKey = async (data: AIAPIKey) =>
  await postBooleanRequest('/user/ai', data)
