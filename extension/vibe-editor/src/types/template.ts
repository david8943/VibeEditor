import { Post, PostDetail } from './post'
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
  post: Post
  navigate?: (page: PageType) => Promise<void>
}
export interface SubmitUpdatePrompt {
  prompt: UpdatePrompt
  selectedTemplateId: number
  selectedPromptId: number
  navigate?: (page: PageType) => Promise<void>
}

export interface SubmitCreatePrompt {
  prompt: CreatePrompt
  selectedTemplateId: number
  navigate?: (page: PageType) => Promise<void>
}

export interface SubmitPost {
  post: PostDetail
  selectedPostId: number
}
export const PostType = {
  TECH_CONCEPT: 'TECH_CONCEPT',
  TROUBLE_SHOOTING: 'TROUBLE_SHOOTING',
} as const

export type PostType = (typeof PostType)[keyof typeof PostType]

export interface UpdatePost {
  promptAttachList: [
    {
      attachId: number
      snapshotId: number
      description: string
    },
  ]
  promptName: string
  postType: PostType
  comment: string
  promptOptionList: number[]
  notionDatabaseId: number
}

export interface PromptAttach {
  attachId: number | null
  snapshotId: number
  description: string
}
export interface CreatePrompt
  extends Omit<Prompt, 'promptId' | 'parentPrompt'> {
  parentPromptId: number | null
}
export interface UpdatePrompt
  extends Omit<Prompt, 'promptId' | 'parentPrompt'> {}
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
  attachId: number | null
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
export interface Option {
  optionId: number
  value: string
}
export interface OptionItem {
  optionId: number
  value: string
}

export interface Option {
  optionName: string
  optionItems: OptionItem[]
}

export interface SelectPrompt {
  promptId: number
  templateId: number
}
