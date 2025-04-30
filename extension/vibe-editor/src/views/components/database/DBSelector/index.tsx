import React, { useEffect, useState } from 'react'

interface Database {
  databaseId: number
  databaseName: string
  databaseUid: string
}

interface Props {
  selectedId: string
  onChange: (id: string) => void
}

export const DBSelector: React.FC<Props> = ({ selectedId, onChange }) => {
  const [dbList, setDbList] = useState<Database[]>([])

  useEffect(() => {
    window.vscode.postMessage({ command: 'getDatabases' })

    const handleMessage = (event: MessageEvent) => {
      if (event.data.command === 'setDatabases') {
        setDbList(event.data.payload)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

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
    </div>
  )
}
