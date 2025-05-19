import { ReactElement } from 'react'

export type StartGuide = {
  isLogin: boolean
  isNotionSecretKey: boolean
  isNotionDatabase: boolean
  isProject: boolean
  isSnapshot: boolean
  isPost: boolean
  isNotionUpload: boolean
}

export type StartGuideItem = {
  id: string
  title: string
  description: string
}

export const StartGuideType = {
  isLogin: 'isLogin',
  isNotionSecretKey: 'isNotionSecretKey',
  isNotionDatabase: 'isNotionDatabase',
  isProject: 'isProject',
  isSnapshot: 'isSnapshot',
  isPost: 'isPost',
  isNotionUpload: 'isNotionUpload',
}

export type StartGuideType =
  (typeof StartGuideType)[keyof typeof StartGuideType]
