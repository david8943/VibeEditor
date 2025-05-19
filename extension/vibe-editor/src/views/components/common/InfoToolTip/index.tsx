import React from 'react'

import InfoIcon from '@/assets/icons/info.svg'

interface InfoToolTipProps {
  description: string
  size?: number
  isWhite?: boolean
}

export const InfoToolTip = ({
  description,
  size = 16,
  isWhite = false,
}: InfoToolTipProps) => {
  return (
    <div className="relative group">
      <div className="flex items-center">
        <InfoIcon
          width={size}
          height={size}
          className={`z-1 info ${isWhite ? 'white' : 'dark relative top-[1px]'} align-middle`}
        />
      </div>
      <div className="absolute left-0 top-full p-2 infoText text-xs rounded shadow-lg opacity-50 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-64">
        {description}
      </div>
    </div>
  )
}
