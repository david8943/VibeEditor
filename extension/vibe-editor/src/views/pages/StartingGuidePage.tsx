import React, { useEffect, useMemo, useState } from 'react'

import CheckIcon from '@/assets/icons/check.svg'
import CheckListIcon from '@/assets/icons/checklist.svg'
import LightBulbEmptyIcon from '@/assets/icons/lightbulb-empty.svg'
import LightBulbIcon from '@/assets/icons/lightbulb.svg'

import { AIProvider } from '../../types/ai'
import { CreateDatabase } from '../../types/database'
import { Database } from '../../types/database'
import type { Option } from '../../types/template'
import { User } from '../../types/user'
import { MessageType, WebviewPageProps } from '../../types/webview'
import { formatTime } from '../../utils/formatTime'
import { AIProviderModal } from '../components/aiProvider/AIProviderModal'
import { AIProviderSelector } from '../components/aiProvider/AIProviderSelector'
import { InfoToolTip } from '../components/common/InfoToolTip'
import { DBSelector } from '../components/database/DBSelector'
import { DatabaseModal } from '../components/database/DatabaseModal'

export function StartingGuidePage({
  postMessageToExtension,
}: WebviewPageProps) {
  const [loginStatus, setLoginStatus] = useState(false)
  const [user, setUser] = useState<User>({
    notionActive: false,
    lastLoginAt: '',
    updatedAt: '',
    createdAt: '',
  })
  const [showDbModal, setShowDbModal] = useState(false)
  const [selectedDbId, setSelectedDbId] = useState(0)
  const [showAIProviderModal, setShowAIProviderModal] = useState(false)

  const [isLogin, setIsLogin] = useState(false)
  const [isNotionSecretKey, setIsNotionSecretKey] = useState(false)
  const [isNotionDatabase, setIsNotionDatabase] = useState(false)
  const [isProject, setIsProject] = useState(false)
  const [isSnapshot, setIsSnapshot] = useState(false)
  const [isPost, setIsPost] = useState(false)
  const [isNotionUpload, setIsNotionUpload] = useState(false)

  const startGuideList = [
    {
      id: 'isLogin',
      title: '로그인 ',
      icon: <LightBulbEmptyIcon />,
      description: '로그인 후 스타트 가이드를 진행합니다.',
    },
    {
      id: 'isNotionSecretKey',
      title: '노션 시크릿 키 등록 ✅',
      icon: <LightBulbEmptyIcon />,
      description: '스타트 가이드 노션 키 등록 후 스타트 가이드를 진행합니다.',
    },
    {
      id: 'isNotionDatabase',
      title: '노션 데이터 베이스 등록 ✅',
      icon: <LightBulbEmptyIcon />,
      description: '노션 데이터 베이스 등록 후 스타트 가이드를 진행합니다.',
    },
    {
      id: 'isProject',
      title: '프로젝트 생성 ✅',
      icon: <LightBulbEmptyIcon />,
      description: '프로젝트 생성 후 스타트 가이드를 진행합니다.',
    },
    {
      id: 'isSnapshot',
      title: '스냅 샷 추가 ✅',
      icon: <LightBulbEmptyIcon />,
      description: '스냅 샷 추가 후 스타트 가이드를 진행합니다.',
    },
    {
      id: 'isPost',
      title: '해당 템플릿으로 AI 포스트 생성 ✅',
      icon: <LightBulbEmptyIcon />,
      description:
        '해당 템플릿으로 AI 포스트 생성 후 스타트 가이드를 진행합니다.',
    },
    {
      id: 'isNotionUpload',
      title: '포스트 노션 업로드✅',
      icon: <LightBulbEmptyIcon />,
      description: '포스트 노션 업로드 후 스타트 가이드를 진행합니다.',
    },
  ]
  useEffect(() => {
    postMesasgeTypeToExtension(MessageType.GET_LOGIN_STATUS)
  }, [])

  const saveDatabase = (database: CreateDatabase) =>
    postMessageToExtension({
      type: MessageType.SAVE_DATABASE,
      payload: database,
    })

  const getDatabases = () =>
    postMesasgeTypeToExtension(MessageType.GET_DATABASE)

  useEffect(() => {
    if (loginStatus) {
      postMesasgeTypeToExtension(MessageType.GET_USER)
    }
  }, [loginStatus])

  const computedUser = useMemo(() => {
    if (user) {
      return {
        ...user,
        lastLoginAt: formatTime(user.lastLoginAt),
        createdAt: formatTime(user.createdAt),
        updatedAt: formatTime(user.updatedAt),
      }
    }
  }, [user])

  const postMesasgeTypeToExtension = (type: MessageType) =>
    postMessageToExtension({ type })

  useEffect(() => {
    postMessageToExtension({ type: MessageType.GET_OPTIONS })
    postMessageToExtension({ type: MessageType.GET_CONFIG })
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data

      if (message.type === MessageType.LOGIN_STATUS_LOADED) {
        setLoginStatus(message.payload)
      } else if (message.type === MessageType.USER_LOADED) {
        setUser(message.payload)
      } else if (message.type === MessageType.OPTIONS_LOADED) {
        setOptionList(message.payload)
      } else if (message.type === MessageType.CONFIG_LOADED) {
        setSelectedOptionIds(message.payload.defaultPromptOptionIds ?? [])
        setDefaultPostType(message.payload.defaultPostType ?? 'TECH_CONCEPT')
        setDefaultNotionDatabaseId(message.payload.defaultNotionDatabaseId ?? 0)
      } else if (message.type === MessageType.GET_DATABASE) {
        setNotionDbList(message.payload)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const [optionList, setOptionList] = useState<Option[]>([])
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([])
  const [defaultPostType, setDefaultPostType] = useState('TECH_CONCEPT')
  const [defaultNotionDatabaseId, setDefaultNotionDatabaseId] = useState(0)
  const [notionDbList, setNotionDbList] = useState<Database[]>([])
  const [defaultUserAIProviderId, setDefaultUserAIProviderId] = useState(0)
  const [userAIProviderList, setUserAIProviderList] = useState<AIProvider[]>([])
  useEffect(() => {
    postMessageToExtension({ type: MessageType.GET_DATABASE })
  }, [])

  const statusMap = {
    isLogin,
    isNotionSecretKey,
    isNotionDatabase,
    isProject,
    isSnapshot,
    isPost,
    isNotionUpload,
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4 mb-8 border-b pb-6">
            <div className="text-2xl font-bold flex items-center gap-2 text-gray-800">
              <CheckListIcon className="w-8 h-8 text-blue-600" />
              <span>Vibe Editor 스타팅 가이드</span>
            </div>
            <button
              className="text-base font-medium px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              onClick={() =>
                postMessageToExtension({ type: MessageType.SHOW_README })
              }>
              이용 가이드
            </button>
          </div>
          <div className="space-y-4">
            {startGuideList &&
              startGuideList.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (statusMap[item.id as keyof typeof statusMap]) {
                      postMessageToExtension({
                        type: MessageType.START_GUIDE,
                        payload: item.id,
                      })
                    }
                  }}
                  className={`relative p-4 rounded-lg border transition-all ${
                    statusMap[item.id as keyof typeof statusMap]
                      ? 'bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-800">
                          {item.title}
                        </h3>
                        {statusMap[item.id as keyof typeof statusMap] ? (
                          <CheckIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <InfoToolTip description={item.description} />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
