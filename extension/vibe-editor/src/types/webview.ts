import { SnapshotItem } from '@/views/codeSnapshotView'

import { Prompt, SubmitPrompt } from './template'

export const PageType = {
  TEMPLATE: 'TEMPLATE',
  POST: 'POST',
  SETTING: 'SETTING',
  LOADING: 'LOADING',
  POST_VIEWER: 'POST_VIEWER',
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
  GET_TEMPLATE: 'GET_TEMPLATE',
  GET_SNAPSHOTS: 'GET_SNAPSHOTS',
  TEMPLATE_SELECTED: 'TEMPLATE_SELECTED',
  SNAPSHOTS_LOADED: 'SNAPSHOTS_LOADED',
  PROMPT_SELECTED: 'PROMPT_SELECTED',
  DELETE_TEMPLATE: 'DELETE_TEMPLATE',
  DELETE_SNAPSHOT: 'DELETE_SNAPSHOT',
  SAVE_DATABASE: 'SAVE_DATABASE',
  GET_DATABASE: 'GET_DATABASE',
  OPTIONS_LOADED: 'OPTIONS_LOADED',
  GET_OPTIONS: 'GET_OPTIONS',
  SNAPSHOT_SELECTED: 'SNAPSHOT_SELECTED',

  // 포스트 페이지
  GET_CURRENT_POST: 'GET_CURRENT_POST',
  CURRENT_POST_LOADED: 'CURRENT_POST_LOADED',
  SUBMIT_POST: 'SUBMIT_POST',
  SHOW_POST_VIEWER: 'SHOW_POST_VIEWER',
  START_LOADING: 'START_LOADING',
  STOP_LOADING: 'STOP_LOADING',

  // 설정 페이지
  GET_USER: 'GET_USER',
  USER_LOADED: 'USER_LOADED',
  GET_LOGIN_STATUS: 'GET_LOGIN_STATUS',
  LOGIN_STATUS_LOADED: 'LOGIN_STATUS_LOADED',
  SET_NOTION_SECRET_KEY: 'SET_NOTION_SECRET_KEY',
  LOG_OUT: 'LOG_OUT',
  GOOGLE_LOGIN: 'GOOGLE_LOGIN',
  GITHUB_LOGIN: 'GITHUB_LOGIN',
  REQUEST_DELETE_DATABASE: 'REQUEST_DELETE_DATABASE',
  DATABASE_DELETED: 'DATABASE_DELETED',
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
