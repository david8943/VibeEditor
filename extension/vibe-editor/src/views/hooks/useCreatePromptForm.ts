import { useForm } from 'react-hook-form'

import { CreatePrompt, EditPrompt } from '../../types/template'

interface UseCreatePromptFormProps {
  defaultPrompt: CreatePrompt | null
  createPrompt: (data: CreatePrompt) => void
}

interface UseCreatePromptFormReturn {
  formMethods: {
    register: any
    handleSubmit: any
    setValue: any
    watch: any
  }
  onSubmit: (data: EditPrompt) => void
  handlePost: null
  defaultValues: EditPrompt
  editPromptToCreatePrompt: (editPrompt: EditPrompt) => CreatePrompt
  setDefaultValues: (defaultPrompt: CreatePrompt | null) => EditPrompt
}

export const useCreatePromptForm = ({
  defaultPrompt,
  createPrompt,
}: UseCreatePromptFormProps): UseCreatePromptFormReturn => {
  const setDefaultValues = (defaultPrompt: CreatePrompt | null): EditPrompt => {
    console.log('useCreatePromptForm setDefaultValues', defaultPrompt)
    if (!defaultPrompt) return {} as EditPrompt
    return {
      templateId: defaultPrompt.templateId,
      promptName: defaultPrompt.promptName,
      postType: defaultPrompt.postType,
      comment: defaultPrompt.comment,
      notionDatabaseId: defaultPrompt.notionDatabaseId,
      snapshots: [],
      options: {},
    }
  }

  const defaultValues = setDefaultValues(defaultPrompt)

  const { register, handleSubmit, setValue, watch } = useForm<EditPrompt>({
    defaultValues,
  })

  const editPromptToCreatePrompt = (editPrompt: EditPrompt): CreatePrompt => {
    return {
      templateId: defaultPrompt?.templateId ?? 0,
      promptName: editPrompt.promptName,
      postType: editPrompt.postType,
      comment: editPrompt.comment,
      promptAttachList: editPrompt.snapshots.map((snapshot) => ({
        attachId: snapshot.attachId,
        snapshotId: snapshot.snapshotId,
        description: snapshot.description,
      })),
      promptOptionList: Object.values(editPrompt.options)
        .flat()
        .filter((option) => option.isSelected)
        .map((option) => option.optionId),
      notionDatabaseId: defaultPrompt?.notionDatabaseId ?? 0,
      parentPromptId: defaultPrompt?.parentPromptId ?? null,
    }
  }

  const onSubmit = (data: EditPrompt) => {
    console.log('onSubmit', data)
    const prompt = editPromptToCreatePrompt(data)
    createPrompt(prompt)
  }

  return {
    formMethods: {
      register,
      handleSubmit,
      setValue,
      watch,
    },
    onSubmit,
    handlePost: null,
    defaultValues,
    editPromptToCreatePrompt,
    setDefaultValues,
  }
}
