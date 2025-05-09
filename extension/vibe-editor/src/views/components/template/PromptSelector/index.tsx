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
      <label>프롬프트 선택</label>
      {selectedTemplate && (
        <select
          value={selectedPromptId || ''}
          onChange={(e) => {
            console.log('e.target.value', e.target.value)
            console.log('selectedTemplate', selectedTemplate)
            console.log('promptList', selectedTemplate?.promptList)
            const prompt = selectedTemplate.promptList?.find(
              (t) => t.promptId === parseInt(e.target.value),
            )
            console.log('prompt', prompt)
            if (prompt) {
              selectPromptId(prompt.promptId)
            }
          }}>
          <option value="0">새 프롬프트 생성하기</option>
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
