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

  return (
    <div
      className="form-group relative"
      ref={containerRef}>
      <div className="flex justify-between items-center">
        <div className="flex justify-start items-center">
          <label>Notion 데이터베이스</label>
          <InfoToolTip
            description="해당
          데이터베이스는 등록된 notion private api와 연동된 상태여야 합니다."
          />
        </div>

        <button
          type="button"
          className="small-square-button"
          onClick={onAddClick}>
          +
        </button>
      </div>
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 border rounded bg-[var(--vscode-dropdown-background)] text-[var(--vscode-dropdown-foreground)] cursor-pointer">
        {selectedDB?.notionDatabaseName || '데이터베이스를 선택하세요'}
      </div>
      {open && dbList && dbList?.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto border rounded bg-[var(--vscode-dropdown-background)] shadow-lg">
          {dbList.map((db) => (
            <div
              key={db.notionDatabaseId}
              onMouseEnter={() => setHovered(db.notionDatabaseId)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => {
                onChange(db.notionDatabaseId)
                setOpen(false)
              }}
              className={`flex justify-between items-center px-3 py-2 cursor-pointer
                ${
                  selectedId === db.notionDatabaseId
                    ? 'bg-[var(--vscode-list-activeSelectionBackground)] text-[var(--vscode-list-activeSelectionForeground)]'
                    : hovered === db.notionDatabaseId
                      ? 'bg-[var(--vscode-list-hoverBackground)]'
                      : ''
                }`}>
              <span>{db.notionDatabaseName}</span>
              {/* <button
                onClick={(e) => {
                  e.stopPropagation()
                  window.vscode.postMessage({
                    type: MessageType.REQUEST_DELETE_DATABASE,
                    payload: {
                      notionDatabaseId: db.notionDatabaseId,
                      notionDatabaseName: db.notionDatabaseName,
                    },
                  })
                }}
                className="ml-2 text-sm"
                style={{
                  visibility:
                    hovered === db.notionDatabaseId ? 'visible' : 'hidden',
                }}>
                삭제
              </button> */}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
