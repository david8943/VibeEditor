export const SecretType = {
  accessToken: 'vibeEditor.accessToken',
  notionSecretKey: 'vibeEditor.notionSecretKey ',
}

export type SecretType = (typeof SecretType)[keyof typeof SecretType]

export const DraftDataType = {
  loginStatus: 'loginStatus',
  notionStatus: 'notionStatus',
  selectedTemplateId: 'selectedTemplateId',
  selectedPromptId: 'selectedPromptId',
  selectedPostId: 'selectedPostId',
} as const

export type DraftDataType = (typeof DraftDataType)[keyof typeof DraftDataType]
