import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import MinusIcon from '@/assets/icons/minus_circle.svg'
import { Snapshot } from '@/types/snapshot'
import { CreatePrompt, Prompt } from '@/types/template'

import './styles.css'

interface PromptFormProps {
  defaultPrompt: Prompt
  submitPrompt: (data: CreatePrompt) => void
  updatePrompt: (data: CreatePrompt) => void
  createPrompt: (data: CreatePrompt) => void
  localSnapshots: Snapshot[]
  deleteSnapshot: (snapshotId: number) => void
}

export function PromptForm({
  defaultPrompt,
  submitPrompt,
  updatePrompt,
  createPrompt,
  localSnapshots,
  deleteSnapshot,
}: PromptFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreatePrompt>({
    defaultValues: defaultPrompt,
  })
  const snapshots = watch('snapshots')

  useEffect(() => {
    console.log('snapshots', snapshots)
  }, [snapshots])

  useEffect(() => {
    if (defaultPrompt) {
      reset({
        snapshots: defaultPrompt.snapshots,
        postType: defaultPrompt.postType,
        promptName: defaultPrompt.promptName,
        comment: defaultPrompt.comment,
        updatedAt: defaultPrompt.updatedAt,
        createdAt: defaultPrompt.createdAt,
        options: defaultPrompt.options,
      })
    }
  }, [defaultPrompt, reset])
  const onSubmit = (data: CreatePrompt) => {
    if (defaultPrompt?.promptId) {
      updatePrompt(data)
    } else {
      createPrompt(data)
    }
  }
  const handlePost = () => {
    const formData = watch()
    submitPrompt(formData)
  }

  const handleDeleteSnapshot = useCallback(
    (snapshotId: number) => {
      deleteSnapshot(snapshotId)
      setValue(
        'snapshots',
        snapshots.filter((snapshot) => snapshot.snapshotId !== snapshotId),
      )
    },
    [deleteSnapshot, snapshots, setValue],
  )

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
        <label htmlFor="description">스냅 샷 {snapshots.length}</label>
        {snapshots &&
          snapshots.map((snapshot) => (
            <div
              className="flex flex-1 gap-4 justify-center items-center"
              key={snapshot.snapshotId}>
              <pre className="code-block">
                <code>
                  {
                    localSnapshots.find(
                      (snapshot) => snapshot.snapshotId === snapshot.snapshotId,
                    )?.content
                  }
                </code>
              </pre>
              <textarea
                id={`description-${snapshot.snapshotId}`}
                {...register(`snapshots.${snapshot.snapshotId}.description`)}
                required
              />
              <button
                type="button"
                onClick={() => handleDeleteSnapshot(snapshot.snapshotId)}
                className="p-1 hover:bg-gray-100 rounded">
                <MinusIcon
                  width={20}
                  height={20}
                  className="text-gray-500 hover:text-gray-700"
                />
              </button>
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
