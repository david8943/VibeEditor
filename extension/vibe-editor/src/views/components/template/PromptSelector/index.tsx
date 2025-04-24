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
    <div className="form-group">
      <label>프롬프트 선택</label>
      <select
        value={selectedPromptId || ''}
        onChange={(e) => {
          const prompt = selectedTemplate?.prompts?.find(
            (t) => t.promptId === parseInt(e.target.value),
          )
          if (prompt) {
            selectPromptId(prompt.promptId)
          }
        }}>
        <option value="">프롬프트를 선택하세요</option>
        {selectedTemplate?.prompts?.map((prompt) => (
          <option
            key={prompt.promptId}
            value={prompt.promptId}>
            {prompt.promptName}
          </option>
        ))}
      </select>
    </div>
  )
}
