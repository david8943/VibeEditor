import React, { useEffect, useState } from 'react'

import { AIAPIKey } from 'dist/app/src/types/ai'

import MinusIcon from '@/assets/icons/minus_circle.svg'
import {
  EditOptionList,
  EditPrompt,
  EditSnapshot,
  PostType,
  PromptAttach,
} from '@/types/template'

import { CreateDatabase } from '../../../../types/database'
import { DBSelector } from '../../../components'
import { DatabaseModal } from '../../../components/database/DatabaseModal'
import { AIProviderModal } from '../../aiProvider/AIProviderModal'
import { AIProviderSelector } from '../../aiProvider/AIProviderSelector'
import { HighlightedCode } from '../../code/HighLightedCode'
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
  handlePost: (() => void) | null
  handleOption: (optionName: string, optionId: number) => void
  handleDeleteSnapshot: (attachId: number | null) => void
  handleDescriptionChange: (attachId: number | null, value: string) => void
  addSnapshot: (newSnapshot: PromptAttach) => void
  saveDatabase: (database: CreateDatabase) => void
  getDatabases: () => void
  getAIProviders: () => void
  saveAIProvider: (aiProvider: AIAPIKey) => void
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
}: PromptFormUIProps) {
  const postTypeValue = watch('postType')
  const notionDatabaseId = watch('notionDatabaseId')

  //TODO: 스냅 샷 코드 너무 길면 삐져나옴
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
          포스트 제목
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
            onClick={() => setValue('postType', PostType.TECH_CONCEPT)}
            className={`px-3 py-1 rounded-full text-sm ${
              postTypeValue === PostType.TECH_CONCEPT
                ? 'selected'
                : 'unselected'
            }`}>
            CS 개념
          </button>
          <button
            type="button"
            onClick={() => setValue('postType', PostType.TROUBLE_SHOOTING)}
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
        <label
          htmlFor="snapshots"
          className="text-sm font-medium">
          스냅 샷
        </label>
        {snapshots &&
          snapshots.map((snapshot) => (
            <div
              className="flex flex-col gap-4 p-4 rounded border border-[var(--vscode-input-border)]"
              key={snapshot.attachId}>
              <div>
                <label
                  htmlFor="snapshotName"
                  className="text-sm font-medium">
                  {snapshot.snapshotName}
                </label>
              </div>
              <div className="flex flex-col flex-1 gap-4 items-start w-full">
                <div className="code-block flex-1">
                  <HighlightedCode code={snapshot.snapshotContent} />
                </div>
                <textarea
                  id={`description-${snapshot.attachId}`}
                  value={snapshot.description}
                  onChange={(e) =>
                    handleDescriptionChange(snapshot.attachId, e.target.value)
                  }
                  className="flex-1 min-h-[100px] p-2 rounded"
                  placeholder="코드에 대한 설명을 입력해주세요."
                  required
                />
                <button
                  type="button"
                  onClick={() => handleDeleteSnapshot(snapshot.attachId)}
                  className="p-2 hover:bg-[var(--vscode-button-hoverBackground)] rounded">
                  <MinusIcon
                    width={20}
                    height={20}
                    className="text-[var(--vscode-foreground)]"
                  />
                </button>
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
        selectedId={notionDatabaseId}
        onChange={(e) => {
          setValue('notionDatabaseId', e)
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
          onClick={handleSubmit(onSubmit)}
          className="flex-1 py-2 px-4 rounded text-sm font-medium">
          프롬프트 저장
        </button>
        {handlePost && (
          <button
            onClick={handlePost}
            className="flex-1 py-2 px-4 rounded text-sm font-medium">
            해당 프롬프트로 AI 포스트 생성
          </button>
        )}
      </div>
    </form>
  )
}
