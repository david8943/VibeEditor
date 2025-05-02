import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import MinusIcon from '@/assets/icons/minus_circle.svg'
import { Snapshot } from '@/types/snapshot'
import {
  CreatePrompt,
  EditOption,
  EditOptionList,
  EditPrompt,
  EditSnapshot,
  OptionList,
  Prompt,
} from '@/types/template'

import { HighlightedCode } from '../../code/HighLightedCode'
import './styles.css'

interface PromptFormProps {
  defaultPrompt: Prompt | null
  submitPrompt: (data: Prompt) => void
  updatePrompt: (data: Prompt) => void
  createPrompt: (data: CreatePrompt) => void
  localSnapshots: Snapshot[]
  deleteSnapshot: (snapshotId: number) => void
  optionList: OptionList
  selectedPromptId: number
}

export function PromptForm({
  defaultPrompt,
  submitPrompt,
  updatePrompt,
  createPrompt,
  localSnapshots,
  deleteSnapshot,
  optionList,
  selectedPromptId,
}: PromptFormProps) {
  const setEditOption = (defaultPrompt: Prompt) => {
    const editOptionList: EditOptionList = {}
    for (const key in optionList) {
      const options = optionList[key]
      const editOptions: EditOption[] = []
      for (const option of options) {
        const selectedOption = defaultPrompt.promptOptionList.find(
          (optionId) => optionId === option.optionId,
        )
        editOptions.push({
          optionId: option.optionId,
          value: option.value,
          isSelected: !!selectedOption,
        })
      }
      editOptionList[key] = editOptions
    }
    return editOptionList
  }
  const setEditSnapshot = (defaultPrompt: Prompt) => {
    if (!defaultPrompt.promptAttachList) return []
    const editSnapshots: EditSnapshot[] = []
    for (const snapshot of defaultPrompt.promptAttachList) {
      const localSnapshot = localSnapshots.find(
        (localSnapshot) => localSnapshot.snapshotId === snapshot.snapshotId,
      )
      editSnapshots.push({
        attachId: snapshot.attachId,
        snapshotId: snapshot.snapshotId,
        content: localSnapshot?.content ?? '',
        description: snapshot.description,
        snapshotName: localSnapshot?.snapshotName ?? '',
      })
    }
    return editSnapshots
  }

  const setDefaultValues = (defaultPrompt: Prompt | null) => {
    if (!defaultPrompt) return {}
    console.log('setDefaultValues', defaultPrompt)
    const editOptionList: EditOptionList = setEditOption(defaultPrompt)
    const editSnapshots: EditSnapshot[] = setEditSnapshot(defaultPrompt)
    const editPrompt: EditPrompt = {
      templateId: defaultPrompt.templateId,
      promptId: defaultPrompt.promptId,
      promptName: defaultPrompt.promptName,
      postType: defaultPrompt.postType,
      comment: defaultPrompt.comment,
      snapshots: editSnapshots,
      options: editOptionList,
    }
    return editPrompt
  }

  const defaultValues = useMemo(
    () => setDefaultValues(defaultPrompt),
    [defaultPrompt],
  )

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EditPrompt>({
    defaultValues,
  })
  const snapshots = watch('snapshots')
  const options = watch('options')
  useEffect(() => {
    if (defaultPrompt) {
      setValue('snapshots', setEditSnapshot(defaultPrompt))
    }
  }, [localSnapshots])

  useEffect(() => {
    console.log('useEffect defaultPrompt', defaultPrompt)
    if (defaultPrompt) {
      reset({
        snapshots: setEditSnapshot(defaultPrompt),
        postType: defaultPrompt.postType,
        promptName: defaultPrompt.promptName,
        comment: defaultPrompt.comment,
        options: setEditOption(defaultPrompt),
      })
    }
  }, [defaultPrompt, reset])
  useEffect(() => {
    console.log('useEffect selectedPromptId', selectedPromptId)
  }, [selectedPromptId])

  const editPromptToPrompt = (editPrompt: EditPrompt) => {
    const prompt: Prompt = {
      templateId: defaultPrompt?.templateId ?? 0,
      promptId: defaultPrompt?.promptId ?? 0,
      promptName: editPrompt.promptName,
      postType: editPrompt.postType,
      comment: editPrompt.comment,
      promptAttachList: editPrompt.snapshots.map((snapshot) => ({
        attachId: snapshot.attachId,
        snapshotId: snapshot.snapshotId,
        description: snapshot.description,
      })),
      promptOptionList: Object.values(editPrompt.options)
        .flat()
        .filter((option) => option.isSelected)
        .map((option) => option.optionId),
      databaseUid: defaultPrompt?.databaseUid ?? '',
    }
    return prompt
  }

  const onSubmit = (data: EditPrompt) => {
    console.log('onSubmit', data)
    const prompt = editPromptToPrompt(data)
    console.log('onSubmit prompt', prompt)
    if (defaultPrompt?.promptId) {
      updatePrompt(prompt)
    } else {
      createPrompt(prompt)
    }
  }
  const handlePost = () => {
    const formData = editPromptToPrompt(watch())
    console.log('handlePost', formData)
    submitPrompt(formData)
  }
  const handleOption = (optionName: string, optionId: number) => {
    const updatedOptions = {
      ...options,
      [optionName]: options[optionName].map((option) =>
        option.optionId === optionId
          ? { ...option, isSelected: !option.isSelected }
          : { ...option, isSelected: false },
      ),
    }
    setValue('options', updatedOptions)
  }
  const handleDeleteSnapshot = useCallback(
    (attachId: number) => {
      deleteSnapshot(attachId)
      setValue(
        'snapshots',
        snapshots.filter((snapshot) => snapshot.attachId !== attachId),
      )
    },
    [deleteSnapshot, snapshots, setValue],
  )

  const handleDescriptionChange = (attachId: number, value: string) => {
    const updatedSnapshots = snapshots.map((snapshot) =>
      snapshot.attachId === attachId
        ? { ...snapshot, description: value }
        : snapshot,
    )
    setValue('snapshots', updatedSnapshots)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8">
      <div className="form-group">
        <label htmlFor="category">포스트 종류</label>
        <select
          id="postType"
          title="postType"
          {...register('postType')}
          required>
          <option value="">포스트 종류 선택</option>
          <option value="cs">CS 개념</option>
          <option value="troubleShooting">트러블 슈팅</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="promptName">프롬프트 제목</label>
        <input
          type="text"
          id="promptName"
          {...register('promptName')}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="snapshots">스냅 샷 </label>
        {snapshots &&
          snapshots.map((snapshot) => (
            <div
              className="flex flex-col flex-1 gap-4"
              key={snapshot.attachId}>
              <div>
                <label htmlFor="snapshotName">{snapshot.snapshotName}</label>
              </div>
              <div className="flex flex-1 gap-4 justify-center items-center">
                <div className="code-block">
                  <HighlightedCode code={snapshot.content} />
                </div>
                <textarea
                  id={`description-${snapshot.attachId}`}
                  value={snapshot.description}
                  onChange={(e) =>
                    handleDescriptionChange(snapshot.attachId, e.target.value)
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => handleDeleteSnapshot(snapshot.attachId)}
                  className="p-1 hover:bg-gray-100 rounded">
                  <MinusIcon
                    width={20}
                    height={20}
                    className="text-gray-500 hover:text-gray-700"
                  />
                </button>
              </div>
            </div>
          ))}
      </div>
      <div className="form-group">
        <label htmlFor="options">옵션 {Object.keys(options).length}</label>
        {options &&
          Object.keys(options).map((optionName) => (
            <div
              className="flex flex-1 gap-4 justify-center items-center"
              key={optionName}>
              {optionName}
              {options[optionName].map((option) => (
                <button
                  type="button"
                  key={option.optionId}
                  onClick={() => handleOption(optionName, option.optionId)}
                  style={{
                    backgroundColor: option.isSelected
                      ? 'gray !important'
                      : 'transparent !important',
                    border: option.isSelected ? '1px solid red' : 'none',
                  }}
                  className="p-1 hover:bg-gray-100 rounded">
                  {option.value}
                </button>
              ))}
            </div>
          ))}
      </div>
      <div className="form-group">
        <label htmlFor="comment">프롬프트 내용</label>
        <textarea
          id="comment"
          {...register('comment')}
          required
        />
      </div>
      <div className="flex flex-1 w-full gap-4">
        <button
          type="submit"
          className="submit-button flex flex-1 justify-center">
          프롬프트 저장
        </button>
        <button
          onClick={handlePost}
          className="submit-button flex flex-1 justify-center">
          해당 프롬프트로 포스트 생성
        </button>
      </div>
    </form>
  )
}
