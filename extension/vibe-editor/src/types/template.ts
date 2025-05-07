import { Post } from './post'
import { Snapshot } from './snapshot'
import { PageType } from './webview'

export interface Template {
  templateId: number
  templateName: string
  promptList?: Prompt[]
  snapshotList?: Snapshot[]
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
  post: Post
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
  // TODO: parentPromptId 추가 필요
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
