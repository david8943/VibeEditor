import React, { useEffect } from 'react'

import { Snapshot } from '@/types/snapshot'
import { EditPrompt, Option, Prompt, UpdatePrompt } from '@/types/template'

import { usePromptOptions } from '../../../hooks/usePromptOptions'
import { usePromptSnapshots } from '../../../hooks/usePromptSnapshots'
import { useUpdatePromptForm } from '../../../hooks/useUpdatePromptForm'
import { PromptFormUI } from '../PromptFormUI'

interface PromptFormProps {
  defaultPrompt: Prompt | null
  submitPrompt: (data: Prompt) => void
  updatePrompt: (data: UpdatePrompt) => void
  localSnapshots: Snapshot[]
  deleteSnapshot: (snapshotId: number) => void
  optionList: Option[]
  selectedPromptId: number

  // ✅ 새로 추가할 설정값
  defaultPromptOptionIds: number[]
  defaultPostType: 'TECH_CONCEPT' | 'TROUBLE_SHOOTING'
}

export function PromptForm({
  defaultPrompt,
  submitPrompt,
  updatePrompt,
  localSnapshots,
  deleteSnapshot,
  optionList,
  selectedPromptId,
  defaultPromptOptionIds,
  defaultPostType,
}: PromptFormProps) {
  const initializedPrompt: Prompt = defaultPrompt ?? {
    postType: defaultPostType,
    promptName: '',
    comment: '',
    promptOptionList: defaultPromptOptionIds,
    promptAttachList: [],
    notionDatabaseId: 0,
    templateId: 0,
    promptId: 0, // 필수
    parentPrompt: null, // 필수
  }

  const {
    formMethods: { register, handleSubmit, watch, setValue },
    onSubmit: originalOnSubmit,
    handlePost,
  } = useUpdatePromptForm({
    defaultPrompt: initializedPrompt,
    submitPrompt,
    updatePrompt,
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

  return (
    <PromptFormUI
      formMethods={{ register, handleSubmit }}
      options={options}
      snapshots={snapshots}
      onSubmit={onSubmit}
      handlePost={handlePost}
      handleOption={handleOption}
      handleDeleteSnapshot={handleDeleteSnapshot}
      handleDescriptionChange={handleDescriptionChange}
      addSnapshot={addSnapshot}
    />
  )
}
