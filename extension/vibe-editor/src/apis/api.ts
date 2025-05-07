import axios from 'axios'
import * as vscode from 'vscode'

import { ApiErrorResponse, ApiResponse } from '../types/api'
import { SecretType } from '../types/configuration'
import { handleDefaultError } from '../utils/error/handleDefaultError'

let extensionContext: vscode.ExtensionContext | undefined

export const setExtensionContext = (context: vscode.ExtensionContext) => {
  extensionContext = context
}

const api = axios.create({
  baseURL: `https://vibeeditor.site/api/v1`,
  // baseURL: `${process.env.NEXT_PUBLIC_FRONTEND_SCHEME}://${process.env.NEXT_PUBLIC_FRONTEND_HOST}${process.env.NEXT_PUBLIC_FRONTEND_PATH}`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  async (config) => {
    try {
      if (!extensionContext) {
        console.log('extensionContext가 없습니다')
        return config
      }

      const accessToken = await extensionContext.secrets.get(
        SecretType.accessToken,
      )

      if (accessToken) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${accessToken}`
      } else {
        delete config.headers.Authorization
      }

      return config
    } catch (error) {
      console.error('interceptor 에러:', error)
      return config
    }
  },
  (error) => {
    console.error('interceptor 에러 핸들러:', error)
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return handleDefaultError(error)
  },
)

export default api

export const getRequest = async <T>(url: string): Promise<ApiResponse<T>> => {
  try {
    const response = await api.get<ApiResponse<T>>(url)
    console.log('getRequest', response)
    return response.data
  } catch (error) {
    return error as ApiErrorResponse
  }
}

export const getBooleanRequest = async (url: string): Promise<boolean> => {
  const response = await getRequest<unknown>(url)
  return response.success
}

export const postRequest = async <T>(
  url: string,
  data?: object,
): Promise<ApiResponse<T>> => {
  try {
    console.log('postRequest 시작', { url, data })
    const response = await api.post<ApiResponse<T>>(url, data)
    console.log('postRequest 성공', response)
    return response.data
  } catch (error) {
    console.log('postRequest 에러', error)
    return error as ApiErrorResponse
  }
}

export const postBooleanRequest = async (
  url: string,
  data?: object,
): Promise<boolean> => {
  const response = await postRequest<unknown>(url, data)
  console.log('postBooleanRequest', response)
  return response.success
}

export const putRequest = async <T>(
  url: string,
  data: object,
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.put<ApiResponse<T>>(url, data)
    return response.data
  } catch (error) {
    return error as ApiErrorResponse
  }
}

export const patchRequest = async <T>(
  url: string,
  data: object,
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.patch<ApiResponse<T>>(url, data)
    return response.data
  } catch (error) {
    return error as ApiErrorResponse
  }
}

export const deleteRequest = async <T>(
  url: string,
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.delete<ApiResponse<T>>(url)
    return response.data
  } catch (error) {
    return error as ApiErrorResponse
  }
}

export const deleteBooleanRequest = async <T>(
  url: string,
): Promise<boolean> => {
  const response = await deleteRequest<unknown>(url)
  return response.success
}
