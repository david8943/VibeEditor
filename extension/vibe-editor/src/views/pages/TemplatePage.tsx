import React, { useEffect, useRef, useState } from 'react'
import { DotLoader } from 'react-spinners'

import CreateProjectImage from '../../assets/images/create-project.svg'
import { AIAPIKey } from '../../types/ai'
import { CreateDatabase } from '../../types/database'
import {
  CreatePrompt,
  Option,
  Prompt,
  PromptAttach,
  SubmitPrompt,
  Template,
} from '../../types/template'
import { MessageType, WebviewPageProps } from '../../types/webview'
import { PromptForm, PromptSelector } from '../components'
import { CreatePromptForm } from '../components/template/CreatePromptForm'

export function TemplatePage({ postMessageToExtension }: WebviewPageProps) {
  const [loading, setLoading] = useState(false)
  const [optionList, setOptionList] = useState<Option[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  )
  const [selectedPromptId, setSelectedPromptId] = useState<number>(0)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(0)
  const [createPromptData, setCreatePromptData] = useState<CreatePrompt | null>(
    null,
  )
  const [notionDatabaseId, setNotionDatabaseId] = useState(0)
  const [defaultPostType, setDefaultPostType] = useState<
    'TECH_CONCEPT' | 'TROUBLE_SHOOTING'
  >('TECH_CONCEPT')
  const [defaultPromptOptionIds, setDefaultPromptOptionIds] = useState<
    number[]
  >([])
  const [defaultNotionDatabaseId, setDefaultNotionDatabaseId] = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const initialized = useRef(false)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [defaultUserAIProviderId, setDefaultUserAIProviderId] = useState(0)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    postMessageToExtension({ type: MessageType.GET_TEMPLATE })
    postMessageToExtension({ type: MessageType.GET_OPTIONS })
    postMessageToExtension({ type: MessageType.GET_CONFIG })
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      console.log('템플릿 페이지', message.type, message.payload)
      if (message.type === MessageType.TEMPLATE_SELECTED) {
        console.log('TEMPLATE_SELECTED', message.payload.template)
        setShowOnboarding(false)
        setSelectedTemplate(message.payload.template)
      } else if (message.type === MessageType.OPTIONS_LOADED) {
        setOptionList(message.payload)
      } else if (message.type === MessageType.START_LOADING) {
        setLoading(true)
      } else if (message.type === MessageType.STOP_LOADING) {
        setLoading(false)
      } else if (message.type === MessageType.PROMPT_SELECTED) {
        console.log('PROMPT_SELECTED', message.payload.prompt)
        if (message.payload.prompt) {
          setSelectedPrompt(message.payload.prompt)
          setSelectedPromptId(message.payload.prompt.promptId)
          setNotionDatabaseId(message.payload.prompt.notionDatabaseId)
        }
      } else if (message.type === MessageType.SNAPSHOT_SELECTED) {
        addSnapshotCode(message.payload.snapshot)
      } else if (message.type === MessageType.CONFIG_LOADED) {
        const config = message.payload
        setDefaultPostType(config.defaultPostType)
        setDefaultPromptOptionIds(config.defaultPromptOptionIds)
        setDefaultNotionDatabaseId(config.defaultNotionDatabaseId ?? 0)
        setDefaultUserAIProviderId(message.payload.defaultUserAIProviderId ?? 0)
        setConfigLoaded(true)
      } else if (message.type === MessageType.NAVIGATE) {
        postMessageToExtension({ type: MessageType.GET_TEMPLATE })
        postMessageToExtension({ type: MessageType.GET_OPTIONS })
        postMessageToExtension({ type: MessageType.GET_PROMPT })
      } else if (message.type === MessageType.RESET_CREATE_PROMPT) {
        console.log('리셋2')
        setSelectedPromptId(0)
        // resetCreatePrompt()
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const resetCreatePrompt = () => {
    console.log('resetCreatePrompt')
    setCreatePromptData({
      parentPromptId: null,
      templateId: selectedPromptId,
      promptName: `${selectedTemplate?.templateName}의 새 템플릿`,
      postType: defaultPostType,
      comment: '',
      promptAttachList: [],
      promptOptionList: defaultPromptOptionIds,
      notionDatabaseId: notionDatabaseId,
      userAIProviderId: defaultUserAIProviderId,
    })
  }
  const generatePost = (data: Prompt) => {
    postMessageToExtension({
      type: MessageType.GENERATE_POST,
      payload: data,
    })
  }

  const addSnapshotCode = (data: PromptAttach) => {
    console.log('addSnapshotCode', data)
    console.log('selectedPromptId', selectedPromptId)
    if (selectedPromptId == 0) {
      setCreatePromptData((currentPrompt) => {
        if (!currentPrompt) return currentPrompt
        return {
          ...currentPrompt,
          promptAttachList: [...currentPrompt.promptAttachList, data],
        }
      })
    }
    setSelectedPrompt((currentPrompt) => {
      if (!currentPrompt) return currentPrompt
      const updatedPrompt = {
        ...currentPrompt,
        promptAttachList: [...currentPrompt.promptAttachList, data],
      }
      return updatedPrompt
    })
  }

  const submitPrompt = (data: SubmitPrompt) => {
    const prompt = { ...data, notionDatabaseId }
    postMessageToExtension({
      type: MessageType.SUBMIT_PROMPT,
      payload: {
        prompt: prompt,
        selectedTemplateId: selectedTemplate?.templateId,
        selectedPromptId: selectedPromptId,
      },
    })
  }

  const createPrompt = (data: CreatePrompt) => {
    postMessageToExtension({
      type: MessageType.CREATE_PROMPT,
      payload: {
        prompt: {
          ...data,
          templateId: selectedTemplate?.templateId,
          notionDatabaseId,
        },
        selectedTemplateId: selectedTemplate?.templateId,
        selectedPromptId: selectedPromptId,
      },
    })
  }

  const selectPromptId = (promptId: number) => {
    setSelectedPromptId(promptId)
    if (promptId == 0) {
      setSelectedPrompt(null)
    } else {
      postMessageToExtension({
        type: MessageType.PROMPT_SELECTED,
        payload: {
          promptId: promptId,
          templateId: selectedTemplate?.templateId,
        },
      })
    }
  }

  const deletePrompt = (data: CreatePrompt) => {
    if (selectedTemplate) {
      postMessageToExtension({
        type: MessageType.DELETE_PROMPT,
        payload: {
          templateId: selectedTemplate.templateId,
          promptId: selectedPromptId,
        },
      })
    }
  }

  const saveDatabase = (database: CreateDatabase) => {
    postMessageToExtension({
      type: MessageType.SAVE_DATABASE,
      payload: database,
    })
  }

  const getDatabases = () =>
    postMessageToExtension({
      type: MessageType.GET_DATABASE,
    })

  const getAIProviders = () =>
    postMessageToExtension({
      type: MessageType.GET_AI_PROVIDERS,
    })

  const saveAIProvider = (aiProvider: AIAPIKey) =>
    postMessageToExtension({
      type: MessageType.SAVE_AI_PROVIDER,
      payload: aiProvider,
    })
  const createProject = () =>
    postMessageToExtension({
      type: MessageType.CREATE_TEMPLATE,
    })

  const deleteSnapshot = (attachId: number) => {
    postMessageToExtension({
      type: MessageType.DELETE_SNAPSHOT,
      payload: {
        attachId,
        selectedPromptId,
        selectedTemplateId: selectedTemplate?.templateId,
      },
    })
  }
  useEffect(() => {
    console.log('selectedProjectId', selectedPromptId)
    if (selectedPromptId == 0) {
      console.log('여기서 또 리셋3')
      setSelectedPrompt(null)
    }
  }, [selectedPromptId])

  useEffect(() => {
    if (configLoaded && selectedTemplate) {
      if (selectedTemplateId != selectedTemplate.templateId) {
        console.log('여기서 또 리셋')
        resetCreatePrompt()
        setSelectedTemplateId(selectedTemplate.templateId)
      }
    }
  }, [selectedTemplate, configLoaded])

  useEffect(() => {
    if (selectedPromptId == 0) {
      setNotionDatabaseId(defaultNotionDatabaseId)
    }
  }, [defaultNotionDatabaseId])

  return (
    <div className="app-container items-center justify-center">
      {showOnboarding && (
        <div
          style={{ height: '90vh', width: '90vw' }}
          className="w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="rounded-full p-8 flex items-center justify-center border-2">
              <CreateProjectImage
                width={80}
                height={80}
                className="text-[var(--vscode-foreground)]"
              />
            </div>
            <div className="space-y-3 text-center">
              <h1 className="text-3xl font-bold">프로젝트를 생성해주세요</h1>
              <p className="text-base opacity-75">
                프로젝트 생성 후, 템플릿을 작성할 수 있습니다
              </p>
            </div>
            <button
              className="px-6 py-3 rounded-full text-base font-medium transition-all hover:scale-105 active:scale-100"
              onClick={createProject}>
              프로젝트 생성하기
            </button>
          </div>
        </div>
      )}
      {!showOnboarding && (
        <div className="flex flex-col gap-8">
          <h1 className="text-2xl font-bold whitespace-pre-wrap">
            {selectedPrompt?.promptName ??
              `${selectedTemplate?.templateName}의 새 템플릿`}
          </h1>

          {loading && (
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
              <DotLoader color="var(--vscode-button-background)" />
            </div>
          )}

          <div className="flex flex-col gap-8">
            <PromptSelector
              selectedTemplate={selectedTemplate}
              selectedPromptId={selectedPromptId}
              selectPromptId={selectPromptId}
            />
            {selectedTemplate && selectedPrompt && selectedPromptId != 0 && (
              <PromptForm
                defaultPrompt={selectedPrompt}
                selectedPromptId={selectedPromptId}
                generatePost={generatePost}
                submitPrompt={submitPrompt}
                deleteSnapshot={deleteSnapshot}
                localSnapshots={selectedTemplate.snapshotList || []}
                optionList={optionList}
                defaultPromptOptionIds={defaultPromptOptionIds}
                defaultPostType={defaultPostType}
                saveDatabase={saveDatabase}
                getDatabases={getDatabases}
                getAIProviders={getAIProviders}
                saveAIProvider={saveAIProvider}
              />
            )}
            {createPromptData && selectedTemplate && selectedPromptId == 0 && (
              <CreatePromptForm
                defaultPrompt={createPromptData}
                selectedPromptId={selectedPromptId}
                createPrompt={createPrompt}
                deleteSnapshot={deleteSnapshot}
                localSnapshots={selectedTemplate.snapshotList || []}
                optionList={optionList}
                defaultPromptOptionIds={defaultPromptOptionIds}
                defaultPostType={defaultPostType}
                saveDatabase={saveDatabase}
                getDatabases={getDatabases}
                getAIProviders={getAIProviders}
                saveAIProvider={saveAIProvider}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
