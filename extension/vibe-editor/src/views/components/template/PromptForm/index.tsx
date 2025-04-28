import React, { FormEvent, useState } from 'react'

import { Snapshot } from '../../../../types/snapshot'
import { CreatePrompt, Prompt } from '../../../../types/template'
// import minusCircle from './minus_circle.svg'
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

      <div className="form-group">
        <label htmlFor="description">스냅 샷</label>
        {formData.snapshots &&
          formData.snapshots.map((snapshot) => (
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
                name={`description-${snapshot.snapshotId}`}
                value={snapshot.description}
                onChange={handleChange}
                required
              />
              {/* <img
                src={minusCircle}
                alt="스냅샷 제거"
              /> */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 0C15.523 0 20 4.1047 20 9.16842C20 14.2321 15.523 18.3368 10 18.3368C4.477 18.3368 0 14.2321 0 9.16842C0 4.1047 4.477 0 10 0ZM10 1.83368C7.87827 1.83368 5.84344 2.60645 4.34315 3.98198C2.84285 5.35751 2 7.22313 2 9.16842C2 11.1137 2.84285 12.9793 4.34315 14.3549C5.84344 15.7304 7.87827 16.5032 10 16.5032C12.1217 16.5032 14.1566 15.7304 15.6569 14.3549C17.1571 12.9793 18 11.1137 18 9.16842C18 7.22313 17.1571 5.35751 15.6569 3.98198C14.1566 2.60645 12.1217 1.83368 10 1.83368ZM14 8.25158C14.2549 8.25184 14.5 8.34132 14.6854 8.50174C14.8707 8.66216 14.9822 8.88141 14.9972 9.11469C15.0121 9.34798 14.9293 9.57768 14.7657 9.75688C14.6021 9.93608 14.3701 10.0512 14.117 10.0788L14 10.0853H6C5.74512 10.085 5.49997 9.99553 5.31463 9.83511C5.1293 9.67469 5.01777 9.45544 5.00283 9.22216C4.98789 8.98887 5.07067 8.75917 5.23426 8.57997C5.39786 8.40077 5.6299 8.2856 5.883 8.258L6 8.25158H14Z"
                  fill="#21252B"
                />
              </svg>
            </div>
          ))}
      </div>
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
          해당 프롬프트로 포스트 생성
        </button>
      </div>
    </form>
  )
}
