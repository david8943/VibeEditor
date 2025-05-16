import { useEffect } from 'react'
import {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormReset,
  UseFormSetValue,
  UseFormWatch,
  useForm,
} from 'react-hook-form'

import { EditPrompt, Prompt, SubmitPrompt } from '../../types/template'

interface UsePromptFormProps {
  defaultPrompt: Prompt | null
  generatePost: (data: Prompt) => void
  submitPrompt: (data: Prompt) => void
  selectedPromptId: number
}

interface UsePromptFormReturn {
  formMethods: {
    register: UseFormRegister<EditPrompt>
    handleSubmit: UseFormHandleSubmit<EditPrompt>
    watch: UseFormWatch<EditPrompt>
    reset: UseFormReset<EditPrompt>
    setValue: UseFormSetValue<EditPrompt>
    formState: { errors: FieldErrors<EditPrompt> }
  }
  onSubmit: (data: EditPrompt) => void
  handlePost: () => void
  defaultValues: EditPrompt
  editPromptToSubmitPrompt: (editPrompt: EditPrompt) => SubmitPrompt
  setDefaultValues: (defaultPrompt: Prompt | null) => EditPrompt
}

export const useUpdatePromptForm = ({
  defaultPrompt,
  submitPrompt,
  generatePost,
  selectedPromptId,
}: UsePromptFormProps): UsePromptFormReturn => {
  const setDefaultValues = (defaultPrompt: Prompt | null): EditPrompt => {
    if (!defaultPrompt) return {} as EditPrompt
    console.log('setDefaultValues', defaultPrompt)
    const editPrompt: EditPrompt = {
      templateId: defaultPrompt.templateId,
      promptName: defaultPrompt.promptName,
      postType: defaultPrompt.postType,
      comment: defaultPrompt.comment,
      notionDatabaseId: defaultPrompt.notionDatabaseId,
      snapshots:
        defaultPrompt.promptAttachList?.map((attach) => ({
          attachId: attach.attachId,
          snapshotId: attach.snapshotId,
          description: attach.description,
          snapshotContent: '',
          snapshotName: '',
        })) ?? [],
      options: {},
      userAIProviderId: defaultPrompt.userAIProviderId,
    }
    return editPrompt
  }

  const defaultValues = setDefaultValues(defaultPrompt)

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

  useEffect(() => {
    if (selectedPromptId) {
      const newDefaultValues = setDefaultValues(defaultPrompt)
      reset(newDefaultValues)
    }
  }, [selectedPromptId, reset])

  const editPromptToPrompt = (editPrompt: EditPrompt): Prompt => {
    return {
      promptId: defaultPrompt?.promptId ?? 0,
      parentPrompt: {
        parentPromptId: defaultPrompt?.parentPrompt?.parentPromptId ?? 0,
        parentPromptName: defaultPrompt?.parentPrompt?.parentPromptName ?? '',
      },
      templateId: defaultPrompt?.templateId ?? 0,
      promptName: editPrompt.promptName,
      postType: editPrompt.postType,
      comment: editPrompt.comment,
      promptAttachList: editPrompt.snapshots.map((snapshot) => ({
        attachId: null,
        snapshotId: snapshot.snapshotId,
        description: snapshot.description,
      })),
      promptOptionList: Object.values(editPrompt.options)
        .flat()
        .filter((option) => option.isSelected)
        .map((option) => option.optionId),
      notionDatabaseId: defaultPrompt?.notionDatabaseId ?? 0,
      userAIProviderId: editPrompt.userAIProviderId,
    }
  }

  const editPromptToSubmitPrompt = (editPrompt: EditPrompt): SubmitPrompt => {
    const { ...submitPrompt } = editPromptToPrompt(editPrompt)
    return submitPrompt
  }

  const onSubmit = (data: EditPrompt) => {
    console.log('onSubmit', data)
    const prompt = editPromptToPrompt(data)
    submitPrompt(prompt)
  }

  const handlePost = () => {
    const formData = editPromptToPrompt(watch())
    generatePost(formData)
  }

  return {
    formMethods: {
      register,
      handleSubmit,
      watch,
      reset,
      setValue,
      formState: { errors },
    },
    onSubmit,
    handlePost,
    defaultValues,
    editPromptToSubmitPrompt,
    setDefaultValues,
  }
}
