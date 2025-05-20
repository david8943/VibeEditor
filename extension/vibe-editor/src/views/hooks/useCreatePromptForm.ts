import { useEffect, useMemo, useRef } from 'react'
import {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormReset,
  UseFormSetValue,
  UseFormWatch,
  useForm,
} from 'react-hook-form'

import { CreatePrompt, EditPrompt } from '../../types/template'

interface UseCreatePromptFormProps {
  defaultPrompt: CreatePrompt | null
  createPrompt: (data: CreatePrompt) => void
}

interface UseCreatePromptFormReturn {
  formMethods: {
    register: UseFormRegister<EditPrompt>
    handleSubmit: UseFormHandleSubmit<EditPrompt>
    reset: UseFormReset<EditPrompt>
    setValue: UseFormSetValue<EditPrompt>
    watch: UseFormWatch<EditPrompt>
    formState: { errors: FieldErrors<EditPrompt> }
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
  // 이전 defaultPrompt 값을 저장하기 위한 ref
  const prevDefaultPromptRef = useRef<CreatePrompt | null>(null)

  const setDefaultValues = (defaultPrompt: CreatePrompt | null): EditPrompt => {
    console.log('useCreatePromptForm setDefaultValues', defaultPrompt)
    if (!defaultPrompt) return {} as EditPrompt
    return {
      templateId: defaultPrompt.templateId,
      promptName: defaultPrompt.promptName,
      postType: defaultPrompt.postType,
      comment: defaultPrompt.comment,
      notionDatabaseId: defaultPrompt.notionDatabaseId,
      userAIProviderId: defaultPrompt.userAIProviderId,
      snapshots: [],
      options: {},
    }
  }

  // defaultValues를 useMemo로 감싸서 불필요한 재계산 방지
  const defaultValues = useMemo(
    () => setDefaultValues(defaultPrompt),
    [defaultPrompt],
  )

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EditPrompt>({
    defaultValues,
  })

  // defaultPrompt가 변경될 때만 실행되도록 수정
  useEffect(() => {
    if (
      defaultPrompt &&
      JSON.stringify(prevDefaultPromptRef.current) !==
        JSON.stringify(defaultPrompt)
    ) {
      console.log('defaultPrompt changed, rolling back to:', defaultPrompt)
      const newDefaultValues = setDefaultValues(defaultPrompt)
      reset(newDefaultValues)
      prevDefaultPromptRef.current = defaultPrompt
    }
  }, [defaultPrompt])

  const editPromptToCreatePrompt = (editPrompt: EditPrompt): CreatePrompt => {
    console.log('editPromptToCreatePrompt - editPrompt:', editPrompt)
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
      userAIProviderId: defaultPrompt?.userAIProviderId ?? null,
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
      reset,
      formState: { errors },
    },
    onSubmit,
    handlePost: null,
    defaultValues,
    editPromptToCreatePrompt,
    setDefaultValues,
  }
}
