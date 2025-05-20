import React, { useEffect, useRef, useState } from 'react'

import { Database } from '../../../../types/database'
import { MessageType } from '../../../../types/webview'
import { InfoToolTip } from '../../common/InfoToolTip'

interface Props {
  selectedId: number
  onChange: (id: number) => void
  getDatabases: () => void
  onAddClick: () => void
}

export const DBSelector: React.FC<Props> = ({
  selectedId,
  onChange,
  getDatabases,
  onAddClick,
}) => {
  const [dbList, setDbList] = useState<Database[]>([])
  const [hovered, setHovered] = useState<number>(0)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getDatabases()
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      if (message.type === MessageType.GET_DATABASE) {
        setDbList(message.payload)
      } else if (message.type === MessageType.DATABASE_DELETED) {
        const { notionDatabaseId } = message.payload
        setDbList((prev) =>
          prev.filter((db) => db.notionDatabaseId !== notionDatabaseId),
        )
        if (selectedId === notionDatabaseId) onChange(0)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const selectedDB = dbList.find((db) => db.notionDatabaseId === selectedId)
  useEffect(() => {
    if (selectedId == 0 && dbList.length > 0) {
      onChange(dbList[0].notionDatabaseId)
    }
  }, [selectedId, dbList])
  return (
    <div
      className="form-group relative"
      ref={containerRef}>
      <div className="flex justify-between items-center">
        <div className="flex">
          <label
            htmlFor="notionDatabase"
            className="text-sm font-medium mr-1">
            Notion 데이터베이스
          </label>
          <InfoToolTip description="데이터베이스는 등록된 notion private api와 연동된 상태여야 합니다." />
        </div>
        <button
          type="button"
          className="small-square-button"
          onClick={onAddClick}>
          +
        </button>
      </div>
      {dbList && (
        <select
          value={selectedId}
          onChange={(e) => {
            const value = parseInt(e.target.value)
            onChange(value)
          }}>
          {dbList.map((ai) => (
            <option
              value={ai.notionDatabaseId}
              key={ai.notionDatabaseId}
              className={`flex justify-between items-center px-3 py-2 cursor-pointer
                ${
                  selectedId === ai.notionDatabaseId
                    ? 'bg-[var(--vscode-list-activeSelectionBackground)] text-[var(--vscode-list-activeSelectionForeground)]'
                    : hovered === ai.notionDatabaseId
                      ? 'bg-[var(--vscode-list-hoverBackground)]'
                      : ''
                }`}>
              <span>{ai.notionDatabaseName}</span>
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
