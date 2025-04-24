import { Prompt } from './template'

export type MessageType =
  | 'RELOAD'
  | 'COMMON'
  | 'SUBMIT_PROMPT'
  | 'NAVIGATE'
  | 'submitPost'
  | 'GET_TEMPLATES'
  | 'GET_SNAPSHOTS'
  | 'TEMPLATE_SELECTED'
  | 'SNAPSHOTS_LOADED'
  | 'POST_CREATION_SUCCESS'
  | 'GET_CURRENT_POST'
  | 'CONFIG_CHANGE'
  | 'CURRENT_POST_LOADED'
  | 'WEBVIEW_READY'

export interface Message {
  type: MessageType
  payload?: any
}

export interface CommonMessage extends Message {
  type: 'COMMON'
  payload: string
}

export interface ReloadMessage extends Message {
  type: 'RELOAD'
}

export interface NavigateMessage extends Message {
  type: 'NAVIGATE'
  payload: {
    page: string
  }
}

export interface SubmitPromptMessage extends Message {
  type: 'SUBMIT_PROMPT'
  payload: {
    prompt: Prompt
    selectedTemplateId: number
    selectedPromptId: number
  }
}
