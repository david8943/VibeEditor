import { PostDetail } from './post'
import { Snapshot } from './snapshot'
import { PageType } from './webview'

export interface Template {
  templateId: number
  templateName: string
  category?: string // TODO: 삭제 필요
  prompts?: Prompt[] // TODO: 프롬프트 리스트로 변경 필요
  snapshots?: Snapshot[]
  // TODO: 스냅샷 리스트로 변경 필요
  updatedAt: string
  createdAt: string
}

export interface SubmitPrompt {
  prompt: Prompt
  selectedTemplateId: number
  selectedPromptId: number
  navigate?: (page: PageType) => Promise<void>
}

export interface SubmitPost {
  post: PostDetail
  selectedPostId: number
}

export interface PromptAttach {
  attachId: number
  snapshotId: number
  description: string
}
export interface CreatePrompt extends Omit<Prompt, 'promptId'> {}
export interface Prompt {
  templateId: number
  promptId: number
  promptName: string
  postType: string
  comment: string
  promptAttachList: PromptAttach[]
  promptOptionList: number[]
  databaseUid: string
  //	TODO: updatedAt, createdAt 추가 필요
}

export interface EditPrompt {
  templateId: number
  promptId: number
  promptName: string
  postType: string
  comment: string
  snapshots: EditSnapshot[]
  options: EditOptionList
}

export interface EditSnapshot {
  attachId: number
  snapshotName: string
  snapshotId: number
  content: string
  description: string
}

export interface EditOptionList {
  [optionName: string]: EditOption[]
}
export interface EditOption {
  optionId: number
  isSelected: boolean
  value: string
}
export interface OptionList {
  [optionName: string]: Option[]
}
export interface Option {
  optionId: number
  value: string
}
