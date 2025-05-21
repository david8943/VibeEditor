import React, { useEffect, useRef, useState } from 'react'

import { AIProvider } from '../../../../types/ai'
import { MessageType } from '../../../../types/webview'
import { InfoToolTip } from '../../common/InfoToolTip'

interface Props {
  selectedId: number
  onChange: (id: number) => void
  getAIProviders: () => void
  onAddClick: () => void
}

export const AIProviderSelector: React.FC<Props> = ({
  selectedId,
  onChange,
  getAIProviders,
  onAddClick,
}) => {
  const [aiList, setAiList] = useState<AIProvider[]>([])
  const [hovered, setHovered] = useState<number>(0)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getAIProviders()
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      if (message.type === MessageType.GET_AI_PROVIDERS) {
        setAiList(message.payload)
      } else if (message.type === MessageType.AI_PROVIDERS_LOADED) {
        setAiList(message.payload)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    getAIProviders()
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      if (message.type === MessageType.GET_AI_PROVIDERS) {
        setAiList(message.payload)
      } else if (message.type === MessageType.AI_PROVIDERS_LOADED) {
        setAiList(message.payload)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (aiList.length == 0) {
      return
    }
    let ai = aiList[0]
    if (selectedId) {
      ai = aiList.find((ai) => ai.userAIProviderId === selectedId) ?? ai
    } else {
      onChange(ai.userAIProviderId)
    }
    setSelectedAI(ai)
  }, [selectedId, aiList])

  const [selectedAI, setSelectedAI] = useState<AIProvider | null>(null)

  return (
    <div
      className="form-group relative"
      ref={containerRef}>
      <div className="flex justify-between items-center">
        <div className="flex">
          <label
            htmlFor="aiProvider"
            className="text-sm font-medium mr-1">
            AI 종류
          </label>
          <InfoToolTip description="AI를 선택하지 않을 경우 포스트가 생성되지 않습니다." />
        </div>
        <button
          type="button"
          className="small-square-button"
          onClick={onAddClick}>
          +
        </button>
      </div>
      {aiList && (
        <select
          value={selectedId}
          onChange={(e) => {
            const value = parseInt(e.target.value)
            onChange(value)
          }}>
          {aiList.map((ai) => (
            <option
              value={ai.userAIProviderId}
              key={ai.userAIProviderId}
              className={`flex justify-between items-center px-3 py-2 cursor-pointer
                ${
                  selectedId === ai.userAIProviderId
                    ? 'bg-[var(--vscode-list-activeSelectionBackground)] text-[var(--vscode-list-activeSelectionForeground)]'
                    : hovered === ai.userAIProviderId
                      ? 'bg-[var(--vscode-list-hoverBackground)]'
                      : ''
                }`}>
              <span>
                {ai.model}
                {ai.isDefault && ' (기본 제공)'}
              </span>
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
