import React, { useEffect, useState } from 'react'

import { Database } from '../../../../types/database'
import { MessageType } from '../../../../types/webview'

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

  useEffect(() => {
    getDatabases()

    const handleMessage = (event: MessageEvent) => {
      const message = event.data

      if (
        message.type === 'setDatabases' ||
        message.type === MessageType.GET_DATABASE
      ) {
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
    <div className="form-group">
      <label>노션 데이터베이스</label>
      {/* 셀렉터 박스 */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        style={{
          padding: '8px',
          border: '1px solid var(--vscode-input-border)',
          borderRadius: '4px',
          background: 'var(--vscode-input-background)',
          color: 'var(--vscode-input-foreground)',
          cursor: 'pointer',
        }}>
        {selectedDB?.notionDatabaseName || '데이터베이스를 선택하세요'}
      </div>

      {/* 펼쳐지는 옵션 리스트 */}
      {open && (
        <div
          style={{
            border: '1px solid var(--vscode-input-border)',
            borderRadius: '4px',
            background: 'var(--vscode-input-background)',
            marginTop: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
          }}>
          {dbList.map((db: Database) => (
            <div
              key={db.notionDatabaseId}
              onMouseEnter={() => setHovered(db.notionDatabaseId)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => {
                onChange(db.notionDatabaseId)
                setOpen(false)
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 12px',
                cursor: 'pointer',
                backgroundColor:
                  selectedId === db.notionDatabaseId
                    ? 'var(--vscode-button-background)'
                    : 'transparent',
                color:
                  selectedId === db.notionDatabaseId
                    ? 'var(--vscode-button-foreground)'
                    : 'var(--vscode-input-foreground)',
              }}>
              <span>{db.notionDatabaseName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  window.vscode.postMessage({
                    type: MessageType.REQUEST_DELETE_DATABASE,
                    payload: {
                      notionDatabaseId: db.notionDatabaseUid,
                      notionDatabaseName: db.notionDatabaseName,
                    },
                  })
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--vscode-icon-foreground)',
                  visibility:
                    hovered === db.notionDatabaseId ? 'visible' : 'hidden',
                }}>
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAddClick}
        style={{ marginTop: '0.5rem' }}>
        추가하기
      </button>
    </div>
  )
}
