import React, { useEffect, useMemo, useState } from 'react'

import CheckIcon from '@/assets/icons/check.svg'
import CheckListIcon from '@/assets/icons/checklist.svg'
import LightBulbEmptyIcon from '@/assets/icons/lightbulb-empty.svg'

import { AIProvider } from '../../types/ai'
import { Database } from '../../types/database'
import { StartGuideItem, StartGuideType } from '../../types/startGuide'
import type { Option } from '../../types/template'
import { User } from '../../types/user'
import { MessageType, WebviewPageProps } from '../../types/webview'
import { InfoToolTip } from '../components/common/InfoToolTip'

export function StartGuidePage({ postMessageToExtension }: WebviewPageProps) {
  const [loginStatus, setLoginStatus] = useState(false)
  const [user, setUser] = useState<User>({
    notionActive: false,
    lastLoginAt: '',
    updatedAt: '',
    createdAt: '',
  })

  const [isLogin, setIsLogin] = useState(false)
  const [isNotionSecretKey, setIsNotionSecretKey] = useState(false)
  const [isNotionDatabase, setIsNotionDatabase] = useState(false)
  const [isProject, setIsProject] = useState(false)
  const [isSnapshot, setIsSnapshot] = useState(false)
  const [isPost, setIsPost] = useState(false)
  const [isNotionUpload, setIsNotionUpload] = useState(false)

  const startGuideList: StartGuideItem[] = [
    {
      id: StartGuideType.isLogin,
      title: '로그인 ',
      description: '소셜 로그인 후 스타팅 가이드를 진행합니다.',
    },
    {
      id: StartGuideType.isNotionSecretKey,
      title: 'Notion 프라이빗 API 통합 토큰 등록',
      description:
        'Notion의 프라이빗 API 통합 토큰을 복사해 시크릿 키를 등록해주세요.',
    },
    {
      id: StartGuideType.isNotionDatabase,
      title: 'Notion 데이터 베이스 등록',
      description:
        'Notion 시크릿 키와 연결된 상태인 데이터 베이스를 등록해주세요. ',
    },
    {
      id: StartGuideType.isProject,
      title: '프로젝트 생성',
      description: '템플릿과 스냅샷을 저장할 프로젝트를 생성해주세요.',
    },
    {
      id: StartGuideType.isSnapshot,
      title: '스냅 샷 추가',
      description:
        '프로젝트에 코드, 파일, 디렉토리 구조, 로그 스냅 샷을 추가해주세요.',
    },
    {
      id: StartGuideType.isPost,
      title: '템플릿으로 AI 포스트 생성',
      description: '템플릿을 작성해 AI 포스트를 생성해주세요.',
    },
    {
      id: StartGuideType.isNotionUpload,
      title: '포스트 Notion 업로드',
      description: 'AI 포스트를 확인 후 Notion에 업로드해주세요.',
    },
  ]
  useEffect(() => {
    postMesasgeTypeToExtension(MessageType.GET_LOGIN_STATUS)
  }, [])

  const postMesasgeTypeToExtension = (type: MessageType) =>
    postMessageToExtension({ type })

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      if (message.type === MessageType.LOGIN_STATUS_LOADED) {
        setIsLogin(message.payload)
        postMesasgeTypeToExtension(MessageType.GET_START_GUIDE_DATA)
      } else if (message.type === MessageType.USER_LOADED) {
        // setUser(message.payload)
      } else if (message.type === MessageType.OPTIONS_LOADED) {
        // setOptionList(message.payload)
      } else if (message.type === MessageType.CONFIG_LOADED) {
        // setSelectedOptionIds(message.payload.defaultPromptOptionIds ?? [])
        // setDefaultPostType(message.payload.defaultPostType ?? 'TECH_CONCEPT')
        // setDefaultNotionDatabaseId(message.payload.defaultNotionDatabaseId ?? 0)
      } else if (message.type === MessageType.GET_DATABASE) {
        // setNotionDbList(message.payload)
      } else if (message.type === MessageType.START_GUIDE_LOADED) {
        setIsLogin(message.payload.isLogin)
        setIsNotionSecretKey(message.payload.isNotionSecretKey)
        setIsNotionDatabase(message.payload.isNotionDatabase)
        setIsProject(message.payload.isProject)
        setIsSnapshot(message.payload.isSnapshot)
        setIsPost(message.payload.isPost)
        setIsNotionUpload(message.payload.isNotionUpload)
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
    <div className="min-h-screen w-full py-4">
      <div className="max-w-4xl mx-auto px-2">
        <div className="rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4 mb-8 border-b pb-6">
            <div className="text-xl font-bold flex items-center gap-2">
              <span>Vibe Editor 스타팅 가이드</span>
            </div>
            <button
              className="secondary-button text-base font-medium px-4 py-2 rounded-full transition-colors"
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
                    postMessageToExtension({
                      type: MessageType.START_GUIDE,
                      payload: item.id,
                    })
                  }}
                  className={`relative p-2 rounded-lg border transition-all ${
                    statusMap[item.id as keyof typeof statusMap]
                      ? 'bg-blue-50 border-blue-200 cursor-pointer'
                      : 'bg-gray-50 border-gray-200 cursor-pointer hover:bg-blue-100'
                  }`}>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full  border border-gray-200 text-sm font-medium text-gray-600">
                      {statusMap[item.id as keyof typeof statusMap] ? (
                        <CheckIcon
                          width={16}
                          height={16}
                          className="text-[var(--vscode-foreground)]"
                        />
                      ) : (
                        <InfoToolTip
                          description={item.description}
                          size={16}
                        />
                      )}
                    </div>
                    <div className="flex-grow gap-2">
                      <div className="flex items-center">
                        <div className="text-base font-medium">
                          {item.title}
                        </div>
                      </div>
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
