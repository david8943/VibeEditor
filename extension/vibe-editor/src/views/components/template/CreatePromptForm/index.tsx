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
  defaultPromptOptionIds: number[]
  defaultPostType: 'TECH_CONCEPT' | 'TROUBLE_SHOOTING'
}

export function CreatePromptForm({
  defaultPrompt,
  createPrompt,
  localSnapshots,
  deleteSnapshot,
  optionList,
  selectedPromptId,
  defaultPromptOptionIds,
  defaultPostType,
}: CreatePromptFormProps) {
  const initializedPrompt = defaultPrompt ?? {
    postType: defaultPostType,
    promptName: '',
    comment: '',
    promptOptionList: defaultPromptOptionIds,
    promptAttachList: [],
    notionDatabaseId: 0,
    templateId: 0,
    parentPromptId: null,
  }

  const {
    formMethods: { register, handleSubmit, setValue, watch },
    onSubmit,
    handlePost,
  } = useCreatePromptForm({
    defaultPrompt: initializedPrompt,
    createPrompt,
  })

  const { options, handleOption } = usePromptOptions({
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
