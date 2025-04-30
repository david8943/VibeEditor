import { Prompt, SubmitPrompt } from './template'

export const PageType = {
  TEMPLATE: 'TEMPLATE',
  POST: 'POST',
  SETTING: 'SETTING',
  LOADING: 'LOADING',
} as const

export type PageType = (typeof PageType)[keyof typeof PageType]
export const MessageType = {
  //공용
  COMMON: 'COMMON',
  RELOAD: 'RELOAD',
  NAVIGATE: 'NAVIGATE',
  INITIAL_PAGE: 'INITIAL_PAGE',
  CONFIG_CHANGE: 'CONFIG_CHANGE',
  WEBVIEW_READY: 'WEBVIEW_READY',
  // 템플릿 페이지
  SUBMIT_PROMPT: 'SUBMIT_PROMPT',
  UPDATE_PROMPT: 'UPDATE_PROMPT',
  CREATE_PROMPT: 'CREATE_PROMPT',
  DELETE_PROMPT: 'DELETE_PROMPT',
  GET_TEMPLATES: 'GET_TEMPLATES',
  GET_SNAPSHOTS: 'GET_SNAPSHOTS',
  TEMPLATE_SELECTED: 'TEMPLATE_SELECTED',
  SNAPSHOTS_LOADED: 'SNAPSHOTS_LOADED',
  PROMPT_SELECTED: 'PROMPT_SELECTED',
  DELETE_TEMPLATE: 'DELETE_TEMPLATE',
  DELETE_SNAPSHOT: 'DELETE_SNAPSHOT',
  SAVE_DATABASE: 'SAVE_DATABASE',
  GET_DATABASE: 'GET_DATABASE',

  // 포스트 페이지
  GET_CURRENT_POST: 'GET_CURRENT_POST',
  CURRENT_POST_LOADED: 'CURRENT_POST_LOADED',
  SUBMIT_POST: 'SUBMIT_POST',
} as const

export type MessageType = (typeof MessageType)[keyof typeof MessageType]

export interface Message {
  type: MessageType
  payload?: any
}

export interface CommonMessage extends Message {
  type: typeof MessageType.COMMON
  payload: string
}

export interface ReloadMessage extends Message {
  type: typeof MessageType.RELOAD
}

export interface NavigateMessage extends Message {
  type: typeof MessageType.NAVIGATE
  payload: {
    page: string
  }
}

export interface SubmitPromptMessage extends Message {
  type: typeof MessageType.SUBMIT_PROMPT
  payload: SubmitPrompt
}

export interface WebviewPageProps {
  postMessageToExtension: (message: Message) => void
}
