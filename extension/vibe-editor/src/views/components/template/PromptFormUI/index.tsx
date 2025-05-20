import React, { useEffect, useState } from 'react'

import MinusIcon from '@/assets/icons/circle-slash.svg'

import { AIAPIKey } from '../../../../types/ai'
import { CreateDatabase } from '../../../../types/database'
import {
  EditOptionList,
  EditPrompt,
  EditSnapshot,
  PostType,
  PromptAttach,
} from '../../../../types/template'
import { DBSelector } from '../../../components'
import { DatabaseModal } from '../../../components/database/DatabaseModal'
import { AIProviderModal } from '../../aiProvider/AIProviderModal'
import { AIProviderSelector } from '../../aiProvider/AIProviderSelector'
import { HighlightedCode } from '../../code/HighlightedCode'
import { InfoToolTip } from '../../common/InfoToolTip'
import './styles.css'

interface PromptFormUIProps {
  formMethods: {
    register: any
    handleSubmit: any
    watch: any
    setValue: any
  }
  options: EditOptionList
  snapshots: EditSnapshot[]
  onSubmit: (data: EditPrompt) => void
  handlePost: () => void
  handleOption: (optionName: string, optionId: number) => void
  handleDeleteSnapshot: (attachId: number | null) => void
  handleDescriptionChange: (attachId: number | null, value: string) => void
  addSnapshot: (newSnapshot: PromptAttach) => void
  saveDatabase: (database: CreateDatabase) => void
  getDatabases: () => void
  getAIProviders: () => void
  saveAIProvider: (aiProvider: AIAPIKey) => void
  showGeneratePost: boolean
}

export function PromptFormUI({
  formMethods: { register, handleSubmit, watch, setValue },
  options,
  snapshots,
  onSubmit,
  handlePost,
  handleOption,
  handleDeleteSnapshot,
  handleDescriptionChange,
  saveDatabase,
  getDatabases,
  saveAIProvider,
  getAIProviders,
  showGeneratePost,
}: PromptFormUIProps) {
  const postTypeValue = watch('postType')
  const notionDatabaseId = watch('notionDatabaseId')
  const userAIProviderId = watch('userAIProviderId')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSubmit(onSubmit)()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
  const [showDbModal, setShowDbModal] = useState(false)
  const [showAIProviderModal, setShowAIProviderModal] = useState(false)
  return (
    <form className="flex flex-col gap-6">
      <div className="form-group">
        <label
          htmlFor="promptName"
          className="text-sm font-medium">
          템플릿 제목
        </label>
        <input
          type="text"
          id="promptName"
          className="w-full p-2 rounded"
          {...register('promptName')}
          required
        />
      </div>
      <div className="form-group">
        <label
          htmlFor="category"
          className="text-sm font-medium">
          포스트 유형
        </label>

        <div className="flex flex-wrap gap-2 items-center p-2">
          <button
            type="button"
            onClick={() => {
              console.log('Before setValue - postType:', postTypeValue)
              setValue('postType', PostType.TECH_CONCEPT)
              console.log('After setValue - postType:', watch('postType'))
            }}
            className={`px-3 py-1 rounded-full text-sm ${
              postTypeValue === PostType.TECH_CONCEPT
                ? 'selected'
                : 'unselected'
            }`}>
            CS 개념
          </button>
          <button
            type="button"
            onClick={() => {
              console.log('Before setValue - postType:', postTypeValue)
              setValue('postType', PostType.TROUBLE_SHOOTING)
              console.log('After setValue - postType:', watch('postType'))
            }}
            className={`px-3 py-1 rounded-full text-sm ${
              postTypeValue === PostType.TROUBLE_SHOOTING
                ? 'selected'
                : 'unselected'
            }`}>
            트러블 슈팅
          </button>
          <input
            type="hidden"
            {...register('postType')}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <div className="flex">
          <label
            htmlFor="snapshots"
            className="text-sm font-medium mr-1">
            스냅샷
          </label>
          <InfoToolTip description="템플릿 목록 안의 스냅샷을 추가할 수 있습니다. 코드 / 파일 / 디렉토리 구조 / 로그 등을 추가해보세요." />
        </div>

        {snapshots &&
          snapshots.map((snapshot) => (
            <div
              className="flex flex-col gap-4 p-4 rounded border border-[var(--vscode-input-border)]"
              key={snapshot.attachId}>
              <div className="flex justify-between">
                <label
                  htmlFor="snapshotName"
                  className="text-sm font-medium pre-wrap break-all w-3/4">
                  {snapshot.snapshotName}
                </label>
                <div
                  className="cursor-pointer"
                  onClick={() => handleDeleteSnapshot(snapshot.attachId)}>
                  <MinusIcon
                    width={20}
                    height={20}
                  />
                </div>
              </div>
              <div className="flex flex-col flex-1 gap-4 items-start w-full">
                <div className="flex flex-col flex-1 gap-2">
                  <div className="code-block w-full">
                    <HighlightedCode code={snapshot.snapshotContent} />
                  </div>
                  <div>{[...snapshot.snapshotContent].length}자</div>
                </div>
                <textarea
                  id={`description-${snapshot.attachId}`}
                  value={snapshot.description}
                  onChange={(e) =>
                    handleDescriptionChange(snapshot.attachId, e.target.value)
                  }
                  className="flex-1 min-h-[100px] p-2 rounded w-1/2"
                  placeholder="코드에 대한 설명을 입력해주세요."
                  required
                />
              </div>
            </div>
          ))}
      </div>
      {options && Object.keys(options).length > 0 && (
        <div className="form-group">
          <label
            htmlFor="options"
            className="text-sm font-medium">
            옵션
          </label>
          {Object.keys(options).map((optionName) => (
            <div
              className="flex flex-wrap gap-2 items-center p-2"
              key={optionName}>
              <span className="text-sm font-medium">{optionName}</span>
              {options[optionName].map((option) => (
                <button
                  type="button"
                  key={option.optionId}
                  onClick={() => handleOption(optionName, option.optionId)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    option.isSelected ? 'selected' : 'unselected'
                  }`}>
                  {option.value}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      <DBSelector
        selectedId={notionDatabaseId}
        onChange={(e) => {
          setValue('notionDatabaseId', e)
        }}
        getDatabases={getDatabases}
        onAddClick={() => setShowDbModal(true)}
      />
      {showDbModal && (
        <DatabaseModal
          saveDatabase={saveDatabase}
          onClose={() => setShowDbModal(false)}
        />
      )}
      <AIProviderSelector
        selectedId={userAIProviderId}
        onChange={(e) => {
          setValue('userAIProviderId', e)
        }}
        getAIProviders={getAIProviders}
        onAddClick={() => setShowAIProviderModal(true)}
      />
      {showAIProviderModal && (
        <AIProviderModal
          saveAIProvider={saveAIProvider}
          onClose={() => setShowAIProviderModal(false)}
        />
      )}
      <div className="form-group">
        <label
          htmlFor="comment"
          className="text-sm font-medium">
          유저 프롬프트
        </label>
        <textarea
          id="comment"
          className="w-full min-h-[150px] p-2 rounded"
          {...register('comment')}
          required
          placeholder="유저 프롬프트 내용을 입력해주세요."
        />
      </div>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          className="flex-1 py-2 px-4 rounded text-sm font-medium">
          템플릿 저장
        </button>
        {showGeneratePost && (
          <button
            type="button"
            onClick={handlePost}
            className="flex-1 py-2 px-4 rounded text-sm font-medium">
            해당 템플릿으로 AI 포스트 생성
          </button>
        )}
      </div>
    </form>
  )
}
