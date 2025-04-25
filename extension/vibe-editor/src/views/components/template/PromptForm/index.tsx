import React, { FormEvent, useState } from 'react'

import { Snapshot } from '../../../../types/snapshot'
import { CreatePrompt, Prompt } from '../../../../types/template'
import './styles.css'

interface PromptFormProps {
  defaultPrompt: Prompt
  submitPrompt: (data: CreatePrompt) => void
  updatePrompt: (data: CreatePrompt) => void
  createPrompt: (data: CreatePrompt) => void
  localSnapshots: Snapshot[]
}

export function PromptForm({
  defaultPrompt,
  submitPrompt,
  updatePrompt,
  createPrompt,
  localSnapshots,
}: PromptFormProps) {
  const [formData, setFormData] = useState<CreatePrompt>(defaultPrompt)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (defaultPrompt.promptId) {
      updatePrompt(formData)
    } else {
      createPrompt(formData)
    }
  }
  const handlePost = () => {
    submitPrompt(formData)
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8">
      <div className="form-group">
        <label htmlFor="category">포스트 종류</label>
        <select
          id="postType"
          title="postType"
          name="postType"
          value={formData.postType}
          onChange={handleChange}
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
          name="promptName"
          value={formData.promptName}
          onChange={handleChange}
          required
        />
      </div>
      {formData.snapshots &&
        formData.snapshots.map((snapshot) => (
          <div className="form-group">
            <label htmlFor="description">코드 설명</label>
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
              name={`description-${snapshot.snapshotId}`}
              value={snapshot.description}
              onChange={handleChange}
              required
            />
          </div>
        ))}

      <div className="form-group">
        <label htmlFor="comment">프롬프트 내용</label>
        <textarea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={handleChange}
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
          포스트 생성
        </button>
      </div>
    </form>
  )
}
