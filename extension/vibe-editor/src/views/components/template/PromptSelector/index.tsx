import React from 'react'

import { Template } from '../../../../types/template'
import './styles.css'

interface PromptSelectorProps {
  selectedTemplate: Template | null
  selectedPromptId: number
  selectPromptId: (promptId: number) => void
}

export function PromptSelector({
  selectedTemplate,
  selectedPromptId,
  selectPromptId,
}: PromptSelectorProps) {
  return (
    <div className="form-group flex flex-col gap-4">
      <label>템플릿 선택</label>
      {selectedTemplate && (
        <select
          value={selectedPromptId || ''}
          onChange={(e) => {
            const prompt = selectedTemplate.promptList?.find(
              (t) => t.promptId === parseInt(e.target.value),
            )
            if (prompt) {
              selectPromptId(prompt.promptId)
            }
          }}>
          <option value="0">새 템플릿 생성하기</option>
          {selectedTemplate.promptList?.map((prompt) => (
            <option
              key={prompt.promptId}
              value={prompt.promptId}>
              {prompt.promptName}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
