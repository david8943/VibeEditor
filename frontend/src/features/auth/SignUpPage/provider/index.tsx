'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import { useRouter } from 'next/navigation'

import { signUp } from '@/apis/auth'
import { InputBox, TitleHeaderLayout } from '@/components'
import { useAppSelector } from '@/hooks/useAppSelector'
import {
  clearSignUp,
  setAccessToken,
  setSignUpProviderName,
  setSignUpProviderUid,
} from '@/store/slices/authSlice'
import { setUser } from '@/store/slices/userSlice'
import { ButtonVariant } from '@/types/ui'

interface SignupForm {
  providerName: string
  providerUid: string
}

export function SignUpProviderPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const dispatch = useDispatch()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>()

  const signUpRequest = useAppSelector((state) => state.auth.signUpRequest)
  const user = useAppSelector((state) => state.user.user)

  const providerName = watch('providerName')
  const providerUid = watch('providerUid')

  useEffect(() => {
    if (user?.id) {
      router.push('/onboarding')
    }
  }, [user, router])

  const isValidProvider =
    providerName.length >= 1 &&
    providerName.length <= 20 &&
    providerUid.length >= 1 &&
    providerUid.length <= 32

  useEffect(() => {
    if (signUpRequest?.providerUid) {
      const handleSignUp = async () => {
        const response = await signUp(signUpRequest)
        await dispatch(clearSignUp())
        if (response) {
          const token = response.headers['authorization']
          await dispatch(setAccessToken(token))
          await dispatch(setUser(response.data.data))
          router.push('/auth/signup/notion')
        }
      }
      handleSignUp()
    }
  }, [signUpRequest?.providerUid, dispatch])

  const onSubmit = async (data: SignupForm) => {
    if (isValidProvider) {
      dispatch(setSignUpProviderName(data.providerName))
      dispatch(setSignUpProviderUid(data.providerUid))
    }
  }

  return (
    <TitleHeaderLayout
      header={t('signUp.password.title')}
      onClick={handleSubmit(onSubmit)}
      buttonVariant={
        isValidProvider ? ButtonVariant.next : ButtonVariant.disabled
      }
      gap="20px">
      <InputBox
        label={t('signUp.providerName.label')}
        id="providerName"
        type="providerName"
        placeholder={t('signUp.providerName.placeholder')}
        {...register('providerName', {
          required: t('signUp.providerName.error.required'),
        })}
      />
      <InputBox
        label={t('signUp.providerUid.label')}
        id="providerUid"
        type="providerUid"
        placeholder={t('signUp.providerUid.placeholder')}
        {...register('providerUid', {
          required: t('signUp.providerUid.error.required'),
        })}
        error={errors.providerUid}
      />
    </TitleHeaderLayout>
  )
}
