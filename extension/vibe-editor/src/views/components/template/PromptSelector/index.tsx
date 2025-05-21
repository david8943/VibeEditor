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
      <label>스토리 선택</label>
      {selectedTemplate && (
        <select
          value={selectedPromptId || ''}
          onChange={(e) => {
            selectPromptId(parseInt(e.target.value))
          }}>
          <option value="0">새 스토리 생성하기</option>
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
