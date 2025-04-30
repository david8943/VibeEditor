import React, { useEffect, useState } from 'react'

import { Database } from '../../../../types/database'
import { MessageType } from '../../../../types/webview'

interface Props {
  selectedId: string
  onChange: (id: string) => void
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

  useEffect(() => {
    getDatabases()

    const handleMessage = (event: MessageEvent) => {
      console.log('handleMessage DBSelector', event)
      if (event.data.type == 'setDatabases') {
        setDbList(event.data.payload)
      } else if (event.data.type == MessageType.GET_DATABASE) {
        setDbList(event.data.payload)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleAddClick = () => {
    window.vscode.postMessage({ command: 'openDatabaseModal' })
  }

  return (
    <div className="form-group">
      <label>노션 데이터베이스</label>
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}>
        <option value="">선택하세요</option>
        {dbList.map((db) => (
          <option
            key={db.databaseId}
            value={db.databaseUid}>
            {db.databaseName}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onAddClick}
        style={{ marginTop: '0.5rem' }}>
        추가하기
      </button>
    </div>
  )
}
