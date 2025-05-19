'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import { useRouter } from 'next/navigation'

import { signUp } from '@/apis/auth'
import { addNotionDatabase, registerNotionSecretKey } from '@/apis/notion'
import { InputBox, TitleHeaderLayout } from '@/components'
import { useAppSelector } from '@/hooks/useAppSelector'
import {
  clearSignUp,
  setAccessToken,
  setSignUpNotionDatabaseName,
  setSignUpNotionDatabaseUid,
  setSignUpNotionSecretKey,
} from '@/store/slices/authSlice'
import { setUser } from '@/store/slices/userSlice'
import { ButtonVariant } from '@/types/ui'

interface SignupForm {
  notionSecretKey: string
  notionDatabaseName: string
  notionDatabaseUid: string
}

export function SignUpNotionPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const dispatch = useDispatch()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>()

  const notionRequest = useAppSelector((state) => state.auth.notionRequest)
  const user = useAppSelector((state) => state.user.user)

  const notionSecretKey = watch('notionSecretKey')
  const notionDatabaseName = watch('notionDatabaseName')
  const notionDatabaseUid = watch('notionDatabaseUid')

  useEffect(() => {
    if (user?.id) {
      router.push('/onboarding')
    }
  }, [user, router])

  const isValidProvider =
    notionSecretKey.length >= 1 &&
    notionSecretKey.length <= 20 &&
    notionDatabaseName.length >= 1 &&
    notionDatabaseName.length <= 20 &&
    notionDatabaseUid.length >= 1 &&
    notionDatabaseUid.length <= 32

  useEffect(() => {
    if (
      notionRequest?.notionDatabaseUid &&
      notionRequest?.notionDatabaseName &&
      notionRequest?.notionSecretKey
    ) {
      const handleSignUp = async () => {
        if (notionRequest.notionSecretKey) {
          const success = await registerNotionSecretKey(
            notionRequest.notionSecretKey,
          )
          if (
            success &&
            notionRequest.notionDatabaseName &&
            notionRequest.notionDatabaseUid
          ) {
            const databaseSuccess = await addNotionDatabase({
              notionDatabaseName: notionRequest.notionDatabaseName,
              notionDatabaseUid: notionRequest.notionDatabaseUid,
            })
            if (databaseSuccess) {
              
              // await dispatch(setUser(response.data.data))
              router.push('/auth/signup/notion')
            }
          }
        }
      }
      handleSignUp()
    }
  }, [notionRequest?.notionDatabaseUid, dispatch])

  const onSubmit = async (data: SignupForm) => {
    if (isValidProvider) {
      dispatch(setSignUpNotionSecretKey(data.notionSecretKey))
      dispatch(setSignUpNotionDatabaseName(data.notionDatabaseName))
      dispatch(setSignUpNotionDatabaseUid(data.notionDatabaseUid))
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
        label={t('signUp.notionSecretKey.label')}
        id="notionSecretKey"
        type="notionSecretKey"
        placeholder={t('signUp.notionSecretKey.placeholder')}
        {...register('notionSecretKey', {
          required: t('signUp.notionSecretKey.error.required'),
        })}
      />
      <InputBox
        label={t('signUp.notionDatabaseName.label')}
        id="notionDatabaseName"
        type="notionDatabaseName"
        placeholder={t('signUp.notionDatabaseName.placeholder')}
        {...register('notionDatabaseName', {
          required: t('signUp.notionDatabaseName.error.required'),
        })}
        error={errors.notionDatabaseName}
      />{' '}
      <InputBox
        label={t('signUp.notionDatabaseUid.label')}
        id="notionDatabaseUid"
        type="notionDatabaseUid"
        placeholder={t('signUp.notionDatabaseUid.placeholder')}
        {...register('notionDatabaseUid', {
          required: t('signUp.notionDatabaseUid.error.required'),
        })}
        error={errors.notionDatabaseUid}
      />
    </TitleHeaderLayout>
  )
}
