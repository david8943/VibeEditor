import React, { useEffect, useRef, useState } from 'react'

import { AIProvider } from '../../../../types/ai'
import { MessageType } from '../../../../types/webview'

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

  const selectedAI = aiList.find((ai) => ai.userAIProviderId === selectedId)

  return (
    <div
      className="form-group relative"
      ref={containerRef}>
      <div className="flex justify-between items-center">
        <label>AI 종류</label>
        <button
          type="button"
          className="small-square-button"
          onClick={onAddClick}>
          +
        </button>
      </div>
      <label>AI를 선택하지 않을 경우 포스트가 생성되지 않습니다.</label>
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 border rounded bg-[var(--vscode-dropdown-background)] text-[var(--vscode-dropdown-foreground)] cursor-pointer">
        {selectedAI?.model || 'AI를 선택하세요'}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto border rounded bg-[var(--vscode-dropdown-background)] shadow-lg">
          {aiList.map((ai) => (
            <div
              key={ai.userAIProviderId}
              onMouseEnter={() => setHovered(ai.userAIProviderId)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => {
                onChange(ai.userAIProviderId)
                setOpen(false)
              }}
              className={`flex justify-between items-center px-3 py-2 cursor-pointer
                ${
                  selectedId === ai.userAIProviderId
                    ? 'bg-[var(--vscode-list-activeSelectionBackground)] text-[var(--vscode-list-activeSelectionForeground)]'
                    : hovered === ai.userAIProviderId
                      ? 'bg-[var(--vscode-list-hoverBackground)]'
                      : ''
                }`}>
              <span>{ai.model}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
