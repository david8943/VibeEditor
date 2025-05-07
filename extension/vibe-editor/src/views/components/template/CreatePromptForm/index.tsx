import React, { useEffect } from 'react'

import { Snapshot } from '@/types/snapshot'
import { CreatePrompt, OptionList } from '@/types/template'

import { useCreatePromptForm } from '../../../hooks/useCreatePromptForm'
import { usePromptOptions } from '../../../hooks/usePromptOptions'
import { usePromptSnapshots } from '../../../hooks/usePromptSnapshots'
import { PromptFormUI } from '../PromptFormUI'

interface CreatePromptFormProps {
  defaultPrompt: CreatePrompt | null
  createPrompt: (data: CreatePrompt) => void
  localSnapshots: Snapshot[]
  deleteSnapshot: (snapshotId: number) => void
  optionList: OptionList
  selectedPromptId: number
}

export function CreatePromptForm({
  defaultPrompt,
  createPrompt,
  localSnapshots,
  deleteSnapshot,
  optionList,
  selectedPromptId,
}: CreatePromptFormProps) {
  const {
    formMethods: { register, handleSubmit, setValue },
    onSubmit,
    handlePost,
  } = useCreatePromptForm({
    defaultPrompt,
    createPrompt,
  })

  const { options, handleOption } = usePromptOptions({
    optionList,
    promptOptionList: defaultPrompt?.promptOptionList || [],
    setValue,
  })

  const { snapshots, handleDeleteSnapshot, handleDescriptionChange } =
    usePromptSnapshots({
      localSnapshots,
      promptAttachList: defaultPrompt?.promptAttachList ?? [],
      deleteSnapshot,
      setValue,
    })

  useEffect(() => {
    console.log('useEffect selectedPromptId', selectedPromptId)
  }, [selectedPromptId])

  return (
    <PromptFormUI
      formMethods={{ register, handleSubmit }}
      options={options}
      snapshots={snapshots}
      onSubmit={onSubmit}
      handlePost={null}
      handleOption={handleOption}
      handleDeleteSnapshot={handleDeleteSnapshot}
      handleDescriptionChange={handleDescriptionChange}
    />
  )
}
