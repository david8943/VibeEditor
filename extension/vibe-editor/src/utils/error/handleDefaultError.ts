import { isAxiosError } from 'axios'
import vscode from 'vscode'

// import { ErrorModalButtonTypes } from '@/constants/errors'
import { ApiErrorResponse } from '@/types/api'

interface FetchErrorModalProps {
  title: string
  content: string
  useSecondaryButton: boolean
  useI18n: boolean
  extensionContext: vscode.ExtensionContext
}

const fetchErrorModal = (props: FetchErrorModalProps) => {
  const { content, extensionContext } = props
  if (extensionContext) {
    vscode.window.showErrorMessage(content)
  }
}

export const handleDefaultError = (
  error: unknown,
  extensionContext: vscode.ExtensionContext | undefined,
) => {
  console.log(error)
  if (!extensionContext) {
    return
  }
  if (!isAxiosError(error)) {
    fetchErrorModal({
      title: `error.999.title`,
      content: `error.999.content`,
      useSecondaryButton: true,
      useI18n: true,
      extensionContext,
    })
    return Promise.reject({
      success: false,
      error: error,
    } as ApiErrorResponse)
  }
  let status = error.response?.status ?? error.code
  const responseData = error.response?.data?.data

  if (responseData && !responseData.success) {
    fetchErrorModal({
      title: '',
      content: responseData.message,
      useSecondaryButton: false,
      useI18n: false,
      extensionContext,
    })
    return Promise.reject(error.response?.data as ApiErrorResponse)
  }

  switch (status) {
    case 400:
    case 401:
    case 404:
    case 500:
      break
    case 'ERR_NETWORK':
      break

    default:
      status = 999
      break
  }

  fetchErrorModal({
    title: `error.${status}.title`,
    content: `error.${status}.content`,
    useSecondaryButton: true,
    useI18n: true,
    extensionContext,
  })

  return Promise.reject({
    success: false,
    error: {
      code: error.code,
      message: error.message,
    },
  } as ApiErrorResponse)
}
