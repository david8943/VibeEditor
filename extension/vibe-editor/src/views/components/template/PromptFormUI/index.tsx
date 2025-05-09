import React from 'react'

import MinusIcon from '@/assets/icons/minus_circle.svg'
import {
  EditOptionList,
  EditPrompt,
  EditSnapshot,
  PostType,
  PromptAttach,
} from '@/types/template'

import { HighlightedCode } from '../../code/HighLightedCode'
import './styles.css'

interface PromptFormUIProps {
  formMethods: {
    register: any
    handleSubmit: any
  }
  options: EditOptionList
  snapshots: EditSnapshot[]
  onSubmit: (data: EditPrompt) => void
  handlePost: (() => void) | null
  handleOption: (optionName: string, optionId: number) => void
  handleDeleteSnapshot: (attachId: number | null) => void
  handleDescriptionChange: (attachId: number | null, value: string) => void
  addSnapshot: (newSnapshot: PromptAttach) => void
}

export function PromptFormUI({
  formMethods: { register, handleSubmit },
  options,
  snapshots,
  onSubmit,
  handlePost,
  handleOption,
  handleDeleteSnapshot,
  handleDescriptionChange,
}: PromptFormUIProps) {
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6">
      <div className="form-group">
        <label
          htmlFor="category"
          className="text-sm font-medium">
          포스트 종류
        </label>
        <select
          id="postType"
          title="postType"
          {...register('postType')}
          className="w-full p-2 rounded border border-[var(--vscode-dropdown-border)] bg-[var(--vscode-dropdown-background)] text-[var(--vscode-dropdown-foreground)]"
          required>
          <option value={PostType.TECH_CONCEPT}>CS 개념</option>
          <option value={PostType.TROUBLE_SHOOTING}>트러블 슈팅</option>
        </select>
      </div>
      <div className="form-group">
        <label
          htmlFor="promptName"
          className="text-sm font-medium">
          프롬프트 제목
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
              <div className="flex flex-1 gap-4 items-start">
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
            옵션 {Object.keys(options).length}
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
                  className={`px-3 py-1 rounded text-sm ${
                    option.isSelected
                      ? 'bg-[var(--vscode-button-background)]'
                      : 'bg-[var(--vscode-editor-background)]'
                  }`}>
                  {option.value}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      <div className="form-group">
        <label
          htmlFor="comment"
          className="text-sm font-medium">
          프롬프트 내용
        </label>
        <textarea
          id="comment"
          className="w-full min-h-[150px] p-2 rounded"
          {...register('comment')}
          required
          placeholder="프롬프트 내용을 입력해주세요."
        />
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 py-2 px-4 rounded text-sm font-medium">
          프롬프트 저장
        </button>
        {handlePost && (
          <button
            onClick={handlePost}
            className="flex-1 py-2 px-4 rounded text-sm font-medium">
            해당 프롬프트로 포스트 생성
          </button>
        )}
      </div>
    </form>
  )
}
