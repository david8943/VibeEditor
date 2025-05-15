import React, { useEffect } from 'react'

import { AIAPIKey } from 'dist/app/src/types/ai'

import { Snapshot } from '@/types/snapshot'
import { EditPrompt, Option, Prompt, SubmitPrompt } from '@/types/template'

import { CreateDatabase } from '../../../../types/database'
import { usePromptOptions } from '../../../hooks/usePromptOptions'
import { usePromptSnapshots } from '../../../hooks/usePromptSnapshots'
import { useUpdatePromptForm } from '../../../hooks/useUpdatePromptForm'
import { PromptFormUI } from '../PromptFormUI'

interface PromptFormProps {
  defaultPrompt: Prompt | null
  generatePost: (data: number) => void
  submitPrompt: (data: Prompt) => void
  localSnapshots: Snapshot[]
  deleteSnapshot: (snapshotId: number) => void
  optionList: Option[]
  selectedPromptId: number
  defaultPromptOptionIds: number[]
  defaultPostType: 'TECH_CONCEPT' | 'TROUBLE_SHOOTING'
  saveDatabase: (database: CreateDatabase) => void
  getDatabases: () => void
  getAIProviders: () => void
  saveAIProvider: (aiProvider: AIAPIKey) => void
}

export function PromptForm({
  defaultPrompt,
  submitPrompt,
  generatePost,
  localSnapshots,
  deleteSnapshot,
  optionList,
  selectedPromptId,
  defaultPromptOptionIds,
  defaultPostType,
  saveDatabase,
  getDatabases,
  getAIProviders,
  saveAIProvider,
}: PromptFormProps) {
  const initializedPrompt: Prompt = defaultPrompt ?? {
    postType: defaultPostType,
    promptName: '',
    comment: '',
    promptOptionList: defaultPromptOptionIds,
    promptAttachList: [],
    notionDatabaseId: 0,
    templateId: 0,
    userAIProviderId: null,
    promptId: 0,
    parentPrompt: {
      parentPromptId: 0,
      parentPromptName: '',
    },
  }

  const {
    formMethods: { register, handleSubmit, watch, setValue },
    onSubmit: originalOnSubmit,
    handlePost,
  } = useUpdatePromptForm({
    defaultPrompt: initializedPrompt,
    generatePost,
    submitPrompt,
    selectedPromptId,
  })

  const { options, handleOption, updateFormOptions } = usePromptOptions({
    optionList,
    promptOptionList: initializedPrompt.promptOptionList,
    setValue,
    watch,
  })

  const {
    snapshots,
    handleDeleteSnapshot,
    handleDescriptionChange,
    addSnapshot,
  } = usePromptSnapshots({
    localSnapshots,
    promptAttachList: initializedPrompt.promptAttachList,
    deleteSnapshot,
    setValue,
  })

  const onSubmit = async (data: EditPrompt) => {
    const updatedOptions = await updateFormOptions()
    originalOnSubmit({
      ...data,
      options: updatedOptions,
    })
  }

  useEffect(() => {
    console.log('프롬프트폼useEffect selectedPromptId', selectedPromptId)
  }, [selectedPromptId])

  useEffect(() => {
    console.log('프롬프트폼promptAttachList', defaultPrompt?.promptAttachList)
  }, [defaultPrompt?.promptAttachList])

  useEffect(() => {
    console.log('defaultPrompt', defaultPrompt)
  }, [defaultPrompt])
  return (
    <PromptFormUI
      formMethods={{ register, handleSubmit, watch, setValue }}
      options={options}
      snapshots={snapshots}
      onSubmit={onSubmit}
      handlePost={handlePost}
      handleOption={handleOption}
      handleDeleteSnapshot={handleDeleteSnapshot}
      handleDescriptionChange={handleDescriptionChange}
      addSnapshot={addSnapshot}
      saveDatabase={saveDatabase}
      getDatabases={getDatabases}
      getAIProviders={getAIProviders}
      saveAIProvider={saveAIProvider}
    />
  )
}
