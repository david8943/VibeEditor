import { useCallback, useEffect, useState } from 'react'
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
  updateFormOptions: () => Promise<EditOptionList>
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

  const handleOption = useCallback((optionName: string, optionId: number) => {
    setLocalOptions((prevOptions) => {
      const currentOptions = prevOptions[optionName]
      const updatedOptions = currentOptions.map((option) => ({
        ...option,
        isSelected: option.optionId === optionId,
      }))
      return {
        ...prevOptions,
        [optionName]: updatedOptions,
      }
    })
  }, [])

  const updateFormOptions = useCallback(async () => {
    await setValue('options', localOptions, { shouldValidate: true })
    return localOptions
  }, [localOptions, setValue])

  return {
    options: localOptions,
    handleOption,
    updateFormOptions,
  }
}
