import { Post } from './post'
import { Snapshot } from './snapshot'
import { PageType } from './webview'

export interface Template {
  templateId: number
  templateName: string
  category?: string
  prompts?: Prompt[]
  snapshots?: Snapshot[]
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
export interface CreatePrompt extends Omit<Prompt, 'promptId'> {
  databaseUid: string
}
export interface Prompt {
  promptId: number
  promptName: string
  postType: string
  comment: string
  updatedAt: string
  createdAt: string
  snapshots: PromptSnapshot[]
  options: PromptOption[]
}

export interface PromptSnapshot {
  attachId: number
  promptId: number
  snapshotId: number
  description: string
  updatedAt: string
  createdAt: string
}

export interface PromptOption {
  promptOptionId: number
  promptId: number
  optionId: number
  isActive: boolean
  updatedAt: string
  createdAt: string
}

export interface Option {
  optionId: number
  optionName: string
  value: string
  updatedAt: string
  createdAt: string
}
