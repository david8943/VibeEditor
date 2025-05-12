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

import { EditPrompt, Prompt, UpdatePrompt } from '../../types/template'

interface UsePromptFormProps {
  defaultPrompt: Prompt | null
  submitPrompt: (data: Prompt) => void
  updatePrompt: (data: UpdatePrompt) => void
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
  handlePost: (() => void) | null
  defaultValues: EditPrompt
  editPromptToPrompt: (editPrompt: EditPrompt) => Prompt
  editPromptToUpdatePrompt: (editPrompt: EditPrompt) => UpdatePrompt
  setDefaultValues: (defaultPrompt: Prompt | null) => EditPrompt
}

export const useUpdatePromptForm = ({
  defaultPrompt,
  submitPrompt,
  updatePrompt,
}: UsePromptFormProps): UsePromptFormReturn => {
  const setDefaultValues = (defaultPrompt: Prompt | null): EditPrompt => {
    if (!defaultPrompt) return {} as EditPrompt
    console.log('setDefaultValues', defaultPrompt)
    const editPrompt: EditPrompt = {
      promptId: defaultPrompt.promptId,
      templateId: defaultPrompt.templateId,
      promptName: defaultPrompt.promptName,
      postType: defaultPrompt.postType,
      comment: defaultPrompt.comment,
      snapshots:
        defaultPrompt.promptAttachList?.map((attach) => ({
          attachId: attach.attachId,
          snapshotId: attach.snapshotId,
          description: attach.description,
          snapshotContent: '',
          snapshotName: '',
        })) ?? [],
      options: {},
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
    if (defaultPrompt?.promptId) {
      const newDefaultValues = setDefaultValues(defaultPrompt)
      reset(newDefaultValues)
    }
  }, [defaultPrompt?.promptId, reset])

  const editPromptToPrompt = (editPrompt: EditPrompt): Prompt => {
    return {
      parentPrompt: null,
      templateId: defaultPrompt?.templateId ?? 0,
      promptId: defaultPrompt?.promptId ?? 0,
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
    }
  }

  const editPromptToUpdatePrompt = (editPrompt: EditPrompt): UpdatePrompt => {
    const { promptId, parentPrompt, ...updatePrompt } =
      editPromptToPrompt(editPrompt)
    return updatePrompt
  }

  const onSubmit = (data: EditPrompt) => {
    console.log('onSubmit', data)
    if (defaultPrompt?.promptId) {
      const prompt = editPromptToUpdatePrompt(data)
      updatePrompt(prompt)
    }
  }

  const handlePost = () => {
    const formData = editPromptToPrompt(watch())
    console.log('handlePost', formData)
    submitPrompt(formData)
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
    editPromptToPrompt,
    editPromptToUpdatePrompt,
    setDefaultValues,
  }
}
