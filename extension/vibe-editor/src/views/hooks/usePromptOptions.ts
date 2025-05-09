import { useCallback, useMemo } from 'react'
import { UseFormSetValue } from 'react-hook-form'

import { EditOptionList, EditPrompt, Option } from '../../types/template'

interface UsePromptOptionsProps {
  optionList: Option[]
  promptOptionList: number[]
  setValue: UseFormSetValue<EditPrompt>
}

interface UsePromptOptionsReturn {
  options: EditOptionList
  handleOption: (optionName: string, optionId: number) => void
}

export const usePromptOptions = ({
  optionList,
  promptOptionList,
  setValue,
}: UsePromptOptionsProps): UsePromptOptionsReturn => {
  const options = useMemo(() => {
    const editOptionList: EditOptionList = {}
    optionList.map((option) => {
      editOptionList[option.optionName] = option.optionItems.map((option) => ({
        ...option,
        isSelected: promptOptionList.includes(option.optionId),
      }))
    })
    return editOptionList
  }, [optionList, promptOptionList])

  const handleOption = useCallback(
    (optionName: string, optionId: number) => {
      const currentOptions = options[optionName]
      const updatedOptions = currentOptions.map((option) => ({
        ...option,
        isSelected:
          option.optionId === optionId ? !option.isSelected : option.isSelected,
      }))
      setValue('options', {
        ...options,
        [optionName]: updatedOptions,
      })
    },
    [options, setValue],
  )

  return {
    options,
    handleOption,
  }
}
