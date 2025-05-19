'use client'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import { useRouter } from 'next/navigation'

import { TitleHeaderLayout } from '@/components'
import { InputBox } from '@/components'
import { useAppSelector } from '@/hooks/useAppSelector'
import { setSignUpName } from '@/store/slices/authSlice'
import { ButtonVariant } from '@/types/ui'

interface SignupForm {
  userName: string
}

export function SignUpNamePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const dispatch = useDispatch()
  const signUp = useAppSelector((state) => state.auth.signUpRequest)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>({
    defaultValues: {
      userName: signUp.userName || '',
    },
  })

  const currentName = watch('userName')

  const onSubmit = async (data: SignupForm) => {
    dispatch(setSignUpName(data.userName))
    router.push('/auth/signup/provider')
  }

  return (
    <TitleHeaderLayout
      header={t('signUp.name.title')}
      onClick={handleSubmit(onSubmit)}
      buttonVariant={currentName ? ButtonVariant.next : ButtonVariant.disabled}>
      <InputBox
        label={t('signUp.name.label')}
        id="userName"
        type="text"
        error={errors.userName}
        placeholder={t('signUp.name.placeholder')}
        {...register('userName', {
          required: t('signUp.name.error.required'),
          minLength: {
            value: 2,
            message: t('signUp.name.error.minLength'),
          },
        })}
      />
    </TitleHeaderLayout>
  )
}
