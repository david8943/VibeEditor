import React, { useEffect } from 'react'

import { Snapshot } from '@/types/snapshot'
import { CreatePrompt, Option, Prompt, UpdatePrompt } from '@/types/template'

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
}

export function PromptForm({
  defaultPrompt,
  submitPrompt,
  updatePrompt,
  localSnapshots,
  deleteSnapshot,
  optionList,
  selectedPromptId,
}: PromptFormProps) {
  const {
    formMethods: { register, handleSubmit, watch, setValue },
    onSubmit,
    handlePost,
  } = useUpdatePromptForm({
    defaultPrompt,
    submitPrompt,
    updatePrompt,
  })

  const { options, handleOption } = usePromptOptions({
    optionList,
    promptOptionList: defaultPrompt?.promptOptionList ?? [],
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
    promptAttachList: defaultPrompt?.promptAttachList ?? [],
    deleteSnapshot,
    setValue,
  })

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
