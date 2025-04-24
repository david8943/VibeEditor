import React, { FormEvent, useEffect, useState } from 'react'

import { Snapshot } from '../../../../types/snapshot'
import { CreatePrompt } from '../../../../types/template'
import './styles.css'

// TailWind로 교체

interface PromptFormProps {
  onSubmit: (prompt: CreatePrompt) => void
  selectedTemplateId: number
  selectedPromptId: number
  localSnapshots: Snapshot[]
}

export function PromptForm({
  onSubmit,
  selectedTemplateId,
  selectedPromptId,
  localSnapshots,
}: PromptFormProps) {
  const [formData, setFormData] = useState<CreatePrompt>({
    prompt: {
      promptId: 0,
      promptName: '',
      postType: '',
      comment: '',
      snapshots: [],
      options: [],
      updatedAt: '',
      createdAt: '',
    },
    selectedTemplateId: selectedTemplateId,
    selectedPromptId: selectedPromptId,
  })

  useEffect(() => {
    if (window.vscode) {
      window.vscode.postMessage({
        type: 'ready',
        selectedTemplateId: formData.selectedTemplateId,
        selectedPromptId: formData.selectedPromptId,
      })
    }
  }, [formData.selectedTemplateId, formData.selectedPromptId])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    console.log('handleSubmit', formData)
    e.preventDefault()
    if (window.vscode) {
      window.vscode.postMessage({
        type: 'submitPrompt',
        data: {
          prompt: formData,
          selectedTemplateId: formData.selectedTemplateId,
          selectedPromptId: formData.selectedPromptId,
        },
      })
    }
    onSubmit({
      prompt: formData.prompt,
      selectedTemplateId: formData.selectedTemplateId,
      selectedPromptId: formData.selectedPromptId,
    })
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
        <label htmlFor="templateName">프롬프트 제목</label>
        <input
          type="text"
          id="promptName"
          name="promptName"
          title="promptName"
          value={formData.prompt.promptName}
          onChange={handleChange}
          required
        />
      </div>
      {formData.prompt.snapshots &&
        formData.prompt.snapshots.map((prompt) => (
          <div className="form-group">
            <label htmlFor="description">템플릿 설명</label>
            <pre className="code-block">
              <code>
                {
                  localSnapshots.find(
                    (snapshot) => snapshot.snapshotId === prompt.snapshotId,
                  )?.content
                }
              </code>
            </pre>
            <textarea
              id="description"
              name="description"
              value={prompt.description}
              onChange={handleChange}
              required
            />
          </div>
        ))}

      <div className="form-group">
        <label htmlFor="category">포스트 종류</label>
        <select
          id="postType"
          title="postType"
          name="postType"
          value={formData.prompt.postType}
          onChange={handleChange}
          required>
          <option value="">포스트 종류 선택</option>
          <option value="cs">CS 개념</option>
          <option value="troubleShooting">트러블 슈팅</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="comment">프롬프트 설명</label>
        <input
          type="text"
          id="comment"
          name="comment"
          value={formData.prompt.comment}
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
