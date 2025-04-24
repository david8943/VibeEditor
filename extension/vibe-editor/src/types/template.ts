import { Snapshot } from './snapshot'

export interface Template {
  templateId: number
  templateName: string
  category?: string
  prompts?: Prompt[]
  snapshots?: Snapshot[]
  updatedAt: string
  createdAt: string
}

export interface CreatePrompt extends Omit<Prompt, 'promptId'> {}
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
