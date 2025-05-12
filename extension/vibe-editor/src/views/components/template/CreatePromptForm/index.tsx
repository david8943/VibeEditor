import React, { useEffect } from 'react'

import { Snapshot } from '@/types/snapshot'
import { CreatePrompt, Option } from '@/types/template'

import { useCreatePromptForm } from '../../../hooks/useCreatePromptForm'
import { usePromptOptions } from '../../../hooks/usePromptOptions'
import { usePromptSnapshots } from '../../../hooks/usePromptSnapshots'
import { PromptFormUI } from '../PromptFormUI'

interface CreatePromptFormProps {
  defaultPrompt: CreatePrompt | null
  createPrompt: (data: CreatePrompt) => void
  localSnapshots: Snapshot[]
  deleteSnapshot: (snapshotId: number) => void
  optionList: Option[]
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
    formMethods: { register, handleSubmit, setValue, watch },
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
    console.log('useEffect selectedPromptId', selectedPromptId)
  }, [selectedPromptId])

  return (
    <div>
      <PromptFormUI
        formMethods={{ register, handleSubmit }}
        options={options}
        snapshots={snapshots}
        onSubmit={onSubmit}
        handlePost={null}
        handleOption={handleOption}
        handleDeleteSnapshot={handleDeleteSnapshot}
        handleDescriptionChange={handleDescriptionChange}
        addSnapshot={addSnapshot}
      />
    </div>
  )
}
