import React from 'react'

import InfoIcon from '@/assets/icons/info.svg'

interface InfoToolTipProps {
  description: string
}

export const InfoToolTip = ({ description }: InfoToolTipProps) => {
  return (
    <div className="relative group">
      <div className="flex items-center">
        <InfoIcon
          width={24}
          height={24}
          className="text-[var(--vscode-foreground)]"
        />
      </div>
      <div className="absolute left-0 top-full mt-2 p-2 bg-gray-800 text-white text-sm rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 w-64">
        {description}
      </div>
    </div>
  )
}
