import { useCallback, useEffect, useMemo, useState } from 'react'
import { UseFormSetValue, UseFormWatch } from 'react-hook-form'

import { EditOptionList, EditPrompt, Option } from '../../types/template'

interface UsePromptOptionsProps {
  optionList: Option[]
  promptOptionList: number[]
  setValue: UseFormSetValue<EditPrompt>
  watch: UseFormWatch<EditPrompt>
}

interface UsePromptOptionsReturn {
  options: EditOptionList
  handleOption: (optionName: string, optionId: number) => void
}

export const usePromptOptions = ({
  optionList,
  promptOptionList,
  setValue,
  watch,
}: UsePromptOptionsProps): UsePromptOptionsReturn => {
  const [localOptions, setLocalOptions] = useState<EditOptionList>(() => {
    const editOptionList: EditOptionList = {}
    optionList.forEach((option) => {
      editOptionList[option.optionName] = option.optionItems.map((item) => ({
        ...item,
        isSelected: promptOptionList.includes(item.optionId),
      }))
    })
    return editOptionList
  })

  useEffect(() => {
    const editOptionList: EditOptionList = {}
    optionList.forEach((option) => {
      editOptionList[option.optionName] = option.optionItems.map((item) => ({
        ...item,
        isSelected: promptOptionList.includes(item.optionId),
      }))
    })
    setLocalOptions(editOptionList)
  }, [optionList, promptOptionList])

  const options = useMemo(() => {
    return localOptions
  }, [localOptions])

  const handleOption = useCallback(
    (optionName: string, optionId: number) => {
      const currentOptions = localOptions[optionName]
      const updatedOptions = currentOptions.map((option) => ({
        ...option,
        isSelected: option.optionId === optionId,
      }))
      setLocalOptions({
        ...localOptions,
        [optionName]: updatedOptions,
      })
    },
    [localOptions],
  )

  return {
    options,
    handleOption,
  }
}
