import React, { useState } from 'react'

import { AIAPIKey, BrandType } from '../../../../types/ai'

interface Props {
  saveAIProvider: (aiProvider: AIAPIKey) => void
  onClose: () => void
}

export const AIProviderModal = ({ onClose, saveAIProvider }: Props) => {
  const [brandModal, setBrandModal] = useState('')
  const [apiKeyModal, setApiKeyModal] = useState('')

  const handleSubmit = () => {
    const aiProvider: AIAPIKey = {
      brand: brandModal,
      apiKey: apiKeyModal,
    }
    saveAIProvider(aiProvider)
    onClose()
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50 vscode-overlay-background">
      <div className="bg-[var(--vscode-editor-background)] border border-[var(--vscode-editorWidget-border)] p-6 rounded-lg text-[var(--vscode-editor-foreground)] w-96 flex flex-col gap-4">
        <h2 className="text-xl mb-4">AI를 추가해주세요</h2>
        <label>브랜드 선택</label>
        <select
          className="w-full"
          value={BrandType.Anthropic}
          onChange={(e) => {
            setBrandModal(e.target.value)
          }}>
          {Object.values(BrandType).map((brand) => (
            <option
              key={brand}
              value={brand}>
              {brand}
            </option>
          ))}
        </select>
        <label>API Key</label>
        <input
          className="w-full p-2 mb-4 bg-gray-800 border border-gray-600"
          placeholder="AI Key ID"
          value={apiKeyModal}
          onChange={(e) => setApiKeyModal(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-600 px-4 py-1"
            onClick={onClose}>
            취소
          </button>
          <button
            className="bg-blue-600 px-4 py-1"
            onClick={handleSubmit}>
            등록하기
          </button>
        </div>
      </div>
    </div>
  )
}
