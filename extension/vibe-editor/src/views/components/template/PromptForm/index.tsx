import React, { FormEvent, useState } from 'react'

import { Snapshot } from '../../../../types/snapshot'
import { CreatePrompt, Prompt } from '../../../../types/template'
import './styles.css'

interface PromptFormProps {
  defaultPrompt: Prompt
  onSubmit: (data: CreatePrompt) => void
  localSnapshots: Snapshot[]
}

export function PromptForm({
  defaultPrompt,
  onSubmit,
  localSnapshots,
}: PromptFormProps) {
  const [formData, setFormData] = useState<CreatePrompt>(defaultPrompt)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(formData)
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
      className="template-form">
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
      <button
        type="submit"
        className="submit-button">
        프롬프트 생성
      </button>
    </form>
  )
}
