import React, { useEffect, useState } from 'react'

import { CreateDatabase, Database } from '../../../../types/database'

interface Props {
  saveDatabase: (database: CreateDatabase) => void
  onClose: () => void
}

export const DatabaseModal: React.FC<Props> = ({ onClose, saveDatabase }) => {
  const [notionDatabaseName, setNotionDatabaseName] = useState('')
  const [notionDatabaseModalUid, setNotionDatabaseModalUid] = useState('')

  const handleSubmit = () => {
    console.log('[DBModal] window.vscode =', window.vscode)

    const database: CreateDatabase = {
      notionDatabaseName: notionDatabaseName,
      notionDatabaseUid: notionDatabaseModalUid,
    }
    saveDatabase(database)
    onClose()
  }

  const handleNotionDatabaseUidChange = (value: string) => {
    if (value.length < 32) {
      setNotionDatabaseModalUid(value)
      return
    }
    const cleanValue = value.replace(/\s+/g, '')
    if (cleanValue.includes('notion.so')) {
      const urlPattern = /notion\.so\/(?:[^-]*-)?([a-f0-9]{32})\?/
      const match = cleanValue.match(urlPattern)
      if (match && match[1]) {
        setNotionDatabaseModalUid(match[1])
      }
    } else if (cleanValue.length === 32 && /^[a-f0-9]{32}$/.test(cleanValue)) {
      setNotionDatabaseModalUid(cleanValue)
    }
  }
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50 vscode-overlay-background">
      <div className="bg-[var(--vscode-editor-background)] border border-[var(--vscode-editorWidget-border)] p-6 rounded-lg text-[var(--vscode-editor-foreground)] w-96">
        <h2 className="text-xl mb-4">데이터베이스를 등록해주세요</h2>
        <label>
          해당 노션 링크를 붙여넣거나, 데이터베이스 아이디를 입력해주세요. 해당
          데이터베이스는 등록된 notion private api와 연동된 상태여야 합니다.
        </label>
        <input
          className="w-full p-2 mb-2 bg-gray-800 border border-gray-600"
          placeholder="데이터베이스 이름"
          value={notionDatabaseName}
          onChange={(e) => setNotionDatabaseName(e.target.value)}
        />
        <input
          className="w-full p-2 mb-4 bg-gray-800 border border-gray-600"
          placeholder="데이터베이스 ID"
          value={notionDatabaseModalUid}
          onChange={(e) => handleNotionDatabaseUidChange(e.target.value)}
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
