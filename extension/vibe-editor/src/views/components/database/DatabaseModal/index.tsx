import React, { useState } from 'react'

import { CreateDatabase, Database } from '../../../../types/database'

interface Props {
  saveDatabase: (database: CreateDatabase) => void
  onClose: () => void
}

export const DatabaseModal: React.FC<Props> = ({ onClose, saveDatabase }) => {
  const [notionDatabaseName, setNotionDatabaseName] = useState('')
  const [notionDatabaseUid, setNotionDatabaseUid] = useState('')

  const handleSubmit = () => {
    console.log('[DBModal] window.vscode =', window.vscode)
    const now = Date.now().toString()

    const database: CreateDatabase = {
      notionDatabaseName: notionDatabaseName,
      notionDatabaseUid: notionDatabaseUid,
    }
    saveDatabase(database)
    onClose()
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/60 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg text-white w-96">
        <h2 className="text-xl mb-4">데이터베이스를 등록해주세요</h2>
        <input
          className="w-full p-2 mb-2 bg-gray-800 border border-gray-600"
          placeholder="데이터베이스 이름"
          value={notionDatabaseName}
          onChange={(e) => setNotionDatabaseName(e.target.value)}
        />
        <input
          className="w-full p-2 mb-4 bg-gray-800 border border-gray-600"
          placeholder="데이터베이스 ID"
          value={notionDatabaseUid}
          onChange={(e) => setNotionDatabaseUid(e.target.value)}
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
