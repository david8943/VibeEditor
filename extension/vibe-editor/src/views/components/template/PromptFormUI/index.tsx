import React from 'react'

import MinusIcon from '@/assets/icons/minus_circle.svg'
import { EditOptionList, EditPrompt, EditSnapshot } from '@/types/template'

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
  handleDeleteSnapshot: (attachId: number) => void
  handleDescriptionChange: (attachId: number, value: string) => void
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
                  <HighlightedCode code={snapshot.snapshotContent} />
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
        {handlePost && (
          <button
            onClick={handlePost}
            className="submit-button flex flex-1 justify-center">
            해당 프롬프트로 포스트 생성
          </button>
        )}
      </div>
    </form>
  )
}
