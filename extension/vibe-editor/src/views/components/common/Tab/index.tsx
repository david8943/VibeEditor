import React, { useCallback, useMemo } from 'react'

import { Message, MessageType, PageType } from '../../../../types/webview'

interface TabProps {
  currentPage: PageType
  postMessageToExtension: (message: Message) => void
}

export const Tab: React.FC<TabProps> = ({
  currentPage,
  postMessageToExtension,
}) => {
  const tabs = useMemo(
    () => [
      { label: '포스트', value: PageType.POST },
      { label: '스토리', value: PageType.TEMPLATE },
    ],
    [],
  )

  const handleTabClick = useCallback(
    (page: PageType) => {
      postMessageToExtension({
        type: MessageType.NAVIGATE,
        payload: { page },
      })
    },
    [postMessageToExtension],
  )

  return (
    <div className="flex tab space-x-1 border-b border-gray-200 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => handleTabClick(tab.value)}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200
            ${
              currentPage === tab.value
                ? 'text-white selected'
                : 'text-gray-600 hover:bg-gray-100 unselected'
            }`}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}
