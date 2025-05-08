import { PostDetail } from './post'
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

export interface UpdateTemplateRequest {
  templateId: number
  templateName: string
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

export interface UpdatePost {
  promptAttachList: [
    {
      attachId: number
      snapshotId: number
      description: string
    },
  ]
  promptName: string
  postType: string
  comment: string
  promptOptionList: number[]
  notionDatabaseId: number
}

export interface PromptAttach {
  attachId: number
  snapshotId: number
  description: string
}
export interface CreatePrompt
  extends Omit<Prompt, 'promptId' | 'parentPrompt'> {
  parentPromptId: number | null
}

export interface ParentPrompt {
  parentPromptId: number
  parentPromptName: string
}

export interface Prompt {
  parentPrompt: ParentPrompt | null
  templateId: number
  promptAttachList: PromptAttach[]
  promptId: number
  promptName: string
  postType: string
  comment: string
  promptOptionList: number[]
  notionDatabaseId: number
}

export interface EditPrompt {
  templateId: number
  promptId?: number
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
  snapshotContent: string
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
